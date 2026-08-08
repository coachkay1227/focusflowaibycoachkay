// @ts-nocheck
// Re-triggers a missing delivery step for an order that already paid.
//
// Two ways in and nothing else:
//   - Buyer:  the unguessable `cs_...` Stripe session id is the capability.
//   - Admin:  a JWT that passes has_role(uid, 'admin'), addressed by session id.
//
// Hard rules:
//   - Resends go ONLY to the address already on the order or the Stripe session.
//     A caller-supplied address is never accepted.
//   - Capped at 3 next-steps sends per order per hour, counted from
//     email_send_log rows that already exist.
//   - Every action is idempotent on the session id and writes an audit row.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  readFulfillmentStages,
  countRecentSends,
  ORDER_TABLES,
} from "../_shared/fulfillment-stages.ts";
import { sendNextStepsEmail } from "../_shared/next-steps-email.ts";
import { logOrderAudit } from "../_shared/order-audit.ts";

const ACTIONS = ["resend_next_steps", "reissue_access_link", "regenerate_report"] as const;
type Action = typeof ACTIONS[number];
const RESEND_CAP_PER_HOUR = 3;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body.session_id === "string" ? body.session_id : "";
    const action = typeof body.action === "string" ? body.action : "";

    if (!sessionId.startsWith("cs_") || sessionId.length > 200) {
      return json({ error: "invalid session_id" }, 400);
    }
    if (!ACTIONS.includes(action as Action)) {
      return json({ error: "invalid action" }, 400);
    }

    // Optional admin identity. The buyer path needs no JWT; when a JWT is
    // present we only use it to attribute the audit row to a real admin.
    let adminId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: claims } = await admin.auth.getClaims(token);
      const uid = claims?.claims?.sub ?? null;
      if (uid) {
        const { data: isAdmin } = await admin.rpc("has_role", {
          _user_id: uid,
          _role: "admin",
        });
        if (isAdmin === true) adminId = uid as string;
      }
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Internal server error" }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (_e) {
      return json({ error: "session not found" }, 404);
    }

    const settled = session.payment_status === "paid" ||
      session.payment_status === "no_payment_required";
    if (!settled) {
      // Nothing to recover on an unpaid order, and we must never send
      // purchase mail for a payment that never settled.
      return json({ error: "payment not settled" }, 409);
    }

    const sessionEmail = session.customer_details?.email ?? session.customer_email ?? null;
    const snapshot = await readFulfillmentStages(admin, {
      sessionId,
      paymentStatus: session.payment_status ?? null,
      sessionStatus: session.status ?? null,
      customerEmail: sessionEmail,
      mode: session.mode ?? null,
    });

    const productLabel =
      ORDER_TABLES.find((t) => t.table === snapshot.fulfilledIn)?.label ?? null;
    const origin = req.headers.get("origin") || "https://coachkayai.life";

    let result: Record<string, unknown> = {};

    if (action === "resend_next_steps") {
      const recent = await countRecentSends(admin, sessionId, 60);
      if (recent >= RESEND_CAP_PER_HOUR) {
        return json({
          error: `This email has already been sent ${recent} times in the last hour. Give it a few minutes.`,
        }, 429);
      }

      // The address is taken from the order or the Stripe session only.
      let recipient = sessionEmail;
      if (!recipient && snapshot.fulfilledIn && snapshot.recordId) {
        const emailColumn = snapshot.fulfilledIn === "business_audits"
          ? "guest_email"
          : snapshot.fulfilledIn === "one_time_orders"
            ? "guest_email"
            : snapshot.fulfilledIn === "agent_orders"
              ? "guest_email"
              : "client_email";
        const { data } = await admin
          .from(snapshot.fulfilledIn)
          .select(emailColumn)
          .eq("id", snapshot.recordId)
          .maybeSingle();
        recipient = (data?.[emailColumn] as string | null) ?? null;
      }
      if (!recipient) return json({ error: "no email on this order" }, 422);

      await sendNextStepsEmail(admin, {
        sessionId,
        email: recipient,
        name: session.customer_details?.name ?? null,
        productName: productLabel,
        subtotalCents: session.amount_subtotal ?? session.amount_total ?? 0,
        origin,
        reportPending: snapshot.fulfilledIn === "business_audits" &&
          snapshot.stages.some((s) => s.key === "report" && s.state === "pending"),
        // A new key so a deliberate resend is not deduplicated by the provider.
        idempotencyKey: `next-steps-${sessionId}-recovery-${Date.now()}`,
        reason: "recovery",
      });
      result = { resent_to_domain: recipient.split("@")[1] ?? null };
    }

    if (action === "reissue_access_link") {
      if (!snapshot.auditId) return json({ error: "no access link for this order" }, 422);
      const { data: existing } = await admin
        .from("audit_tokens")
        .select("token, expires_at")
        .eq("audit_id", snapshot.auditId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const stillValid = existing?.token &&
        (!existing.expires_at || new Date(existing.expires_at as string) > new Date());

      let token = stillValid ? (existing!.token as string) : "";
      if (!token) {
        token = `aud_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
        const { error: insErr } = await admin.from("audit_tokens").insert({
          token,
          audit_id: snapshot.auditId,
          email: sessionEmail || "",
        });
        if (insErr) return json({ error: "could not issue access link" }, 500);
      }
      result = {
        report_url: `${origin}/audit/report/${snapshot.auditId}?token=${encodeURIComponent(token)}`,
        reused_existing: !!stillValid,
      };
    }

    if (action === "regenerate_report") {
      if (!snapshot.auditId) return json({ error: "no report for this order" }, 422);
      const { data: audit } = await admin
        .from("business_audits")
        .select("id, intake, report")
        .eq("id", snapshot.auditId)
        .maybeSingle();
      if (!audit) return json({ error: "audit not found" }, 404);
      if (audit.report) {
        result = { already_generated: true };
      } else {
        const hasIntake = audit.intake && Object.keys(audit.intake).length > 0;
        if (!hasIntake) return json({ error: "intake is not complete yet" }, 422);
        const { data: tokenRow } = await admin
          .from("audit_tokens")
          .select("token")
          .eq("audit_id", audit.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        // Awaited: an un-awaited call dies with the response.
        const { error: genErr } = await admin.functions.invoke("generate-business-audit", {
          body: { audit_id: audit.id, intake: audit.intake, token: tokenRow?.token },
        });
        if (genErr) return json({ error: "report generation failed" }, 502);
        result = { regenerated: true };
      }
    }

    // Re-read the stages so the caller renders post-recovery truth, not intent.
    const after = await readFulfillmentStages(admin, {
      sessionId,
      paymentStatus: session.payment_status ?? null,
      sessionStatus: session.status ?? null,
      customerEmail: sessionEmail,
      mode: session.mode ?? null,
    });

    await logOrderAudit(admin, {
      action: `order_recovery_${action}`,
      targetTable: snapshot.fulfilledIn,
      targetId: sessionId,
      metadata: {
        by: adminId ? "admin" : "buyer",
        admin_id: adminId,
        record_id: snapshot.recordId,
        result,
        stages_after: after.stages.map((s) => ({ key: s.key, state: s.state })),
      },
    });

    return json({
      ok: true,
      action,
      stages: after.stages,
      complete: after.complete,
      needs_attention: after.needsAttention,
      ...result,
    });
  } catch (_e) {
    return json({ error: "Internal server error" }, 500);
  }
});