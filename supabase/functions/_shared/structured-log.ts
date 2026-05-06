// Lightweight structured logger + failure recorder + throttled alerting.
// Designed for edge functions that need to (a) emit JSON-line logs that
// are easy to grep in analytics, and (b) persist failures so an admin can
// be notified when error rates spike.

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export type LogLevel = "info" | "warn" | "error";

export interface StructuredLog {
  level: LogLevel;
  source: string;
  step: string;
  ts: string;
  request_id?: string;
  event_id?: string;
  event_type?: string;
  reason?: string;
  message?: string;
  ctx?: Record<string, unknown>;
}

export function createLogger(source: string, requestId?: string) {
  const emit = (
    level: LogLevel,
    step: string,
    extra: Partial<StructuredLog> = {},
  ) => {
    const line: StructuredLog = {
      level,
      source,
      step,
      ts: new Date().toISOString(),
      ...(requestId ? { request_id: requestId } : {}),
      ...extra,
    };
    // JSON line keeps fields queryable in log analytics.
    console.log(JSON.stringify(line));
  };
  return {
    info: (step: string, extra?: Partial<StructuredLog>) => emit("info", step, extra),
    warn: (step: string, extra?: Partial<StructuredLog>) => emit("warn", step, extra),
    error: (step: string, extra?: Partial<StructuredLog>) => emit("error", step, extra),
  };
}

export type Logger = ReturnType<typeof createLogger>;

/* -------------------------------------------------------------------------- */
/* Failure recording + alerting                                               */
/* -------------------------------------------------------------------------- */

const ALERT_WINDOW_MINUTES = 15;
const ALERT_THRESHOLD = 5;          // 5+ failures in window -> alert
const ALERT_COOLDOWN_MINUTES = 60;  // don't re-alert within an hour

export interface RecordFailureInput {
  source: string;
  stage: string;
  reason: string;
  message?: string;
  eventId?: string;
  eventType?: string;
  context?: Record<string, unknown>;
}

/**
 * Persist a failure row and, when the failure rate exceeds the threshold,
 * fire a throttled alert email to ALERT_RECIPIENT_EMAIL (if configured).
 * All work is best-effort — we never throw out of here.
 */
export async function recordFailureAndMaybeAlert(
  admin: SupabaseClient,
  logger: Logger,
  input: RecordFailureInput,
): Promise<void> {
  try {
    const { error: insErr } = await admin.from("webhook_failures").insert({
      source: input.source,
      stage: input.stage,
      reason: input.reason,
      message: input.message ?? null,
      event_id: input.eventId ?? null,
      event_type: input.eventType ?? null,
      context: input.context ?? {},
    });
    if (insErr) {
      logger.error("failure_log_insert_failed", { message: insErr.message });
      return;
    }
  } catch (e) {
    logger.error("failure_log_threw", { message: e instanceof Error ? e.message : String(e) });
    return;
  }

  try {
    await maybeFireAlert(admin, logger, input.source);
  } catch (e) {
    logger.error("alert_pipeline_threw", { message: e instanceof Error ? e.message : String(e) });
  }
}

async function maybeFireAlert(
  admin: SupabaseClient,
  logger: Logger,
  source: string,
): Promise<void> {
  const recipient = Deno.env.get("ALERT_RECIPIENT_EMAIL");
  if (!recipient) return;

  const windowStart = new Date(Date.now() - ALERT_WINDOW_MINUTES * 60_000).toISOString();
  const { count, error: countErr } = await admin
    .from("webhook_failures")
    .select("id", { count: "exact", head: true })
    .eq("source", source)
    .gte("created_at", windowStart);

  if (countErr) {
    logger.warn("alert_count_failed", { message: countErr.message });
    return;
  }
  if (!count || count < ALERT_THRESHOLD) return;

  // Cooldown gate
  const { data: state } = await admin
    .from("webhook_alert_state")
    .select("last_alert_at")
    .eq("source", source)
    .maybeSingle();

  const cooldownMs = ALERT_COOLDOWN_MINUTES * 60_000;
  if (state?.last_alert_at && Date.now() - new Date(state.last_alert_at).getTime() < cooldownMs) {
    logger.info("alert_in_cooldown", { ctx: { source, count } });
    return;
  }

  // Reserve the cooldown slot BEFORE sending so concurrent invocations
  // can't double-fire.
  const nowIso = new Date().toISOString();
  const { error: upsertErr } = await admin
    .from("webhook_alert_state")
    .upsert({ source, last_alert_at: nowIso }, { onConflict: "source" });
  if (upsertErr) {
    logger.warn("alert_state_upsert_failed", { message: upsertErr.message });
    return;
  }

  // Fire the alert (best-effort).
  try {
    await admin.functions.invoke("send-transactional-email", {
      body: {
        templateName: "webhook-failure-alert",
        recipientEmail: recipient,
        idempotencyKey: `webhook-alert-${source}-${nowIso}`,
        templateData: {
          source,
          windowMinutes: ALERT_WINDOW_MINUTES,
          failureCount: count,
          threshold: ALERT_THRESHOLD,
        },
      },
    });
    logger.warn("alert_dispatched", { ctx: { source, count, recipient } });
  } catch (e) {
    logger.error("alert_dispatch_failed", { message: e instanceof Error ? e.message : String(e) });
  }
}

/**
 * Convenience helper to construct an admin client with the service role key.
 */
export function createAdminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
}