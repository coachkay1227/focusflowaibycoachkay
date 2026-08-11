// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

/** Attach intake to an existing paid business_audits row, kick off generation,
 *  and return its access details. Stripe returns use the unguessable session
 *  id, email links use the unguessable audit token, and dashboard recovery
 *  requires an authenticated user who owns the paid audit. */
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
    const auditId = typeof body.audit_id === "string" ? body.audit_id : "";
    const magicToken = typeof body.token === "string" ? body.token : "";
    const intake = body.intake && typeof body.intake === "object" ? body.intake : null;

    const bySession = sessionId.startsWith("cs_") && sessionId.length <= 200;
    const byToken = auditId.length > 0 && auditId.length <= 100 && magicToken.startsWith("aud_") && magicToken.length <= 200;
    const byOwnedUser = auditId.length > 0 && auditId.length <= 100 && !byToken;
    if (!bySession && !byToken && !byOwnedUser) {
      return new Response(JSON.stringify({ error: "invalid session_id" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Find the paid audit row: by Stripe session id (post-checkout return),
    // or by audit_id + magic-link token (buyer arrived via email on another device).
    let audit: {
      id: string;
      guest_email: string | null;
      intake: unknown;
      report: unknown;
      status: string | null;
      user_id: string | null;
    } | null = null;
    if (bySession) {
      const { data, error: lookupErr } = await supabase
        .from("business_audits")
        .select("id, guest_email, intake, report, status, user_id")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();
      if (lookupErr) throw lookupErr;
      audit = data;
    } else if (byToken) {
      const { data: tokenMatch, error: tokenErr } = await supabase
        .from("audit_tokens")
        .select("audit_id, expires_at")
        .eq("audit_id", auditId)
        .eq("token", magicToken)
        .maybeSingle();
      if (tokenErr) throw tokenErr;
      const expired = tokenMatch?.expires_at && new Date(tokenMatch.expires_at) < new Date();
      if (tokenMatch && !expired) {
        const { data, error: lookupErr } = await supabase
          .from("business_audits")
          .select("id, guest_email, intake, report, status, user_id")
          .eq("id", auditId)
          .maybeSingle();
        if (lookupErr) throw lookupErr;
        audit = data;
      }
    } else {
      const authHeader = req.headers.get("Authorization") ?? "";
      const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!jwt) {
        return new Response(JSON.stringify({ error: "Sign in to resume this paid audit" }), {
          status: 401,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      const { data: authData, error: authErr } = await supabase.auth.getUser(jwt);
      const ownerId = authData?.user?.id ?? null;
      if (authErr || !ownerId) {
        return new Response(JSON.stringify({ error: "Sign in to resume this paid audit" }), {
          status: 401,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      const { data, error: lookupErr } = await supabase
        .from("business_audits")
        .select("id, guest_email, intake, report, status, user_id")
        .eq("id", auditId)
        .eq("user_id", ownerId)
        .neq("status", "pending_payment")
        .maybeSingle();
      if (lookupErr) throw lookupErr;
      audit = data;
    }
    if (!audit) {
      return new Response(JSON.stringify({ error: "audit not found yet", retry: bySession }), {
        status: 404,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    if (audit.status === "pending_payment") {
      return new Response(JSON.stringify({ error: "payment not confirmed" }), {
        status: 409,
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
