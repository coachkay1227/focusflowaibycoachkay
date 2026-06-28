// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

/** Attach the pre-payment intake JSON to a paid business_audits row
 *  (looked up by stripe_session_id), kick off generation, and return
 *  the audit id + magic-link token so the frontend can route the buyer
 *  to /auth?next=/audit/report/<id>?token=<token>. Public — relies on
 *  the unguessable Stripe session id as the capability. */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body.session_id === "string" ? body.session_id : "";
    const intake = body.intake && typeof body.intake === "object" ? body.intake : null;
    if (!sessionId.startsWith("cs_") || sessionId.length > 200) {
      return new Response(JSON.stringify({ error: "invalid session_id" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Find the audit row created by the stripe-webhook for this session.
    const { data: audit, error: lookupErr } = await supabase
      .from("business_audits")
      .select("id, guest_email, intake, report")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();
    if (lookupErr) throw lookupErr;
    if (!audit) {
      return new Response(JSON.stringify({ error: "audit not found yet", retry: true }), {
        status: 404,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Attach intake if provided and not already present.
    const hasIntake = audit.intake && Object.keys(audit.intake as Record<string, unknown>).length > 0;
    if (intake && !hasIntake) {
      await supabase
        .from("business_audits")
        .update({ intake })
        .eq("id", audit.id);
    }

    // Fetch the latest magic-link token for this audit.
    const { data: tokenRow } = await supabase
      .from("audit_tokens")
      .select("token")
      .eq("audit_id", audit.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fire-and-forget generation so the report is ready by the time the user signs in.
    if (!audit.report && (intake || hasIntake)) {
      supabase.functions.invoke("generate-business-audit", {
        body: { audit_id: audit.id, intake: intake ?? audit.intake, token: tokenRow?.token },
      }).catch(() => {});
    }

    return new Response(
      JSON.stringify({
        ok: true,
        audit_id: audit.id,
        email: audit.guest_email,
        token: tokenRow?.token ?? null,
      }),
      { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});