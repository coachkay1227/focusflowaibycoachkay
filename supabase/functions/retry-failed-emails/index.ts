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
import {
  MAX_RETRY_ATTEMPTS,
  nextRetryAt,
  RETRYABLE_TEMPLATES,
} from "../_shared/email-retry.ts";

const BATCH_SIZE = 20;

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
  attempts: number;
  max_attempts: number;
}

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
      .select("id,message_id,template_name,recipient_email,source_id,attempts,max_attempts")
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
        const spec = RETRYABLE_TEMPLATES[row.template_name];
        if (!spec) {
          await park(`template ${row.template_name} is not retry-eligible`);
          continue;
        }
        if (!row.source_id) {
          await park("no source record recorded for this send");
          continue;
        }

        // Rebuild the payload from the stored source. The recipient always comes
        // from that row, never from anything a caller supplied.
        const { data: source } = await supabase
          .from(spec.sourceTable)
          .select("id,email,name,business_type,report")
          .eq("id", row.source_id)
          .maybeSingle();

        if (!source) {
          await park("source record no longer exists");
          continue;
        }

        // Someone who unsubscribed or bounced mid-window is dropped, not retried.
        const { data: suppression } = await supabase
          .from("suppressed_emails")
          .select("email")
          .eq("email", String(source.email).toLowerCase())
          .limit(1);
        if ((suppression ?? []).length > 0) {
          await park("recipient is suppressed");
          continue;
        }

        const report = (source.report ?? {}) as Record<string, unknown>;
        const { error: sendError } = await supabase.functions.invoke(
          "send-transactional-email",
          {
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
          },
        );

        if (sendError) throw sendError;

        await supabase
          .from("email_delivery_retries")
          .update({ status: "sent", attempts: recordedAttempts, last_error: null })
          .eq("id", row.id);
        summary.sent++;
      } catch (err) {
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
