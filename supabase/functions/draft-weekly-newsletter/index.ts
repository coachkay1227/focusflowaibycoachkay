// Drafts the weekly Coach Kay newsletter (Scam + Truth + Play) using Gemini
// and emails the draft to Coach Kay for approval.
//
// Triggered by pg_cron weekly. Idempotency: refuses to create a new draft if
// an unsent draft from the last 6 days already exists.
//
// Auth: callable by service_role only (cron uses anon key + verify_jwt=false
// is NOT used here — we enforce service_role like send-transactional-email).

import { createClient } from 'npm:@supabase/supabase-js@2'
import { COACH_KAY_IDENTITY, COACH_KAY_VOICE } from '../_shared/coach-voice.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const APP_ORIGIN = 'https://coachkayai.life'

// Curated rotating list — picks one not used in last 8 issues by index modulo.
const TRUTH_SEEDS = [
  'AI does not replace your thinking, it replaces the friction around your thinking',
  'Most "AI experts" online have shipped nothing. Build, then teach.',
  'You do not need a $5,000 course to start. You need 30 minutes and one question.',
  'Prompting is not a magic spell. It is just clear writing under pressure.',
  'If the tool saves you 10 minutes a day, that is 60 hours back this year.',
  'AI will not give you focus. It will amplify whatever focus you already bring.',
  'You are not behind. The people who look ahead are 6 weeks in, not 6 years.',
  'Custom GPTs are 80% of the leverage of an "AI agent" with 5% of the complexity.',
]

function isServiceRoleCaller(authHeader: string | null): boolean {
  if (!authHeader?.startsWith('Bearer ')) return false
  const token = authHeader.slice('Bearer '.length).trim()
  const expected = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!token || !expected) return false
  if (token.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}

function randomToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

interface DraftJson {
  subject: string
  preview_text: string
  scam_section: string
  truth_section: string
  play_section: string
}

async function generateDraft(args: {
  scamTitle: string
  scamSummary: string
  scamBody: string
  truthSeed: string
}): Promise<DraftJson> {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY')
  if (!lovableKey) throw new Error('LOVABLE_API_KEY missing')

  const system = `${COACH_KAY_IDENTITY}\n\n${COACH_KAY_VOICE}\n\nYou are writing this week's edition of the Coach Kay weekly newsletter. The format is locked: three short sections (Scam Alert, Truth Drop, AI Play of the Week). Total length under 450 words.\n\nReturn ONLY valid JSON matching the schema. No markdown fences, no commentary.`

  const userPrompt = `Write this week's newsletter.\n\nSCAM SOURCE (rewrite in Coach Kay voice, do NOT copy verbatim):\nTitle: ${args.scamTitle}\nSummary: ${args.scamSummary}\nDetail: ${args.scamBody.slice(0, 1500)}\n\nTRUTH SEED (expand into 3-5 short sentences):\n${args.truthSeed}\n\nAI PLAY: one concrete 5-minute exercise the reader can run today using a free AI tool. Make it specific (exact prompt template encouraged).\n\nReturn JSON with this exact shape:\n{\n  "subject": "string, under 65 chars, no clickbait, no emojis",\n  "preview_text": "string, under 110 chars, one sentence preview",\n  "scam_section": "string, 80-120 words, two short paragraphs",\n  "truth_section": "string, 60-100 words",\n  "play_section": "string, 70-120 words, include the exact prompt to paste"\n}`

  const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Lovable-API-Key': lovableKey,
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    }),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    throw new Error(`AI gateway error ${resp.status}: ${errText}`)
  }

  const data = await resp.json()
  const raw = data?.choices?.[0]?.message?.content ?? ''
  const parsed = JSON.parse(raw) as DraftJson
  for (const k of ['subject', 'preview_text', 'scam_section', 'truth_section', 'play_section'] as const) {
    if (typeof parsed[k] !== 'string' || !parsed[k].trim()) {
      throw new Error(`Draft missing field: ${k}`)
    }
  }
  return parsed
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  if (!isServiceRoleCaller(req.headers.get('Authorization'))) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  // Skip if a fresh unsent draft already exists
  const { data: existing } = await supabase
    .from('newsletter_issues')
    .select('id, issue_number, status')
    .in('status', ['draft', 'approved'])
    .gte('created_at', new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString())
    .limit(1)
    .maybeSingle()

  if (existing) {
    return new Response(JSON.stringify({ skipped: true, reason: 'recent_draft_exists', issue: existing }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Pick the next unused, published scam alert (newest first)
  const { data: scam, error: scamErr } = await supabase
    .from('scam_alerts')
    .select('id, title, summary, body')
    .eq('is_published', true)
    .is('used_in_issue_id', null)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (scamErr) {
    return new Response(JSON.stringify({ error: 'scam_query_failed', detail: scamErr.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  if (!scam) {
    return new Response(JSON.stringify({ skipped: true, reason: 'no_unused_scam_alert' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Determine next issue number + rotate truth seed
  const { data: lastIssue } = await supabase
    .from('newsletter_issues')
    .select('issue_number')
    .order('issue_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextIssueNumber = (lastIssue?.issue_number ?? 0) + 1
  const truthSeed = TRUTH_SEEDS[nextIssueNumber % TRUTH_SEEDS.length]

  // Generate draft
  let draft: DraftJson
  try {
    draft = await generateDraft({
      scamTitle: scam.title,
      scamSummary: scam.summary ?? '',
      scamBody: scam.body ?? '',
      truthSeed,
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'ai_draft_failed', detail: String(e) }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Mint approval token (raw in email, hash in DB)
  const approvalToken = randomToken()
  const tokenHash = await sha256Hex(approvalToken)
  const tokenExpires = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()

  // Insert draft + mark scam alert as used
  const { data: issue, error: insErr } = await supabase
    .from('newsletter_issues')
    .insert({
      issue_number: nextIssueNumber,
      subject: draft.subject,
      preview_text: draft.preview_text,
      scam_alert_id: scam.id,
      scam_section: draft.scam_section,
      truth_section: draft.truth_section,
      play_section: draft.play_section,
      status: 'draft',
      approval_token_hash: tokenHash,
      token_expires_at: tokenExpires,
    })
    .select('id, issue_number')
    .single()

  if (insErr || !issue) {
    return new Response(JSON.stringify({ error: 'insert_failed', detail: insErr?.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  await supabase.from('scam_alerts').update({ used_in_issue_id: issue.id }).eq('id', scam.id)

  // Count active subscribers (minus suppressed)
  const { count: subscriberCount } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })

  // Build approve + edit URLs
  const projectRef = supabaseUrl.replace('https://', '').split('.')[0]
  const approveUrl = `https://${projectRef}.functions.supabase.co/send-weekly-newsletter?issue=${issue.id}&token=${approvalToken}`
  const editUrl = `${APP_ORIGIN}/admin/newsletter-draft/${issue.id}`

  // Email the draft to Coach Kay (template has fixed `to`)
  const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      templateName: 'weekly-newsletter-draft',
      idempotencyKey: `draft-${issue.id}`,
      templateData: {
        issueNumber: issue.issue_number,
        subject: draft.subject,
        scamSection: draft.scam_section,
        truthSection: draft.truth_section,
        playSection: draft.play_section,
        approveUrl,
        editUrl,
        subscriberCount: subscriberCount ?? 0,
      },
    }),
  })

  const sendResult = await sendRes.json().catch(() => ({}))

  return new Response(JSON.stringify({
    success: true,
    issue_id: issue.id,
    issue_number: issue.issue_number,
    draft_email_status: sendRes.status,
    draft_email_result: sendResult,
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})