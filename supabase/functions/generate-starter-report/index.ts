import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { generateReport } from "../_shared/generate-report.ts";

const SYSTEM_PROMPT = `You are Coach Kay — warm, direct, and pattern-aware. You guide leaders using the F.O.C.U.S. framework: Foundation, Opportunity, Create, Uplift, Support.

You are writing a free Quick Start Report for someone who just shared their business type and current bottleneck. The report has three sections:

1. WHERE YOU ARE — Name the real situation under the surface. Connect to the bottleneck they shared. 2-3 sentences.
2. WHAT TO FOCUS ON FIRST — Through the F.O.C.U.S. lens, the one pillar that needs attention this season and why. 2-4 sentences.
3. YOUR ACTION THIS WEEK — One specific move they can make this week. Not a list, not vague advice. Concrete and doable. 2-3 sentences.

Tone: generous, expert, never salesy. Deliver immediate value. Plant curiosity for going deeper without selling.

Respond using the generate_quick_start tool.`;

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
      name?: string;
      email?: string;
      business_type?: string;
      bottleneck?: string;
    } = {};
    try {
      body = await req.json();
    } catch {
      return json(400, { error: "Invalid JSON" });
    }

    const email =
      typeof body.email === "string" && body.email.includes("@") && body.email.length <= 254
        ? body.email.trim().toLowerCase()
        : "";
    const businessType =
      typeof body.business_type === "string" ? body.business_type.trim().slice(0, 100) : "";
    const bottleneck =
      typeof body.bottleneck === "string" ? body.bottleneck.trim().slice(0, 2000) : "";
    const name =
      typeof body.name === "string" && body.name.trim().length > 0
        ? body.name.trim().slice(0, 100)
        : null;

    if (!email) return json(400, { error: "Valid email required" });
    if (!businessType) return json(400, { error: "business_type required" });
    if (!bottleneck) return json(400, { error: "bottleneck required" });

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
      userPrompt: `Name: ${name ?? "(not given)"}\nBusiness type: ${businessType}\nBiggest bottleneck right now: ${bottleneck}`,
      toolName: "generate_quick_start",
      toolSchema: {
        type: "object",
        properties: {
          where_you_are: { type: "string", maxLength: 600, description: "2-3 sentences. Name the real situation under the surface; reference their stated bottleneck verbatim where it fits." },
          what_to_focus_on: { type: "string", maxLength: 600, description: "2-4 sentences. The single F.O.C.U.S. pillar to attend to this season and why — concrete to their business type." },
          action_this_week: { type: "string", maxLength: 600, description: "2-3 sentences. One specific, doable move for THIS week. No lists. No vague advice." },
        },
        required: ["where_you_are", "what_to_focus_on", "action_this_week"],
        additionalProperties: false,
      },
    });

    if (!result.ok) {
      return json(result.status ?? 500, { error: result.error });
    }

    const insert = await supabase
      .from("starter_kit_reports")
      .insert({
        user_id: userId,
        email,
        name,
        business_type: businessType,
        bottleneck,
        report: result.data,
      })
      .select("id")
      .single();

    // Preserve existing lead-capture parity
    await supabase
      .from("cohort_registrations")
      .insert({
        email,
        first_name: name,
        cohort_name: "AI Quick Start Report",
        source: "starter-kit",
      })
      .then(
        () => undefined,
        (err) => console.warn("cohort_registrations insert failed:", err),
      );

    if (insert.error) {
      console.error("starter-kit insert error:", insert.error);
      return json(200, { id: null, report: result.data });
    }

    return json(200, { id: insert.data?.id ?? null, report: result.data });
  } catch (e) {
    console.error("generate-starter-report error:", e);
    return json(500, { error: "Internal server error" });
  }
});