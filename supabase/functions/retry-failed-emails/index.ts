// Worker for automatic recovery of failed transactional email delivery.
//
// A send that failed on the provider's side (timeout, rate limit, 5xx) is
// queued in email_delivery_retries. This worker claims the rows that are due,
// rebuilds each email from its stored source row, and hands it back to
// send-transactional-email. Attempts follow a widening backoff and stop at a
// hard cap, after which the row is marked `exhausted` for a human to look at.
//
// Authorization accepts exactly two credentials (see _shared/worker-auth.ts):
// the service-role key the scheduler pulls from Vault, or a signed-in admin for
// the manual "retry now" button. Without this the function would be a publicly
// callable send trigger.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";
import { authorizeWorkerCaller } from "../_shared/worker-auth.ts";
import { sendNextStepsEmail } from "../_shared/next-steps-email.ts";
import {
  MAX_RETRY_ATTEMPTS,
  nextRetryAt,
  RETRYABLE_TEMPLATES,
} from "../_shared/email-retry.ts";

const BATCH_SIZE = 20;
const SITE_ORIGIN = "https://coachkayai.life";

function json(body: unknown, status = 200, cors: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

interface RetryRow {
  id: string;
  message_id: string;
  template_name: string;
  recipient_email: string;
  source_id: string | null;
  source_ref: string | null;
  attempts: number;
  max_attempts: number;
}

/** Thrown when a row can be seen but can never be rebuilt. Parks, never retries. */
class ParkRow extends Error {}

type Client = ReturnType<typeof createClient>;

async function isSuppressed(supabase: Client, email: string): Promise<boolean> {
  const { data } = await supabase
    .from("suppressed_emails")
    .select("email")
    .eq("email", email.toLowerCase())
    .limit(1);
  return (data ?? []).length > 0;
}

// Each rebuilder re-reads the email's source of truth and re-sends it. The
// recipient always comes from that stored row, never from anything a caller
// supplied, so a retry can never be redirected.
async function resendStarterKitReport(supabase: Client, row: RetryRow, attempt: number) {
  if (!row.source_id) throw new ParkRow("no source record recorded for this send");
  const { data: source } = await supabase
    .from("starter_kit_reports")
    .select("id,email,name,business_type,report")
    .eq("id", row.source_id)
    .maybeSingle();
  if (!source) throw new ParkRow("source record no longer exists");
  if (await isSuppressed(supabase, String(source.email))) {
    throw new ParkRow("recipient is suppressed");
  }

  const report = (source.report ?? {}) as Record<string, unknown>;
  const { error } = await supabase.functions.invoke("send-transactional-email", {
    body: {
      templateName: row.template_name,
      recipientEmail: source.email,
      idempotencyKey: `starter-kit-${source.id}-r${attempt}`,
      metadata: {
        source: "retry-failed-emails",
        starter_kit_report_id: source.id,
        retry_attempt: attempt,
        original_message_id: row.message_id,
      },
      templateData: {
        name: source.name,
        businessType: source.business_type,
        whereYouAre: report.where_you_are ?? null,
        whatToFocusOn: report.what_to_focus_on ?? null,
        actionThisWeek: report.action_this_week ?? null,
      },
    },
  });
  if (error) throw error;
}

async function resendAuditConfirmation(supabase: Client, row: RetryRow, attempt: number) {
  if (!row.source_id) throw new ParkRow("no audit id recorded for this send");
  const { data: audit } = await supabase
    .from("business_audits")
    .select("id,guest_email,guest_name")
    .eq("id", row.source_id)
    .maybeSingle();
  if (!audit) throw new ParkRow("audit record no longer exists");

  const email = audit.guest_email || row.recipient_email;
  if (!email) throw new ParkRow("no recipient on the audit record");
  if (await isSuppressed(supabase, String(email))) throw new ParkRow("recipient is suppressed");

  // The magic link is only useful while its token is still valid.
  const { data: tokenRow } = await supabase
    .from("audit_tokens")
    .select("token,expires_at")
    .eq("audit_id", audit.id)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!tokenRow?.token) throw new ParkRow("audit access token is missing or expired");

  const { error } = await supabase.functions.invoke("send-transactional-email", {
    body: {
      templateName: row.template_name,
      recipientEmail: email,
      idempotencyKey: `audit-confirm-${audit.id}-r${attempt}`,
      metadata: {
        source: "retry-failed-emails",
        audit_id: audit.id,
        retry_attempt: attempt,
        original_message_id: row.message_id,
      },
      templateData: {
        name: audit.guest_name,
        audit_id: audit.id,
        token: tokenRow.token,
        magic_link: `${SITE_ORIGIN}/audit/report/${audit.id}?token=${encodeURIComponent(String(tokenRow.token))}`,
      },
    },
  });
  if (error) throw error;
}

async function resendNextSteps(supabase: Client, row: RetryRow, attempt: number) {
  const sessionId = row.source_ref;
  if (!sessionId) throw new ParkRow("no checkout session recorded for this send");
  const { data: order } = await supabase
    .from("one_time_orders")
    .select("guest_email,guest_name,product_name,price_cents,status")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  if (!order) throw new ParkRow("no paid order found for this checkout session");

  const email = order.guest_email || row.recipient_email;
  if (!email) throw new ParkRow("no recipient on the order record");
  if (await isSuppressed(supabase, String(email))) throw new ParkRow("recipient is suppressed");

  // Booking tier is recomputed from the stored pre-discount price, never reused
  // from the failed attempt.
  await sendNextStepsEmail(supabase as unknown as Parameters<typeof sendNextStepsEmail>[0], {
    sessionId,
    email: String(email),
    name: order.guest_name,
    productName: order.product_name,
    subtotalCents: order.price_cents ?? 0,
    origin: SITE_ORIGIN,
    idempotencyKey: `next-steps-${sessionId}-r${attempt}`,
    reason: "auto_retry",
  });
}

const REBUILDERS: Record<
  string,
  (supabase: Client, row: RetryRow, attempt: number) => Promise<void>
> = {
  "starter-kit-report": resendStarterKitReport,
  "audit-purchase-confirmation": resendAuditConfirmation,
  "purchase-next-steps": resendNextSteps,
};

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const auth = await authorizeWorkerCaller(req, supabaseUrl);
  if (!auth.ok) {
    console.warn("retry-failed-emails rejected unauthorized caller", auth.reason);
    return json({ error: "Forbidden" }, 403, cors);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // An admin can ask for one specific row to be sent immediately.
  let onlyId: string | null = null;
  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (typeof body?.retryId === "string") onlyId = body.retryId;
    } catch {
      // No body is the normal scheduled case.
    }
  }

  const summary = { claimed: 0, sent: 0, rescheduled: 0, exhausted: 0, parked: 0 };

  try {
    let query = supabase
      .from("email_delivery_retries")
      .select(
        "id,message_id,template_name,recipient_email,source_id,source_ref,attempts,max_attempts",
      )
      .order("next_attempt_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (onlyId) {
      // A manual "retry now" reaches parked and exhausted rows too, which is the
      // whole point of the button. Scheduled runs only touch pending work.
      query = query.eq("id", onlyId);
    } else {
      query = query.eq("status", "pending").lte("next_attempt_at", new Date().toISOString());
    }

    const { data: due, error: dueError } = await query;
    if (dueError) throw dueError;

    const rows = (due ?? []) as RetryRow[];
    summary.claimed = rows.length;
    if (rows.length === 0) return json({ ok: true, ...summary }, 200, cors);

    for (const row of rows) {
      const cap = Math.min(row.max_attempts ?? MAX_RETRY_ATTEMPTS, MAX_RETRY_ATTEMPTS);
      const attempt = (row.attempts ?? 0) + 1;
      // The stored counter can never exceed the cap the table allows.
      const recordedAttempts = Math.min(attempt, cap);

      const park = async (reason: string) => {
        await supabase
          .from("email_delivery_retries")
          .update({ status: "parked", last_error: reason.slice(0, 500) })
          .eq("id", row.id);
        summary.parked++;
      };

      try {
        const rebuild = REBUILDERS[row.template_name];
        if (!rebuild || !RETRYABLE_TEMPLATES[row.template_name]) {
          await park(`template ${row.template_name} is not retry-eligible`);
          continue;
        }
        await rebuild(supabase, row, attempt);

        await supabase
          .from("email_delivery_retries")
          .update({ status: "sent", attempts: recordedAttempts, last_error: null })
          .eq("id", row.id);
        summary.sent++;
      } catch (err) {
        // A row that can never be rebuilt is parked for a human instead of
        // burning the remaining attempts on the same certain failure.
        if (err instanceof ParkRow) {
          await park(err.message);
          continue;
        }
        const message = err instanceof Error ? err.message : String(err);
        console.error("email retry attempt failed", row.id, message);
        const due = attempt >= cap ? null : nextRetryAt(attempt);
        await supabase
          .from("email_delivery_retries")
          .update({
            attempts: recordedAttempts,
            last_error: message.slice(0, 500),
            status: due ? "pending" : "exhausted",
            next_attempt_at: (due ?? new Date()).toISOString(),
          })
          .eq("id", row.id);
        if (due) summary.rescheduled++;
        else summary.exhausted++;
      }
    }

    return json({ ok: true, ...summary }, 200, cors);
  } catch (err) {
    console.error("retry-failed-emails error", err);
    return json({ error: "Unable to process delivery retries" }, 500, cors);
  }
});
