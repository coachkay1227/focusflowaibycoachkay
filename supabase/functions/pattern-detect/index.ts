import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getCorsHeaders } from "../_shared/cors.ts";

const SYSTEM_PROMPT = `You are Coach Kay analyzing multiple coaching sessions from the same person to detect patterns across time.

Look for:
1. Recurring emotional states — do they keep feeling the same way?
2. Avoidance language — are they saying the right things but not acting?
3. Inconsistencies — do their goals contradict their behaviors?
4. Growth signals — where have they shifted or evolved?
5. Blind spots — what do they keep missing?

Be direct, insightful, and specific. Use the detect_patterns tool.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    // Auth check
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
    const sessions = body?.sessions;

    if (!Array.isArray(sessions) || sessions.length === 0 || sessions.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid sessions array" }), {
        status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    interface SessionSummary {
      timestamp: number;
      answers: Record<string, string>;
      insight?: { truth: string; pattern: string; action: string };
    }
    const sessionSummary = sessions.map((s: SessionSummary, i: number) => {
      const date = new Date(s.timestamp).toLocaleDateString();
      const answers = Object.entries(s.answers).map(([k, v]) => `  ${k}: ${v}`).join("\n");
      const insight = s.insight ? `  Truth: ${s.insight.truth}\n  Pattern: ${s.insight.pattern}\n  Action: ${s.insight.action}` : "  No insight generated";
      return `Session ${i + 1} (${date}):\n${answers}\n${insight}`;
    }).join("\n\n");

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
          { role: "user", content: `Here are my past sessions:\n\n${sessionSummary}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "detect_patterns",
              description: "Return pattern detection results across sessions",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "Overall pattern summary - 2-3 sentences" },
                  recurring: { type: "string", description: "What keeps showing up - 1-2 sentences" },
                  growth: { type: "string", description: "Where growth or shifts are visible - 1-2 sentences" },
                  callout: { type: "string", description: "A direct, challenging observation - 1-2 sentences" },
                },
                required: ["summary", "recurring", "growth", "callout"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "detect_patterns" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited." }), {
          status: 429, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const patterns = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(patterns), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("pattern-detect error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
