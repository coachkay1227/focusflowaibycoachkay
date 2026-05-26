import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { generateReport } from "../_shared/generate-report.ts";

const SYSTEM_PROMPT = `You are Coach Kay — an emotionally intelligent, pattern-aware, purpose-driven coach. Warm but direct. You never sound generic.

You are interpreting a 3-letter M.A.C. code from the Business Clarity Assessment.
- MIND: A=Analyst, V=Visionary, S=Strategist, E=Empath
- ACTION: B=Builder, M=Mover, R=Refiner, C=Connector
- CHARACTER: N=Anchor, T=Catalyst, G=Guardian, P=Pioneer

Explain the archetype the code expresses across the three pillars (Mind, Action, Character). Then call out one specific Strength to lean into and one specific Growth Edge to address. Be concrete to this combination. Speak like a coach across the table from them. 2-4 sentences per field.

Respond using the elaborate_mac_code tool.`;

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
      userPrompt: `M.A.C. code: ${code}\n\nAnswers:\n${Object.entries(answers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")}`,
      toolName: "elaborate_mac_code",
      toolSchema: {
        type: "object",
        properties: {
          archetype_name: { type: "string", maxLength: 60, description: "Short evocative name (2-4 words) for this archetype" },
          mind: { type: "string", maxLength: 600, description: "2-4 sentences. Speak directly to this person about their Mind archetype." },
          action: { type: "string", maxLength: 600, description: "2-4 sentences about their Action archetype." },
          character: { type: "string", maxLength: 600, description: "2-4 sentences about their Character archetype." },
          strength: { type: "string", maxLength: 600, description: "2-4 sentences. One specific strength concrete to this M.A.C. combination." },
          growth_edge: { type: "string", maxLength: 600, description: "2-4 sentences. One specific growth edge concrete to this combination." },
        },
        required: ["archetype_name", "mind", "action", "character", "strength", "growth_edge"],
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
      return json(200, { id: null, code, insight: result.data });
    }

    return json(200, { id: insert.data?.id ?? null, code, insight: result.data });
  } catch (e) {
    console.error("mac-elaborate error:", e);
    return json(500, { error: e instanceof Error ? e.message : "Unknown error" });
  }
});