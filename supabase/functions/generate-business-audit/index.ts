import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { generateReport } from "../_shared/generate-report.ts";
import { composeSystemPrompt } from "../_shared/coach-voice.ts";

const AUDIT_CATALOG = `You operate Coach Kay Elevates with two distinct lanes:
- Shield Her Elevation LLC (for-profit corporate AI training and coaching)
- Forward Focus Elevation (the nonprofit lane — fiscally sponsored by COED Columbus, which IS a 501c3. Forward Focus Elevation itself is NOT a 501c3. NEVER describe Forward Focus Elevation as a 501c3 — this is a compliance flag.)

CRITICAL NAMING DISTINCTION — DO NOT CONFUSE THESE THREE:
- FocusFlow AI = the paid platform the reader is currently using (this product). Tool hub, all paid offers.
- Focus Flow Elevation Hub = the FREE Skool community for mission-driven / justice-impacted / second-chance seekers. Community access point.
- Forward Focus Elevation = the nonprofit lane / umbrella. Fiscally sponsored, NOT a 501c3.

These are three different things. NEVER conflate them in your output.

Your framework: F.O.C.U.S. (Foundation, Opportunity, Create, Uplift, Support). The C is ALWAYS Create — never Credit, never Cash. Mantra: 'Where Focus Goes, Energy Flows.'

Your tone: direct, emotionally intelligent, confident. No corporate jargon. No fluff. Treat the reader as a peer founder, not a beginner.

You are generating a personalized $47 AI Business Audit. The reader has filled out a detailed 17-field intake. Use EVERY field. Reference specific things they said. Make them feel seen — that's the conversion mechanic.

Generate an 8-section audit that diagnoses their business, gives them a real 7-day plan, demonstrates AI expertise, and routes them to exactly ONE next-best-move from the complete Coach Kay Elevates catalog below. Use the exact offer_slug values listed.

═══ THE FOUR DOORS ═══

DOOR 1 — TRANSFORM ME (Transformation lane, self/coached programs):
- transform_30_personal ($297 one-time): 30-Day Personal Reset. Identity, energy, clarity. Best for burnout, life-pivot, foundational reset before business work.
- transform_30_business ($497 one-time): 30-Day Business Reset. Offer + audience + first systems. Best for solo founders pre-$5K/mo who need traction.
- transform_30_ai ($997 one-time) ⭐ HERO: 30-Day AI Reset. Build your AI stack + workflows. Best for any operator with an AI gap and budget ≥ $500 and no stronger lane signal — this is the flagship.
- transform_90_personal ($997 one-time): 90-Day Personal Transformation. Deeper identity + habits work.
- transform_90_business ($1,497 one-time): 90-Day Business Transformation. Revenue + delivery system. Best for $5–25K/mo founders breaking through a plateau.
- transform_90_ai ($2,497 one-time): 90-Day Full AI Transformation. AI-native business build-out.
- transform_6mo_partnership ($3,997 one-time): 6-Month Private Partnership. High-touch 1:1. Best for $25K+/mo operators or complex multi-product scale.

DOOR 2 — BUILD FOR ME (Done-for-you AI + lead systems):
- rent_agent_starter ($297/mo): Rent-an-Agent Starter. One managed agent. Best for solos who want AI in business without DIY.
- rent_agent_pro ($697/mo): Rent-an-Agent Pro. Multi-agent. Best for $5–25K/mo with growing ops.
- rent_agent_dreamteam ($997/mo): Rent-an-Agent Dream Team. Coordinated agent team for cross-function work.
- rent_agent_enterprise ($1,997+/mo): Rent-an-Agent Enterprise. Custom-scoped agent ops for $25K+/mo or team-led businesses.
- lead_engine_essentials ($697/mo + setup): Lead Engine Essentials. Inbound funnel + nurture basics. Best for "no leads" + budget under $1.5K/mo.
- lead_engine_pro ($1,497/mo + setup): Lead Engine Pro. Multi-channel lead system.
- lead_engine_growth ($2,497/mo + setup): Lead Engine Growth. Pipeline + analytics. Best for $25K+/mo scaling.
- lead_engine_scale ($2,997/mo + setup): Lead Engine Scale. High-volume outbound + inbound.
- lead_engine_enterprise ($4,997/mo + setup): Lead Engine Enterprise. Full revenue ops, custom integrations.

DOOR 3 — TRAIN MY TEAM (Advisory + B2B):
- advisory_strategy_intensive ($497 / 90-min): AI Strategy Intensive. One-shot expert session.
- advisory_executive ($500/hr retainer): Executive Advisory. Ongoing 1:1 advisory for execs/founders.
- advisory_speaking (from $750): Speaking & Workshops. Best for keynote/speaking signals.
- advisory_corporate (custom): Corporate, EAP & Workforce Learning. Best for corporate, EAP, workforce-development, B2B-team signals.
- advisory_university (custom): AI University Roadmap Tracks. Best for higher-ed / curriculum signals.
- group_programs (custom): Group Programs / Collective AI Summit. Cohort-based group offerings.

DOOR 4 — TELL MY STORY (Studio: books, story, authority):
- studio_mini_story ($497): Mini-Story Starter. Best for entry storytelling, lead-magnet book.
- studio_storybook_pro ($1,250): The Storybook Pro. Full storybook production.
- studio_other (custom): Other Studio lanes — Legacy & Family books, Expert/Authority books, Creator/Seller coloring books, Autism & Social Stories. Use this when the operator wants story/authority/book work that doesn't fit the two named tiers.

BUILD STUDIO (Phase 3.5 — opening soon, MUST be flagged "Opening soon — Phase 3.5" inside why_this_one if chosen):
- build_studio_landing ($497): Landing page build.
- build_studio_site ($1,997): Full business site.
- build_studio_dashboard ($2,997+): Custom dashboard / internal tool.

COMMUNITY / FREE PATHWAY:
- focus_flow_elevation_hub: Focus Flow Elevation Hub (free Skool community). Frame as a free community access point through Forward Focus Elevation (the nonprofit lane). NOT a paid offer. NOT a 501c3.

═══ ROUTING HEURISTICS ═══

Combine the intake signals in this order:

1. preferred_path picks the door:
   - "teach me" / "transform me" → Door 1 (Transformation)
   - "build it for me" / "done for me" → Door 2 (Build For Me)
   - "train my team" / B2B / corporate → Door 3 (Advisory)
   - "tell my story" / book / brand → Door 4 (Studio)

2. budget_appetite + monthly_revenue pick the tier within the door:
   - under $500: 30-day Transformation or community.
   - $500–$2K: 30-day Transformation (AI Reset preferred if AI gap), Rent Starter, Lead Essentials, Mini-Story, Strategy Intensive.
   - $2K–$5K: 90-day Transformation, Rent Pro, Lead Pro, Storybook Pro, Executive Advisory.
   - $5K+: 6-Month Partnership, Rent Dream Team / Enterprise, Lead Growth / Scale / Enterprise, Advisory Corporate, Group Programs.

3. biggest_bottleneck + whats_broken narrow within the tier:
   - "no leads" / "pipeline" → Lead Engine.
   - "ops chaos" / "doing it all" → Rent-an-Agent.
   - "no clarity" / "no offer" / "no brand" → 30-day Reset (Personal or Business).
   - "AI gap" / "manual work" / "want to use AI" → AI lane (transform_30_ai is the hero default).
   - "scaling team" / "operational complexity" → 90-day or 6-Month Partnership.

4. industry / mission signals override to community when justice-impacted, reentry, second-chance, nonprofit, or strong mission alignment with explicit low budget → focus_flow_elevation_hub.

5. Corporate / EAP / workforce / team-training signals → advisory_corporate (or advisory_executive for exec 1:1, advisory_speaking for keynotes, advisory_university for higher-ed).

6. Book / story / authority-building signals → Studio (mini → pro → other by budget).

HERO RULE: transform_30_ai ($997) is the flagship. Prefer it when the operator shows any AI gap AND budget ≥ $500 AND no stronger door signal pulls them elsewhere.

Pick exactly ONE next_best_move. Be decisive. Name it. Tell them WHY it's the right move given the specific things they typed. In all_pathways_note, briefly acknowledge 1–2 adjacent doors so they see the full ecosystem without losing the primary recommendation.

Generate output via the generate_audit tool.`;

const SYSTEM_PROMPT = composeSystemPrompt("business-audit", AUDIT_CATALOG);

const OFFER_SLUGS = [
  // Door 1 — Transformation
  "transform_30_personal",
  "transform_30_business",
  "transform_30_ai",
  "transform_90_personal",
  "transform_90_business",
  "transform_90_ai",
  "transform_6mo_partnership",
  // Door 2 — Build For Me
  "rent_agent_starter",
  "rent_agent_pro",
  "rent_agent_dreamteam",
  "rent_agent_enterprise",
  "lead_engine_essentials",
  "lead_engine_pro",
  "lead_engine_growth",
  "lead_engine_scale",
  "lead_engine_enterprise",
  // Door 3 — Advisory
  "advisory_strategy_intensive",
  "advisory_executive",
  "advisory_speaking",
  "advisory_corporate",
  "advisory_university",
  "group_programs",
  // Door 4 — Studio
  "studio_mini_story",
  "studio_storybook_pro",
  "studio_other",
  // Build Studio (Phase 3.5 — opening soon)
  "build_studio_landing",
  "build_studio_site",
  "build_studio_dashboard",
  // Community / free
  "focus_flow_elevation_hub",
];

const TOOL_SCHEMA = {
  type: "object",
  properties: {
    executive_snapshot: { type: "string" },
    where_youre_leaking: { type: "string" },
    focus_diagnostic: {
      type: "object",
      properties: {
        foundation: {
          type: "object",
          properties: { score: { type: "number" }, note: { type: "string" } },
          required: ["score", "note"],
        },
        opportunity: {
          type: "object",
          properties: { score: { type: "number" }, note: { type: "string" } },
          required: ["score", "note"],
        },
        create: {
          type: "object",
          properties: { score: { type: "number" }, note: { type: "string" } },
          required: ["score", "note"],
        },
        uplift: {
          type: "object",
          properties: { score: { type: "number" }, note: { type: "string" } },
          required: ["score", "note"],
        },
        support: {
          type: "object",
          properties: { score: { type: "number" }, note: { type: "string" } },
          required: ["score", "note"],
        },
      },
      required: ["foundation", "opportunity", "create", "uplift", "support"],
    },
    seven_day_plan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "number" },
          focus_pillar: { type: "string" },
          title: { type: "string" },
          action: { type: "string" },
          why: { type: "string" },
        },
        required: ["day", "focus_pillar", "title", "action", "why"],
      },
    },
    tool_stack_recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          current_tool: { type: "string" },
          recommendation: { type: "string" },
          reasoning: { type: "string" },
          type: { type: "string", enum: ["swap", "consolidate", "add", "remove"] },
        },
        required: ["current_tool", "recommendation", "reasoning", "type"],
      },
    },
    custom_prompts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          use_case: { type: "string" },
          prompt: { type: "string" },
        },
        required: ["use_case", "prompt"],
      },
    },
    next_best_move: {
      type: "object",
      properties: {
        offer_slug: { type: "string", enum: OFFER_SLUGS },
        offer_name: { type: "string" },
        why_this_one: { type: "string" },
        what_youll_get: { type: "string" },
        investment: { type: "string" },
      },
      required: ["offer_slug", "offer_name", "why_this_one", "what_youll_get", "investment"],
    },
    all_pathways_note: { type: "string" },
  },
  required: [
    "executive_snapshot",
    "where_youre_leaking",
    "focus_diagnostic",
    "seven_day_plan",
    "tool_stack_recommendations",
    "custom_prompts",
    "next_best_move",
    "all_pathways_note",
  ],
};

function formatIntake(intake: Record<string, unknown>): string {
  const order = [
    "business_name",
    "website",
    "industry",
    "stage",
    "monthly_revenue",
    "team_size",
    "current_tools",
    "monthly_software_spend",
    "hours_repetitive_tasks",
    "ai_usage_today",
    "ai_tried_so_far",
    "primary_offer",
    "biggest_bottleneck",
    "whats_broken",
    "outcome_30_days",
    "what_2x_looks_like",
    "budget_appetite",
    "preferred_path",
  ];
  return order
    .map((k) => {
      const v = intake[k];
      const value = Array.isArray(v) ? v.join(", ") : v == null || v === "" ? "(not given)" : String(v);
      return `${k}: ${value}`;
    })
    .join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const cors = getCorsHeaders(req);
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  try {
    const body = (await req.json().catch(() => null)) as
      | { audit_id?: string; intake?: Record<string, unknown>; token?: string }
      | null;
    if (!body || typeof body.audit_id !== "string" || !body.intake) {
      return json(400, { error: "audit_id and intake required" });
    }
    const auditId = body.audit_id;
    const intake = body.intake;
    const token = typeof body.token === "string" ? body.token : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Access validation: authed owner OR valid token
    let authedUserId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { data } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      authedUserId = data?.user?.id ?? null;
    }

    const { data: auditRow, error: readErr } = await supabase
      .from("business_audits")
      .select("id, user_id")
      .eq("id", auditId)
      .maybeSingle();
    if (readErr || !auditRow) {
      return json(404, { error: "Audit not found" });
    }

    // Admins can regenerate any user's audit
    let isAdminUser = false;
    if (authedUserId) {
      const { data: adminCheck } = await supabase.rpc("has_role", {
        _user_id: authedUserId,
        _role: "admin",
      });
      isAdminUser = !!adminCheck;
    }

    let hasAccess = isAdminUser || (!!authedUserId && auditRow.user_id === authedUserId);
    if (!hasAccess && token) {
      const { data: tok } = await supabase
        .from("audit_tokens")
        .select("audit_id, expires_at")
        .eq("token", token)
        .maybeSingle();
      if (tok && tok.audit_id === auditId && new Date(tok.expires_at).getTime() > Date.now()) {
        hasAccess = true;
      }
    }
    if (!hasAccess) return json(403, { error: "Access denied" });

    // Persist intake immediately so a generation failure doesn't lose data.
    const { error: intakeErr } = await supabase
      .from("business_audits")
      .update({ intake })
      .eq("id", auditId);
    if (intakeErr) {
      console.error("intake update failed:", intakeErr);
    }

    // Resolve the user's email for notification emails.
    let userEmail: string | null = null;
    let userName: string | null = null;
    if (authedUserId) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(authedUserId);
        userEmail = authUser?.user?.email ?? null;
        const meta = authUser?.user?.user_metadata ?? {};
        userName = (meta.full_name as string | undefined) || (meta.name as string | undefined) || null;
      } catch (e) {
        console.warn("[generate-business-audit] Could not fetch user email:", e);
      }
    }
    // Fall back to guest_email stored on the audit row.
    if (!userEmail) {
      const { data: auditForEmail } = await supabase
        .from("business_audits")
        .select("guest_email, guest_name")
        .eq("id", auditId)
        .maybeSingle();
      userEmail = auditForEmail?.guest_email ?? null;
      if (!userName) userName = auditForEmail?.guest_name ?? null;
    }

    // Fire audit-intake-submitted email + GHL event (best-effort, non-blocking).
    const businessName = typeof intake.business_name === "string" ? intake.business_name : undefined;
    const industry = typeof intake.industry === "string" ? intake.industry : undefined;
    await Promise.allSettled([
      userEmail
        ? supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "audit-intake-submitted",
              recipientEmail: userEmail,
              idempotencyKey: `audit-intake-${auditId}`,
              templateData: { name: userName, business_name: businessName, audit_id: auditId },
            },
          })
        : Promise.resolve(),
      supabase.functions.invoke("ghl-webhook", {
        body: {
          event: "audit_intake_submitted",
          payload: {
            email: userEmail,
            user_id: authedUserId,
            audit_id: auditId,
            business_name: businessName,
            industry,
          },
        },
      }),
    ]);

    const result = await generateReport({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: formatIntake(intake),
      toolName: "generate_audit",
      toolSchema: TOOL_SCHEMA,
    });

    if (!result.ok) {
      return json(result.status ?? 500, { error: result.error });
    }

    const recommendedOffer =
      (result.data as { next_best_move?: { offer_slug?: string } })?.next_best_move?.offer_slug ?? null;

    const { error: updateErr } = await supabase
      .from("business_audits")
      .update({
        report: result.data,
        recommended_offer: recommendedOffer,
        generated_at: new Date().toISOString(),
      })
      .eq("id", auditId);
    if (updateErr) {
      console.error("report update failed:", updateErr);
      return json(500, { error: "Failed to save report" });
    }

    // Fire audit-report-ready email (best-effort, non-blocking).
    if (userEmail) {
      const reportUrl = `https://coachkayai.life/audit/report/${auditId}`;
      const firstName = userName
        ? userName.split(" ")[0]
        : undefined;
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "audit-report-ready",
          recipientEmail: userEmail,
          idempotencyKey: `audit-ready-${auditId}`,
          templateData: { name: firstName ?? userName, audit_id: auditId, reportUrl },
        },
      }).catch((e: unknown) => {
        console.warn("[generate-business-audit] audit-report-ready email failed:", e);
      });
    }

    return json(200, { ok: true, audit_id: auditId, report: result.data });
  } catch (e) {
    console.error("generate-business-audit error:", e);
    return json(500, { error: e instanceof Error ? e.message : "Unknown error" });
  }
});