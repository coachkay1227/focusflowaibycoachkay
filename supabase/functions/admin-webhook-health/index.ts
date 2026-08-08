// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * Admin-only read of Stripe webhook health.
 *
 * `webhook_failures` is service-role only, so admins cannot read it from the
 * browser. This exposes just the counts and the latest failure so a broken
 * fulfillment path is visible instead of silent.
 */
serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const { data: userData, error: userErr } = await admin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { count: failures7d } = await admin
      .from("webhook_failures")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);

    const { data: latest } = await admin
      .from("webhook_failures")
      .select("stage, reason, message, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // A processed event proves signature verification is working end to end.
    const { count: processed7d } = await admin
      .from("processed_stripe_events")
      .select("event_id", { count: "exact", head: true })
      .gte("processed_at", since);

    const { data: lastProcessed } = await admin
      .from("processed_stripe_events")
      .select("event_id, event_type, processed_at")
      .order("processed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const verifierBroken = latest?.stage === "selfcheck";

    return json({
      failures_7d: failures7d ?? 0,
      processed_7d: processed7d ?? 0,
      latest_failure: latest ?? null,
      last_processed: lastProcessed ?? null,
      verifier_broken: verifierBroken,
      status: verifierBroken
        ? "critical"
        : (failures7d ?? 0) > 0
          ? "degraded"
          : "healthy",
    });
  } catch {
    return json({ error: "Unable to read webhook health." }, 500);
  }
});