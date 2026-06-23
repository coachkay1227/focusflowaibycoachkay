import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { generateReport } from "../_shared/generate-report.ts";

const SYSTEM_PROMPT = `You are Coach Kay — an emotionally intelligent, pattern-aware, purpose-driven coach. Warm but direct. You never sound generic. You name patterns the operator hasn't said out loud yet.

You are interpreting an Operator × Bottleneck result.
- MIND: A=Analyst, V=Visionary, S=Strategist, E=Empath
- ACTION: B=Builder, M=Mover, R=Refiner, C=Connector
- CHARACTER: N=Anchor, T=Catalyst, G=Guardian, P=Pioneer
- BOTTLENECK: CLARITY=don't know what to build/sell/say · FOCUS=can't get it done · UPLEVEL=invisible to next audience · OWNERSHIP=money/systems/time leaking

Your job: name the specific pattern this exact Operator × Bottleneck combination creates in a coaching business. Give them the "I never thought of that" moment — not a personality reading. Speak to behavior, not labels.

Respond using the elaborate_operator_bottleneck tool.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  const cors = getCorsHeaders(req);
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  try {
    let body: {
      code?: string;
      answers?: Record<string, string>;
      email?: string;
      name?: string;
      primaryBucket?: string;
      secondaryBucket?: string;
    } = {};
    try {
      body = await req.json();
    } catch {
      return json(400, { error: "Invalid JSON" });
    }

    const code = typeof body.code === "string" ? body.code.trim() : "";
    const answers = body.answers;
    if (!/^[AVSE]-[BMRC]-[NTGP]$/.test(code)) {
      return json(400, { error: "Invalid M.A.C. code" });
    }
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return json(400, { error: "Invalid answers" });
    }
    if (Object.keys(answers).length > 40) {
      return json(400, { error: "Too many answers" });
    }

    const BUCKETS = new Set(["CLARITY", "FOCUS", "UPLEVEL", "OWNERSHIP"]);
    const primaryBucket =
      typeof body.primaryBucket === "string" && BUCKETS.has(body.primaryBucket)
        ? body.primaryBucket
        : "CLARITY";
    const secondaryBucket =
      typeof body.secondaryBucket === "string" && BUCKETS.has(body.secondaryBucket)
        ? body.secondaryBucket
        : primaryBucket;

    const guestEmail =
      typeof body.email === "string" && body.email.includes("@") && body.email.length <= 254
        ? body.email.trim().toLowerCase()
        : null;
    const guestName =
      typeof body.name === "string" && body.name.trim().length > 0 && body.name.length <= 100
        ? body.name.trim()
        : null;

    // Optional user resolution — JWT not required (anon allowed)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      if (data?.user?.id) userId = data.user.id;
    }

    const result = await generateReport({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Operator code: ${code}\nPrimary bottleneck: ${primaryBucket}\nSecondary bottleneck: ${secondaryBucket}\n\nScenario answers:\n${Object.entries(answers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")}`,
      toolName: "elaborate_operator_bottleneck",
      toolSchema: {
        type: "object",
        properties: {
          archetype_name: { type: "string", maxLength: 60, description: "Short evocative 2-4 word name for this operator type (e.g. 'Empath-Connector', 'Visionary-Pioneer')." },
          combo_line: { type: "string", maxLength: 140, description: "One sentence in the form: 'You're a {ArchetypeName} stuck at {BUCKET}.' Use the exact primary bucket word." },
          pattern_line: { type: "string", maxLength: 360, description: "TWO sentences max. Name the specific pattern this Operator × Bottleneck combination creates in a coaching business. Be the 'I never thought of that' moment. No labels — describe behavior and consequence." },
          combo_reason: { type: "string", maxLength: 280, description: "One sentence connecting how this operator type tends to create exactly this bottleneck. Concrete, not generic." },
          mind: { type: "string", maxLength: 500, description: "2-3 sentences about how their Mind archetype shows up in business." },
          action: { type: "string", maxLength: 500, description: "2-3 sentences about their Action archetype in business." },
          character: { type: "string", maxLength: 500, description: "2-3 sentences about their Character archetype in business." },
          strength: { type: "string", maxLength: 500, description: "2-3 sentences. One concrete strength this combination unlocks against this bottleneck." },
          growth_edge: { type: "string", maxLength: 500, description: "2-3 sentences. One concrete growth edge to address THIS bottleneck given this operator type." },
        },
        required: ["archetype_name", "combo_line", "pattern_line", "combo_reason", "mind", "action", "character", "strength", "growth_edge"],
        additionalProperties: false,
      },
    });

    if (!result.ok) {
      return json(result.status ?? 500, { error: result.error });
    }

    const insert = await supabase
      .from("mac_assessments")
      .insert({
        user_id: userId,
        guest_email: userId ? null : guestEmail,
        guest_name: userId ? null : guestName,
        answers,
        code,
        ai_insight: result.data,
      })
      .select("id")
      .single();

    if (insert.error) {
      console.error("mac-elaborate insert error:", insert.error);
      // Still return the insight so the user sees their result.
      // Fire GHL webhook best-effort even on insert error.
      supabase.functions.invoke("ghl-webhook", {
        body: {
          event: "assessment_completed",
          payload: {
            email: guestEmail,
            user_id: userId,
            assessment_type: "mac-type",
            bottleneck: primaryBucket,
            archetype: (result.data as { archetype_name?: string })?.archetype_name ?? null,
          },
        },
      }).catch((e: unknown) => {
        console.warn("[mac-elaborate] ghl-webhook failed:", e);
      });
      return json(200, { id: null, code, insight: result.data });
    }

    // Resolve recipient email: guest provided it in body, or look up authenticated user.
    let emailToNotify = guestEmail;
    if (!emailToNotify && userId) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        emailToNotify = authUser?.user?.email ?? null;
      } catch { /* non-critical */ }
    }

    // Fire GHL webhook after successful assessment (best-effort, non-blocking).
    supabase.functions.invoke("ghl-webhook", {
      body: {
        event: "assessment_completed",
        payload: {
          email: emailToNotify,
          user_id: userId,
          assessment_type: "mac-type",
          bottleneck: primaryBucket,
          archetype: (result.data as { archetype_name?: string })?.archetype_name ?? null,
        },
      },
    }).catch((e: unknown) => {
      console.warn("[mac-elaborate] ghl-webhook failed:", e);
    });

    // Send assessment result email to user (best-effort, idempotent).
    if (emailToNotify) {
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "assessment-result",
          recipientEmail: emailToNotify,
          idempotencyKey: `mac-result-${insert.data?.id ?? crypto.randomUUID()}`,
          templateData: {
            name: guestName,
            archetypeName: (result.data as { archetype_name?: string })?.archetype_name ?? null,
            comboLine: (result.data as { combo_line?: string })?.combo_line ?? null,
            patternLine: (result.data as { pattern_line?: string })?.pattern_line ?? null,
            primaryBucket,
          },
        },
      }).catch((e: unknown) => {
        console.warn("[mac-elaborate] assessment-result email failed:", e);
      });
    }

    return json(200, { id: insert.data?.id ?? null, code, insight: result.data });
  } catch (e) {
    console.error("mac-elaborate error:", e);
    return json(500, { error: e instanceof Error ? e.message : "Unknown error" });
  }
});