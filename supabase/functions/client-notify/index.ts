import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

// Authenticated wrapper that proxies a small allow-list of client-triggered
// notifications (welcome on signup, clarity-code result) to the trusted
// server-only send-transactional-email and ghl-webhook functions using the
// service role. Anonymous callers are rejected. Recipients are always
// resolved from the authenticated user's verified email — never from
// client-supplied input — so the endpoint cannot be abused to spam
// arbitrary addresses.

type Action = "welcome" | "clarity_complete" | "onboarding_complete";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  const cors = getCorsHeaders(req);
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  const user = userData.user;

  let body: { action?: Action; data?: Record<string, unknown> } = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const action = body.action;
  const data = (body.data ?? {}) as Record<string, unknown>;

  if (action === "welcome") {
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "welcome-to-focusflow",
        recipientEmail: user.email,
        idempotencyKey: `welcome-${user.id}`,
        templateData: {
          name:
            (user.user_metadata?.full_name as string | undefined) ||
            (user.user_metadata?.name as string | undefined) ||
            undefined,
        },
      },
    });
    await supabase.functions.invoke("ghl-webhook", {
      body: {
        event: "signup",
        payload: { email: user.email, user_id: user.id },
      },
    });
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (action === "clarity_complete") {
    const sessionId = typeof data.sessionId === "string" ? data.sessionId : crypto.randomUUID();
    const insight = (data.insight ?? {}) as Record<string, unknown>;
    const truth = typeof insight.truth === "string" ? insight.truth.slice(0, 4000) : "";
    const pattern = typeof insight.pattern === "string" ? insight.pattern.slice(0, 4000) : "";
    const action_ = typeof insight.action === "string" ? insight.action.slice(0, 4000) : "";
    const moduleId = typeof data.moduleId === "string" ? data.moduleId.slice(0, 100) : undefined;
    const phase = typeof data.phase === "string" ? data.phase.slice(0, 100) : undefined;
    const track = typeof data.track === "string" ? data.track.slice(0, 100) : undefined;
    const name =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      undefined;

    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "clarity-code-result",
        recipientEmail: user.email,
        idempotencyKey: `clarity-code-${sessionId}`,
        templateData: { name, truth, pattern, action: action_ },
      },
    });
    await supabase.functions.invoke("ghl-webhook", {
      body: {
        event: "clarity_session_complete",
        payload: { email: user.email, user_id: user.id, moduleId, phase, track },
      },
    });
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (action === "onboarding_complete") {
    const goal = typeof data.goal === "string" ? data.goal.slice(0, 100) : undefined;
    const name =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      undefined;

    await Promise.allSettled([
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "onboarding-completion",
          recipientEmail: user.email,
          idempotencyKey: `onboarding-complete-${user.id}`,
          templateData: { name, goal },
        },
      }),
      supabase.functions.invoke("ghl-webhook", {
        body: {
          event: "onboarding_complete",
          payload: { email: user.email, user_id: user.id, goal },
        },
      }),
    ]);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Unknown action" }), {
    status: 400,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});