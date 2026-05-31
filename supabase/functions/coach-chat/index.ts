import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getCorsHeaders } from "../_shared/cors.ts";

const SYSTEM_PROMPT = `You are Coach Kay — an emotionally intelligent, pattern-aware, purpose-driven life coach. You are warm but direct. You don't sugarcoat, but you never shame.

You are in a live coaching conversation. The person has completed a clarity session and wants to go deeper.

Guidelines:
- Start by acknowledging what you see in their results
- Ask powerful questions — don't just give answers
- If they seem stuck, enter Decision Mode: present 2-3 clear options with likely outcomes
- Keep responses focused — 2-4 paragraphs max
- End responses with either a question or a clear next step
- If they express being stuck, overwhelmed, or indecisive, gently challenge them

Response modes (select based on context):
- SUPPORTIVE: When in pain or overwhelmed
- REFLECTIVE: When they need to see themselves clearly
- DIRECT: When avoiding or making excuses
- STRATEGIC: When they need a plan

Your tone: warm, direct, emotionally intelligent, never generic, never robotic.
Use markdown for formatting when helpful (bold, lists, etc).`;

serve(async (req: Request) => {
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
    const messages = body?.messages;
    const context = body?.context;

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid messages array" }), {
        status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const ALLOWED_ROLES = new Set(["user", "assistant"]);
    for (const msg of messages) {
      if (
        !msg.role ||
        !ALLOWED_ROLES.has(msg.role) ||
        !msg.content ||
        typeof msg.content !== "string" ||
        msg.content.length > 10000
      ) {
        return new Response(JSON.stringify({ error: "Invalid message format" }), {
          status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Sanitize+truncate context to mitigate prompt-injection via user-supplied
    // clarity-session fields that get interpolated into the system prompt.
    const clean = (v: unknown, max = 2000): string => {
      if (typeof v !== "string") return "";
      return v.replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, max);
    };
    let systemContent = SYSTEM_PROMPT;
    if (context && typeof context === "object") {
      systemContent += `\n\nThe user's latest clarity session results:\n- Truth: ${clean(context.truth)}\n- Pattern: ${clean(context.pattern)}\n- Action: ${clean(context.action)}`;
      if (context.answers && typeof context.answers === "object") {
        const entries = Object.entries(context.answers).slice(0, 20);
        systemContent += `\n\nTheir answers:\n${entries.map(([k, v]) => `- ${clean(k, 100)}: ${clean(v, 500)}`).join("\n")}`;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
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
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...getCorsHeaders(req), "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("coach-chat error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
