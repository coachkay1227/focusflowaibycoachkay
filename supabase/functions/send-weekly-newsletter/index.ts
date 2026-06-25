// Sends an approved weekly newsletter issue to every newsletter subscriber.
//
// Auth: this function is reached by Coach Kay clicking the "Approve & send"
// link inside the draft email, so it accepts an unauthenticated GET with
// `issue` and `token` query params. The token is verified against the SHA-256
// hash stored in newsletter_issues.approval_token_hash. The send function is
// also callable by service_role (POST) from the admin editor.
//
// Once approved, fans out one transactional send per subscriber via
// send-transactional-email (which already runs the suppression check).

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function isServiceRoleCaller(authHeader: string | null): boolean {
  if (!authHeader?.startsWith('Bearer ')) return false
  const token = authHeader.slice('Bearer '.length).trim()
  const expected = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!token || !expected || token.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}

function htmlPage(title: string, message: string, status: 'ok' | 'error' = 'ok'): Response {
  const color = status === 'ok' ? '#c9a227' : '#dc2626'
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;background:#0f172a;color:#e8d5a3;min-height:100vh;display:flex;align-items:center;justify-content:center;margin:0;padding:24px}
.card{max-width:480px;background:#111827;border:1px solid #1f2937;border-radius:12px;padding:32px;text-align:center}
h1{color:${color};font-family:Georgia,serif;font-weight:300;margin:0 0 16px}
p{color:#cbd5e1;line-height:1.6;margin:0}</style></head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`,
    { status: status === 'ok' ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  // Resolve issue + auth path
  let issueId: string | null = null
  let viaToken = false

  const url = new URL(req.url)
  if (req.method === 'GET') {
    issueId = url.searchParams.get('issue')
    const token = url.searchParams.get('token')
    if (!issueId || !token) return htmlPage('Missing link parameters', 'This approval link is malformed.', 'error')

    const tokenHash = await sha256Hex(token)
    const { data: issue } = await supabase
      .from('newsletter_issues')
      .select('id, status, approval_token_hash, token_expires_at')
      .eq('id', issueId)
      .maybeSingle()

    if (!issue) return htmlPage('Issue not found', 'This newsletter issue no longer exists.', 'error')
    if (issue.approval_token_hash !== tokenHash) return htmlPage('Invalid token', 'This approval link is not valid.', 'error')
    if (issue.token_expires_at && new Date(issue.token_expires_at) < new Date()) {
      return htmlPage('Link expired', 'This approval link has expired. Re-generate the draft to send a new one.', 'error')
    }
    if (issue.status === 'sent') return htmlPage('Already sent', 'This issue was already sent to subscribers.', 'error')
    viaToken = true
  } else if (req.method === 'POST') {
    if (!isServiceRoleCaller(req.headers.get('Authorization'))) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    try {
      const body = await req.json()
      issueId = body.issue_id || body.issueId || null
    } catch { /* ignore */ }
    if (!issueId) {
      return new Response(JSON.stringify({ error: 'issue_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } else {
    return new Response('Method not allowed', { status: 405 })
  }

  // Load full issue
  const { data: issue, error: loadErr } = await supabase
    .from('newsletter_issues')
    .select('*')
    .eq('id', issueId)
    .single()

  if (loadErr || !issue) {
    const msg = `Could not load issue: ${loadErr?.message ?? 'not found'}`
    return viaToken ? htmlPage('Error', msg, 'error') : new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  if (issue.status === 'sent') {
    const msg = 'Already sent.'
    return viaToken ? htmlPage('Already sent', msg, 'error') : new Response(JSON.stringify({ error: msg }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  // Mark approved BEFORE fanning out so a double-click can't re-send
  await supabase.from('newsletter_issues').update({ status: 'approved' }).eq('id', issue.id)

  // Load all subscribers
  const { data: subscribers, error: subErr } = await supabase
    .from('newsletter_subscribers')
    .select('email, name')

  if (subErr) {
    return viaToken
      ? htmlPage('Error', 'Could not load subscribers.', 'error')
      : new Response(JSON.stringify({ error: subErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  let sent = 0
  let suppressed = 0
  let failed = 0

  // Sequential fan-out keeps Resend rate happy + per-recipient logging works
  for (const sub of subscribers ?? []) {
    if (!sub.email) continue
    try {
      const r = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName: 'weekly-newsletter-issue',
          recipientEmail: sub.email,
          idempotencyKey: `weekly-${issue.id}-${sub.email.toLowerCase()}`,
          templateData: {
            issueNumber: issue.issue_number,
            subject: issue.subject,
            previewText: issue.preview_text,
            scamSection: issue.scam_section,
            truthSection: issue.truth_section,
            playSection: issue.play_section,
            name: sub.name ?? null,
          },
        }),
      })
      const json = await r.json().catch(() => ({}))
      if (r.ok && json?.success !== false) sent++
      else if (json?.reason === 'email_suppressed') suppressed++
      else failed++
    } catch (_e) {
      failed++
    }
  }

  await supabase
    .from('newsletter_issues')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      sent_count: sent,
      suppressed_count: suppressed,
      failed_count: failed,
      approval_token_hash: null,
    })
    .eq('id', issue.id)

  if (viaToken) {
    return htmlPage(
      `Issue #${issue.issue_number} sent`,
      `Delivered to ${sent} subscriber${sent === 1 ? '' : 's'}. ${suppressed} suppressed, ${failed} failed.`,
    )
  }

  return new Response(JSON.stringify({ success: true, sent, suppressed, failed }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})