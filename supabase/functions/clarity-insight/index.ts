import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { getCorsHeaders } from "../_shared/cors.ts";
import { generateReport } from "../_shared/generate-report.ts";
import { composeSystemPrompt } from "../_shared/coach-voice.ts";
import { enforceRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const SYSTEM_PROMPT = composeSystemPrompt("clarity-report");

serve(async (req: Request) => {
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

    const limit = await enforceRateLimit("clarity-insight", req, {
      userId: authedUser?.id ?? null,
      email: guestEmail,
      client: supabase,
    });
    if (!limit.allowed) return rateLimitResponse(limit, getCorsHeaders(req));

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

    // Email + GHL webhook. AWAITED: an un-awaited invoke is cancelled when the
    // worker shuts down after the response, which is why these never sent.
    // Recipient is either the verified authed user OR the guest_email captured
    // by our own email gate. We never send to a free-form client-supplied
    // email when an auth user is present.
    const recipientEmail = authedUser?.email ?? guestEmail;
    const recipientName = authedUser?.name ?? guestName ?? undefined;
    if (recipientEmail) {
      const insightData = result.data as { truth?: string; pattern?: string; action?: string };
      const settled = await Promise.allSettled([
        supabase.functions.invoke("send-transactional-email", {
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
        }),
        supabase.functions.invoke("ghl-webhook", {
          body: {
            event: "clarity_session_complete",
            payload: {
              email: recipientEmail,
              user_id: authedUser?.id ?? null,
              moduleId,
              guest: !authedUser,
            },
          },
        }),
      ]);
      settled.forEach((s) => {
        if (s.status === "rejected") console.warn("clarity-insight outbound failed:", s.reason);
      });
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
