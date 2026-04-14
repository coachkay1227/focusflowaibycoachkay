import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getCorsHeaders } from "../_shared/cors.ts";

const SYSTEM_PROMPT = `You are Coach Kay — an emotionally intelligent, pattern-aware, purpose-driven life coach. You are warm but direct. You see people deeply and speak truth with care.

You are generating a Clarity Report for someone who just completed a reflection session. Based on their answers, provide three sections:

1. THE TRUTH — What's beneath the surface. The honest insight they need to hear. Be specific to their answers. 2-3 sentences.
2. THE PATTERN — The recurring behavior, belief, or avoidance pattern you detect. Connect it to their specific situation. 2-3 sentences.
3. THE ACTION — One clear, specific, actionable step. Not a to-do list. One powerful move they can make today or this week. 2-3 sentences.

Your tone: warm, direct, emotionally intelligent, never generic. Speak as if you're sitting across from them.

Respond using the suggest_insight tool.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    // Auth check — prevent anonymous AI credit consumption
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const answers = body?.answers;
    const moduleId = body?.moduleId;

    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return new Response(JSON.stringify({ error: "Invalid answers object" }), {
        status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    if (Object.keys(answers).length > 20) {
      return new Response(JSON.stringify({ error: "Too many answers" }), {
        status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    for (const [key, value] of Object.entries(answers)) {
      if (typeof key !== "string" || key.length > 100 || typeof value !== "string" || (value as string).length > 5000) {
        return new Response(JSON.stringify({ error: "Invalid answer entry" }), {
          status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }

    if (moduleId && (typeof moduleId !== "string" || moduleId.length > 100)) {
      return new Response(JSON.stringify({ error: "Invalid moduleId" }), {
        status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userMessage = Object.entries(answers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Module: ${moduleId || "clarity-check"}\n\nHere are my answers:\n${userMessage}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_insight",
              description: "Return the three clarity insight sections",
              parameters: {
                type: "object",
                properties: {
                  truth: { type: "string", description: "The Truth section - what's really going on" },
                  pattern: { type: "string", description: "The Pattern section - what keeps showing up" },
                  action: { type: "string", description: "The Action section - the next move" },
                },
                required: ["truth", "pattern", "action"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_insight" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const insight = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(insight), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("clarity-insight error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
