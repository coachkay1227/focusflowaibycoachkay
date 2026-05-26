import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { generateReport } from "../_shared/generate-report.ts";

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
    // Anon-allowed: this powers the public Clarity Check (guest flow).
    // We opportunistically resolve the user if a JWT is present, so the
    // result email goes to their verified address. Otherwise we accept
    // a guest_email captured by our own email gate.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );
    let authedUser: { id: string; email: string | null; name?: string } | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      if (data?.user?.id) {
        authedUser = {
          id: data.user.id,
          email: data.user.email ?? null,
          name:
            (data.user.user_metadata?.full_name as string | undefined) ||
            (data.user.user_metadata?.name as string | undefined) ||
            undefined,
        };
      }
    }

    const body = await req.json();
    const answers = body?.answers;
    const moduleId = body?.moduleId;
    const sessionId =
      typeof body?.sessionId === "string" && body.sessionId.length <= 100
        ? body.sessionId
        : crypto.randomUUID();
    const guestEmailRaw = typeof body?.guest_email === "string" ? body.guest_email.trim().toLowerCase() : "";
    const guestEmail =
      !authedUser && guestEmailRaw.includes("@") && guestEmailRaw.length <= 254 ? guestEmailRaw : null;
    const guestName =
      !authedUser && typeof body?.guest_name === "string" && body.guest_name.trim().length > 0
        ? body.guest_name.trim().slice(0, 100)
        : null;

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

    const result = await generateReport({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Module: ${moduleId || "clarity-check"}\n\nHere are my answers:\n${userMessage}`,
      toolName: "suggest_insight",
      toolSchema: {
        type: "object",
        properties: {
          truth: { type: "string", maxLength: 600, description: "The Truth - what's really going on. Quote at least one phrase from the user's answers. 2-3 sentences." },
          pattern: { type: "string", maxLength: 600, description: "The Pattern - what keeps showing up. Tie back to a specific answer. 2-3 sentences." },
          action: { type: "string", maxLength: 600, description: "The Action - one concrete move they can make this week. 2-3 sentences." },
        },
        required: ["truth", "pattern", "action"],
        additionalProperties: false,
      },
    });

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status ?? 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Fire-and-forget: email + GHL webhook. Recipient is either the verified
    // authed user OR the guest_email captured by our own email gate. We never
    // send to a free-form client-supplied email when an auth user is present.
    const recipientEmail = authedUser?.email ?? guestEmail;
    const recipientName = authedUser?.name ?? guestName ?? undefined;
    if (recipientEmail) {
      const insightData = result.data as { truth?: string; pattern?: string; action?: string };
      supabase.functions
        .invoke("send-transactional-email", {
          body: {
            templateName: "clarity-code-result",
            recipientEmail,
            idempotencyKey: `clarity-code-${sessionId}`,
            templateData: {
              name: recipientName,
              truth: (insightData.truth ?? "").slice(0, 4000),
              pattern: (insightData.pattern ?? "").slice(0, 4000),
              action: (insightData.action ?? "").slice(0, 4000),
            },
          },
        })
        .catch((e) => console.warn("clarity-insight email enqueue failed:", e));
      supabase.functions
        .invoke("ghl-webhook", {
          body: {
            event: "clarity_session_complete",
            payload: {
              email: recipientEmail,
              user_id: authedUser?.id ?? null,
              moduleId,
              guest: !authedUser,
            },
          },
        })
        .catch((e) => console.warn("clarity-insight ghl webhook failed:", e));
    }

    return new Response(JSON.stringify(result.data), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("clarity-insight error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
