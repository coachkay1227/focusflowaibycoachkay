import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { generateReport } from "../_shared/generate-report.ts";

const SYSTEM_PROMPT = `You are Coach Kay (Kenza Alaoui), an AI & Life Transformation Coach. You operate Coach Kay Elevates with two distinct lanes:
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

Generate an 8-section audit that diagnoses their business, gives them a real 7-day plan, demonstrates AI expertise, and routes them to ONE recommended next-best-move from this ecosystem:

PAID OFFERS (Coach Kay Elevates / FocusFlow AI):
- FocusFlow 30-day ($297 one-time): Self-paced AI + life transformation. Best for solo founders with clarity gaps and budget under $500.
- FocusFlow 90-day ($497 one-time): Coached AI + business transformation. Best for launched businesses with revenue/leads bottleneck.
- FocusFlow 6-month ($1997 one-time): High-touch AI + business mastery. Best for scaling businesses with operational complexity.
- Rent-an-Agent Starter ($297/mo subscription): Managed AI agent service. Best for those wanting AI in business without DIY.
- Rent-an-Agent Pro ($697/mo): Multi-agent managed service. Best for growing teams.
- Advisory Consultation (custom pricing): Best for corporate, team, EAP, workforce development, or B2B signals.
- F.O.C.U.S. Build Studio (opening soon — flag as 'Opening soon' if recommended): Landing pages $497, business sites $1997, dashboards $2997+. Best when bottleneck is no website, broken funnel, or operational complexity needing custom tools.

FREE COMMUNITY PATHWAY:
- Focus Flow Elevation Hub (free Skool community): For mission-driven, nonprofit, justice-impacted, second-chance, or reentry signals. This is a free recommendation — frame it as community access through Forward Focus Elevation (the nonprofit lane), NOT as a paid offer.

ROUTING LOGIC — Use the intake fields budget_appetite, preferred_path, biggest_bottleneck, stage, and industry to choose ONE primary recommendation. Be confident — name it clearly. If the reader signals mission-driven / nonprofit / justice-impacted intent OR explicitly low budget with high mission alignment, recommend the Focus Flow Elevation Hub (community pathway through Forward Focus Elevation) as the next best move.

Generate output via the generate_audit tool.`;

const OFFER_SLUGS = [
  "focusflow_30",
  "focusflow_90",
  "focusflow_6mo",
  "rent_agent_starter",
  "rent_agent_pro",
  "advisory",
  "build_studio_landing",
  "build_studio_site",
  "build_studio_dashboard",
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

    let hasAccess = !!authedUserId && auditRow.user_id === authedUserId;
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

    return json(200, { ok: true, audit_id: auditId, report: result.data });
  } catch (e) {
    console.error("generate-business-audit error:", e);
    return json(500, { error: e instanceof Error ? e.message : "Unknown error" });
  }
});