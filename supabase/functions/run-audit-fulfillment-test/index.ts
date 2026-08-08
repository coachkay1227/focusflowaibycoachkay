// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * Admin-only end-to-end fulfillment test for the $47 AI Business Audit.
 *
 * action="start"  -> persists a flagged test lead, opens a real $47 Stripe
 *                    Checkout session with the FFTEST100 100%-off promo
 *                    pre-applied, and returns the URL to complete.
 * action="status" -> reports the REAL backend result of every fulfillment
 *                    stage: Stripe payment, webhook event processing,
 *                    database row, magic-link token, report generation,
 *                    confirmation email logging.
 *
 * Nothing here fakes success: every check reads the actual record.
 */

const AUDIT_PRICE_ID = "price_1Tb41PBReje0oFcLMlvzjQQa";
const TEST_PROMO_CODE = "FFTEST100";
const CONFIRM_TEMPLATE = "audit-purchase-confirmation";

type CheckState = "pass" | "fail" | "pending" | "skipped";

interface Check {
  key: string;
  label: string;
  state: CheckState;
  detail: string;
  evidence?: Record<string, unknown>;
}

const TEST_INTAKE = {
  full_name: "Fulfillment E2E Test",
  business_name: "Internal Test Co",
  business_stage: "solo",
  monthly_revenue: "under_5k",
  biggest_bottleneck: "Lead flow is inconsistent and follow-up is manual.",
  primary_goal: "Automate follow-up and book more discovery calls.",
  current_ai_use: "ChatGPT for drafting, nothing systematized.",
  hours_on_admin: "10-20",
  team_size: "just_me",
  target_audience: "Small service businesses in Ohio.",
  offer_description: "Done-with-you operations coaching.",
  pricing_model: "one_time",
  marketing_channels: "Instagram, referrals",
  budget_range: "500_1500",
  timeline: "next_30_days",
  biggest_fear: "Investing in tools that never get used.",
  what_success_looks_like: "A pipeline that runs without me chasing it.",
  _internal_test: true,
};

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
    // ---- Admin gate -------------------------------------------------------
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const { data: userData, error: userErr } = await admin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const caller = userData.user;
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.json().catch(() => ({}));
    const action = body?.action === "status" ? "status" : "start";
    const origin = req.headers.get("origin") || "https://coachkayai.life";

    // =====================================================================
    // START: open a real (but free) checkout session
    // =====================================================================
    if (action === "start") {
      // Confirm the promo code is still usable before promising a $0 test.
      const promos = await stripe.promotionCodes.list({ code: TEST_PROMO_CODE, limit: 1 });
      const promo = promos.data[0];
      if (!promo || !promo.active) {
        return json({ error: `Promo code ${TEST_PROMO_CODE} is missing or inactive in Stripe.` }, 400);
      }
      const coupon = promo.coupon as { percent_off?: number | null; max_redemptions?: number | null; times_redeemed?: number | null } | undefined;
      const remaining =
        coupon?.max_redemptions == null ? null : coupon.max_redemptions - (coupon.times_redeemed ?? 0);
      if (remaining !== null && remaining <= 0) {
        return json({ error: `Promo code ${TEST_PROMO_CODE} has no redemptions left.` }, 400);
      }

      // Verify the price AND its product are purchasable (the exact failure
      // that silently killed this funnel before).
      const price = await stripe.prices.retrieve(AUDIT_PRICE_ID, { expand: ["product"] });
      const product = typeof price.product === "object" ? price.product : null;
      if (!price.active || (product && "active" in product && !product.active)) {
        return json(
          {
            error: "The $47 audit is not purchasable in Stripe.",
            price_active: price.active,
            product_active: product && "active" in product ? product.active : null,
          },
          400,
        );
      }

      // Must be a genuinely deliverable address: the email provider rejects
      // example.com outright, which made the confirmation-email check
      // permanently fail for reasons unrelated to fulfillment. Sub-addressing
      // the admin's own inbox keeps the test real and self-contained.
      const adminEmail = caller.email;
      if (!adminEmail || !adminEmail.includes("@")) {
        return json({ error: "Your admin account needs an email address to run this test." }, 400);
      }
      const [local, domain] = adminEmail.split("@");
      const email = `${local}+fftest${Date.now()}@${domain}`;
      const { data: lead, error: leadErr } = await admin
        .from("business_audits")
        .insert({
          guest_email: email,
          guest_name: TEST_INTAKE.full_name,
          intake: TEST_INTAKE,
          status: "pending_payment",
          is_test: true,
        })
        .select("id")
        .single();
      if (leadErr || !lead?.id) {
        console.error("[E2E-TEST] lead_insert_failed", leadErr?.message);
        return json({ error: "Could not persist the test lead." }, 500);
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: AUDIT_PRICE_ID, quantity: 1 }],
        discounts: [{ promotion_code: promo.id }],
        customer_email: email,
        success_url: `${origin}/audit/landing?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/admin/fulfillment-test?cancelled=1`,
        metadata: {
          price_id: AUDIT_PRICE_ID,
          audit_id: lead.id,
          user_email: email,
          full_name: TEST_INTAKE.full_name,
          supabase_user_id: "",
          e2e_test: "true",
          run_by: caller.id,
        },
      });

      await admin.from("admin_audit_log").insert({
        admin_id: caller.id,
        action: "run_audit_fulfillment_test",
        target_table: "business_audits",
        target_id: lead.id,
        metadata: { session_id: session.id, email, promo: TEST_PROMO_CODE },
      });

      console.log("[E2E-TEST] started", { audit_id: lead.id, session_id: session.id });
      return json({
        ok: true,
        audit_id: lead.id,
        session_id: session.id,
        checkout_url: session.url,
        email,
        amount_total: session.amount_total,
        promo_remaining: remaining,
      });
    }

    // =====================================================================
    // STATUS: read the real result of every fulfillment stage
    // =====================================================================
    const sessionId = typeof body?.session_id === "string" ? body.session_id : "";
    if (!sessionId.startsWith("cs_")) return json({ error: "session_id required" }, 400);

    const checks: Check[] = [];
    const push = (c: Check) => checks.push(c);

    // 1. Stripe payment ----------------------------------------------------
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["total_details"],
    });
    const settled = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    push({
      key: "stripe_payment",
      label: "Stripe checkout completed",
      state: settled ? "pass" : session.status === "expired" ? "fail" : "pending",
      detail: settled
        ? `Session ${session.status}, payment_status=${session.payment_status}, charged $${((session.amount_total ?? 0) / 100).toFixed(2)} (discount $${((session.total_details?.amount_discount ?? 0) / 100).toFixed(2)}).`
        : session.status === "expired"
          ? "Session expired without completing. Run the test again."
          : "Waiting for you to complete the Stripe checkout page.",
      evidence: {
        session_status: session.status,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        amount_discount: session.total_details?.amount_discount ?? null,
      },
    });

    const auditId =
      (session.metadata?.audit_id as string | undefined) ||
      (typeof body?.audit_id === "string" ? body.audit_id : "");
    const email =
      (session.metadata?.user_email as string | undefined) ||
      session.customer_details?.email ||
      "";

    // 2. Webhook event received + marked processed --------------------------
    let webhookEventId: string | null = null;
    try {
      const events = await stripe.events.list({ type: "checkout.session.completed", limit: 100 });
      const match = events.data.find(
        (e) => (e.data?.object as { id?: string } | undefined)?.id === sessionId,
      );
      webhookEventId = match?.id ?? null;
    } catch (e) {
      console.error("[E2E-TEST] event_lookup_failed", (e as Error).message);
    }

    let processedRow: { event_id: string; processed_at: string } | null = null;
    if (webhookEventId) {
      const { data } = await admin
        .from("processed_stripe_events")
        .select("event_id, processed_at")
        .eq("event_id", webhookEventId)
        .maybeSingle();
      processedRow = data ?? null;
    }
    push({
      key: "webhook",
      label: "Webhook processed the event",
      state: processedRow ? "pass" : settled ? "pending" : "skipped",
      detail: processedRow
        ? `Event ${processedRow.event_id} recorded in processed_stripe_events at ${processedRow.processed_at}.`
        : settled
          ? webhookEventId
            ? `Stripe fired ${webhookEventId} but it is not in processed_stripe_events yet.`
            : "Stripe has not emitted checkout.session.completed for this session yet."
          : "Waiting on payment.",
      evidence: { stripe_event_id: webhookEventId, processed_at: processedRow?.processed_at ?? null },
    });

    // 3. Database row claimed / created ------------------------------------
    const { data: auditRow } = await admin
      .from("business_audits")
      .select("id, status, guest_email, stripe_session_id, intake, report, generated_at, recommended_offer, is_test, created_at")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();
    const intakeKeys = auditRow?.intake ? Object.keys(auditRow.intake as Record<string, unknown>).length : 0;
    push({
      key: "db_row",
      label: "business_audits row fulfilled",
      state: auditRow ? (auditRow.status === "paid" && intakeKeys > 0 ? "pass" : "fail") : settled ? "pending" : "skipped",
      detail: auditRow
        ? `Row ${auditRow.id} status=${auditRow.status}, intake fields=${intakeKeys}, is_test=${auditRow.is_test}.`
        : settled
          ? "No row carries this session id yet — the webhook has not claimed the pending lead."
          : "Waiting on payment.",
      evidence: {
        audit_id: auditRow?.id ?? auditId ?? null,
        status: auditRow?.status ?? null,
        intake_field_count: intakeKeys,
      },
    });

    // 4. Magic-link token --------------------------------------------------
    const resolvedAuditId = auditRow?.id || auditId;
    let tokenRow: { token: string; expires_at: string } | null = null;
    if (resolvedAuditId) {
      const { data } = await admin
        .from("audit_tokens")
        .select("token, expires_at")
        .eq("audit_id", resolvedAuditId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      tokenRow = data ?? null;
    }
    push({
      key: "access_token",
      label: "Report access link issued",
      state: tokenRow ? "pass" : auditRow ? "pending" : "skipped",
      detail: tokenRow
        ? `Magic-link token issued, expires ${tokenRow.expires_at}.`
        : auditRow
          ? "No audit_tokens row yet — the buyer would have no way into the report."
          : "Waiting on fulfillment.",
      evidence: { expires_at: tokenRow?.expires_at ?? null },
    });

    // 5. Report generation (mirrors what the buyer's landing page triggers)
    let reportGenerated = !!auditRow?.report;
    let generationTriggered = false;
    if (auditRow && !reportGenerated) {
      generationTriggered = true;
      try {
        await admin.functions.invoke("complete-audit-intake", {
          body: { session_id: sessionId, intake: auditRow.intake ?? TEST_INTAKE },
        });
      } catch (e) {
        console.error("[E2E-TEST] generation_invoke_failed", (e as Error).message);
      }
      const { data: after } = await admin
        .from("business_audits")
        .select("report, generated_at, recommended_offer")
        .eq("id", auditRow.id)
        .maybeSingle();
      reportGenerated = !!after?.report;
      if (after) {
        auditRow.generated_at = after.generated_at;
        auditRow.recommended_offer = after.recommended_offer;
      }
    }
    const reportSections = auditRow?.report && typeof auditRow.report === "object"
      ? Object.keys(auditRow.report as Record<string, unknown>).length
      : 0;
    push({
      key: "report",
      label: "AI report generated",
      state: reportGenerated ? "pass" : auditRow ? "pending" : "skipped",
      detail: reportGenerated
        ? `Report stored (${reportSections} top-level keys), generated_at=${auditRow?.generated_at ?? "—"}, recommended_offer=${auditRow?.recommended_offer ?? "—"}.`
        : auditRow
          ? generationTriggered
            ? "Generation was just triggered — re-check in a few seconds."
            : "No report JSON on the row yet."
          : "Waiting on fulfillment.",
      evidence: { generated_at: auditRow?.generated_at ?? null, recommended_offer: auditRow?.recommended_offer ?? null },
    });

    // 6. Confirmation email logged ----------------------------------------
    let emailRows: { status: string; template_name: string; message_id: string | null; error_message: string | null; created_at: string }[] = [];
    if (email) {
      const { data } = await admin
        .from("email_send_log")
        .select("status, template_name, message_id, error_message, created_at")
        .eq("recipient_email", email)
        .order("created_at", { ascending: false })
        .limit(10);
      emailRows = data ?? [];
    }
    const confirmEmail = emailRows.find((r) => r.template_name === CONFIRM_TEMPLATE);
    const emailOk = confirmEmail && /sent|delivered|ok|success/i.test(confirmEmail.status);
    push({
      key: "email",
      label: "Confirmation email logged",
      state: emailOk ? "pass" : confirmEmail ? "fail" : auditRow ? "pending" : "skipped",
      detail: confirmEmail
        ? `${CONFIRM_TEMPLATE} → ${email}: status=${confirmEmail.status}${confirmEmail.error_message ? ` (${confirmEmail.error_message})` : ""}, logged ${confirmEmail.created_at}.`
        : auditRow
          ? `No ${CONFIRM_TEMPLATE} entry in email_send_log for ${email} yet.`
          : "Waiting on fulfillment.",
      evidence: {
        recipient: email,
        message_id: confirmEmail?.message_id ?? null,
        all_templates_logged: emailRows.map((r) => `${r.template_name}:${r.status}`),
      },
    });

    // 7. Any recorded webhook failures for this run ------------------------
    const { data: failures } = await admin
      .from("webhook_failures")
      .select("source, stage, reason, message, created_at, context")
      .order("created_at", { ascending: false })
      .limit(25);
    const relevant = (failures ?? []).filter((f) => {
      const ctx = JSON.stringify(f.context ?? {});
      return ctx.includes(sessionId) || (resolvedAuditId && ctx.includes(resolvedAuditId));
    });
    push({
      key: "failures",
      label: "No recorded fulfillment failures",
      state: relevant.length === 0 ? "pass" : "fail",
      detail: relevant.length === 0
        ? "webhook_failures has nothing logged for this run."
        : `${relevant.length} failure(s) logged: ${relevant.map((f) => `${f.stage}/${f.reason}`).join(", ")}.`,
      evidence: { failures: relevant },
    });

    const blocking = checks.filter((c) => c.state === "fail");
    const waiting = checks.filter((c) => c.state === "pending");
    const overall = blocking.length > 0 ? "failed" : waiting.length > 0 ? "in_progress" : "passed";

    return json({
      ok: true,
      overall,
      session_id: sessionId,
      audit_id: resolvedAuditId || null,
      email,
      report_url: resolvedAuditId && tokenRow
        ? `${origin}/audit/report/${resolvedAuditId}?token=${encodeURIComponent(tokenRow.token)}`
        : null,
      checks,
      checked_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[E2E-TEST] exception", (e as Error).message);
    return json({ error: "Internal server error" }, 500);
  }
});