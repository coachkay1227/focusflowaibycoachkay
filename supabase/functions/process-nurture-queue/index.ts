// Worker for the post-purchase audit nurture sequence.
//
// Runs on a schedule, claims the touches that are due, and hands each one to
// send-transactional-email. Every send carries a stable idempotency key, so a
// double-fired cron or a retried batch cannot email anyone twice.
//
// This function is triggered by pg_cron, which cannot present a user JWT, so it
// authenticates on either a service-role bearer token (the pattern the email
// queue cron already uses) or a shared secret header. Without one of those it
// would be a publicly callable send trigger.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import {
  decideTouch,
  extractHighlights,
  idempotencyKeyFor,
  NURTURE_STEPS,
  smsBodyFor,
} from "../_shared/nurture.ts";
const APP_ORIGIN = "https://coachkayai.life";

import { getBookingLinks } from "../_shared/booking-links.ts";

const BATCH_SIZE = 25;

/** Timing-safe string compare so the secret cannot be guessed byte by byte. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface TouchRow {
  id: string;
  audit_id: string;
  email: string;
  step: number;
  template_name: string;
  scheduled_for: string;
  attempts: number | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const expected = Deno.env.get("NURTURE_CRON_SECRET") ?? "";
  const provided = req.headers.get("x-nurture-secret") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const authHeader = req.headers.get("Authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  // Never trust a decoded role claim here. Compare the raw token to the real
  // service-role key so a forged alg:none JWT cannot get in.
  const bySecret = expected.length > 0 && safeEqual(expected, provided);
  const byServiceRole = serviceKey.length > 0 && safeEqual(serviceKey, bearer);

  if (!bySecret && !byServiceRole) {
    console.warn("process-nurture-queue rejected unauthenticated call");
    return json({ error: "Forbidden" }, 403);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    serviceKey,
    { auth: { persistSession: false } },
  );

  const summary = { claimed: 0, sent: 0, deferred: 0, skipped: 0, failed: 0 };

  try {
    const nowIso = new Date().toISOString();
    const { data: due, error: dueError } = await supabase
      .from("nurture_touches")
      .select("id,audit_id,email,step,template_name,scheduled_for,attempts")
      .eq("status", "pending")
      .eq("is_test", false)
      .lte("scheduled_for", nowIso)
      .order("scheduled_for", { ascending: true })
      .limit(BATCH_SIZE);

    if (dueError) throw dueError;

    const touches = (due ?? []) as TouchRow[];
    summary.claimed = touches.length;
    if (touches.length === 0) return json({ ok: true, ...summary });

    const bookingLinks = await getBookingLinks(supabase);

    for (const touch of touches) {
      try {
        const { data: audit } = await supabase
          .from("business_audits")
          .select("id,guest_name,report,status,phone,sms_consent_at")
          .eq("id", touch.audit_id)
          .maybeSingle();

        // An audit that no longer exists can never be nurtured. Retiring the
        // row keeps it from being re-read on every future run.
        if (!audit) {
          await supabase
            .from("nurture_touches")
            .update({ status: "skipped", last_error: "audit_missing" })
            .eq("id", touch.id);
          summary.skipped++;
          continue;
        }

        const { data: suppression } = await supabase
          .from("suppressed_emails")
          .select("email")
          .eq("email", touch.email)
          .limit(1);

        const decision = decideTouch({
          step: touch.step,
          scheduledFor: new Date(touch.scheduled_for),
          hasReport: audit.report !== null && audit.report !== undefined,
          isSuppressed: (suppression ?? []).length > 0,
        });

        if (decision.action === "skip") {
          await supabase
            .from("nurture_touches")
            .update({ status: "skipped", last_error: decision.reason })
            .eq("id", touch.id);
          summary.skipped++;
          continue;
        }

        if (decision.action === "defer") {
          // Push the touch out a day and leave it pending. The report may
          // still be generating, and the day-1 insight is worthless without it.
          await supabase
            .from("nurture_touches")
            .update({
              scheduled_for: new Date(Date.now() + 86_400_000).toISOString(),
              attempts: (touch.attempts ?? 0) + 1,
              last_error: decision.reason,
            })
            .eq("id", touch.id);
          summary.deferred++;
          continue;
        }

        const stepDef = NURTURE_STEPS.find((s) => s.step === touch.step);
        const highlights = extractHighlights(audit.report);
        const templateData: Record<string, unknown> = {
          name: audit.guest_name ?? null,
          audit_id: audit.id,
        };

        if (touch.step === 1) {
          templateData.leak = highlights.leak;
          templateData.action_title = highlights.actionTitle;
          templateData.action = highlights.action;
          templateData.pillar = highlights.pillar;
        }
        if (touch.step === 7) {
          // The audit sits below the paid-call threshold, so the follow-up
          // always points at the free clarity call.
          templateData.bookingUrl = bookingLinks.freeClarityUrl;
        }

        const { error: sendError } = await supabase.functions.invoke(
          "send-transactional-email",
          {
            body: {
              templateName: stepDef?.templateName ?? touch.template_name,
              recipientEmail: touch.email,
              idempotencyKey: idempotencyKeyFor(touch.audit_id, touch.step),
              templateData,
            },
          },
        );

        if (sendError) throw sendError;

        await supabase
          .from("nurture_touches")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            attempts: (touch.attempts ?? 0) + 1,
            last_error: null,
          })
          .eq("id", touch.id);
        summary.sent++;

        // SMS companion, only for buyers who gave a number AND opted in.
        // Handed to the CRM so STOP handling stays in one place. Best effort:
        // a texting failure must not undo a delivered email.
        if (audit.phone && audit.sms_consent_at) {
          const smsBody = smsBodyFor(touch.step, {
            origin: APP_ORIGIN,
            auditId: audit.id,
            bookingUrl: bookingLinks.freeClarityUrl,
          });
          if (smsBody) {
            try {
              await supabase.functions.invoke("ghl-webhook", {
                body: {
                  event: "nurture_sms",
                  payload: {
                    phone: audit.phone,
                    email: touch.email,
                    audit_id: audit.id,
                    step: touch.step,
                    message: smsBody,
                  },
                },
              });
            } catch (smsErr) {
              console.warn("nurture sms failed", touch.id, smsErr);
            }
          }
        }
      } catch (err) {
        // One bad touch must not stop the batch. Record the attempt and let
        // the next run retry it, or park it after repeated failures.
        const message = err instanceof Error ? err.message : String(err);
        const attempts = (touch.attempts ?? 0) + 1;
        console.error("nurture touch failed", touch.id, message);
        await supabase
          .from("nurture_touches")
          .update({
            attempts,
            last_error: message.slice(0, 500),
            status: attempts >= 5 ? "failed" : "pending",
            scheduled_for: new Date(Date.now() + 3_600_000).toISOString(),
          })
          .eq("id", touch.id);
        summary.failed++;
      }
    }

    return json({ ok: true, ...summary });
  } catch (err) {
    console.error("process-nurture-queue error", err);
    return json({ error: "Unable to process nurture queue" }, 500);
  }
});