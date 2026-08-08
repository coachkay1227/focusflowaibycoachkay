#!/usr/bin/env -S npx -y tsx
/**
 * Build-time guard for transactional email delivery hygiene.
 *
 * Background: QA fixtures addressed to `@example.com` were being sent to Resend,
 * which rejects them with a permanent 422. That wrote 21 `failed` rows into
 * `email_send_log` and made routine test traffic look like a delivery outage.
 * The fix short-circuits reserved domains BEFORE the provider call and logs
 * them as `suppressed`.
 *
 * This script fails the build if that protection is removed, reordered, or
 * quietly reimplemented, so the regression cannot come back unnoticed.
 *
 *   bun run scripts/check-email-delivery-guard.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SHARED = "supabase/functions/_shared/reserved-recipients.ts";
const SEND_FN = "supabase/functions/send-transactional-email/index.ts";
const RETRY_POLICY = "supabase/functions/_shared/email-retry.ts";
const RETRY_FN = "supabase/functions/retry-failed-emails/index.ts";

const errors: string[] = [];
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

// 1. The single source of truth must exist and stay importable by Vitest.
if (!existsSync(join(ROOT, SHARED))) {
  errors.push(`${SHARED} is missing. The reserved-domain rules live there and are unit tested.`);
} else {
  const shared = read(SHARED);
  for (const required of ["example.com", "example.org", "example.net", ".test", ".invalid"]) {
    if (!shared.includes(required)) {
      errors.push(`${SHARED} no longer lists the reserved name "${required}".`);
    }
  }
  // Deno-only specifiers would break the Vitest import and silently drop the
  // unit tests that guard this logic.
  if (/from\s+["'](npm:|https:)/.test(shared)) {
    errors.push(`${SHARED} must not use npm:/https: imports - Vitest imports it directly.`);
  }
}

// 2. The send function must use the shared rule, not its own copy.
if (!existsSync(join(ROOT, SEND_FN))) {
  errors.push(`${SEND_FN} is missing.`);
} else {
  const src = read(SEND_FN);

  if (!src.includes("_shared/reserved-recipients.ts")) {
    errors.push(`${SEND_FN} must import the reserved-domain rule from ${SHARED}.`);
  }
  if (/const\s+RESERVED_EMAIL_(DOMAINS|TLDS)\s*=/.test(src)) {
    errors.push(
      `${SEND_FN} declares its own reserved-domain list. Use the shared rule so the two cannot drift.`,
    );
  }

  const guardAt = src.indexOf("isReservedTestRecipient(");
  const sendAt = src.indexOf("RESEND_ENDPOINT, {");
  if (guardAt === -1) {
    errors.push(
      `${SEND_FN} no longer calls isReservedTestRecipient(). Fake addresses would be sent to the provider and logged as failed.`,
    );
  } else if (sendAt === -1) {
    errors.push(`${SEND_FN}: could not locate the provider send call to verify guard ordering.`);
  } else if (guardAt > sendAt) {
    errors.push(
      `${SEND_FN}: the reserved-domain guard runs AFTER the provider send. It must short-circuit before it.`,
    );
  }

  // The guard is only useful if the short-circuit records `suppressed`.
  const guardBlock = guardAt === -1 ? "" : src.slice(guardAt, guardAt + 900);
  if (!guardBlock.includes("'suppressed'") && !guardBlock.includes('"suppressed"')) {
    errors.push(
      `${SEND_FN}: the reserved-domain branch must log status 'suppressed' so these rows never read as failures.`,
    );
  }

  // Permanent (4xx) vs retryable failures must stay distinguishable.
  if (!src.includes("failure_class")) {
    errors.push(
      `${SEND_FN}: provider failures must record failure_class so a bad address is not mistaken for an outage.`,
    );
  }

  // 3. Every failed retryable send must be queued for automatic recovery.
  if (!src.includes("_shared/email-retry.ts")) {
    errors.push(`${SEND_FN} must import the retry policy from ${RETRY_POLICY}.`);
  }
  const failBlocks = src.split("status: 'failed'").slice(1);
  const providerFailBlocks = failBlocks.filter((b) => b.includes("enqueueDeliveryRetry"));
  if (!src.includes("enqueueDeliveryRetry(")) {
    errors.push(
      `${SEND_FN} no longer queues failed sends for retry. A provider outage would silently drop reports.`,
    );
  } else if (providerFailBlocks.length < 2) {
    errors.push(
      `${SEND_FN}: both provider failure paths (non-OK response and thrown exception) must call enqueueDeliveryRetry.`,
    );
  }
}

// 4. The retry policy and worker must exist, and the cap must stay finite.
if (!existsSync(join(ROOT, RETRY_POLICY))) {
  errors.push(`${RETRY_POLICY} is missing. The backoff schedule and cap live there and are unit tested.`);
} else {
  const policy = read(RETRY_POLICY);
  if (/from\s+["'](npm:|https:)/.test(policy)) {
    errors.push(`${RETRY_POLICY} must not use npm:/https: imports - Vitest imports it directly.`);
  }
  if (!/MAX_RETRY_ATTEMPTS/.test(policy) || !/RETRY_BACKOFF_MS/.test(policy)) {
    errors.push(`${RETRY_POLICY} must export RETRY_BACKOFF_MS and MAX_RETRY_ATTEMPTS.`);
  }
}

if (!existsSync(join(ROOT, RETRY_FN))) {
  errors.push(`${RETRY_FN} is missing. Nothing would ever drain email_delivery_retries.`);
} else {
  const worker = read(RETRY_FN);
  if (!worker.includes("nextRetryAt")) {
    errors.push(`${RETRY_FN} must use the shared backoff schedule, not its own timings.`);
  }
  if (!worker.includes('"exhausted"') && !worker.includes("'exhausted'")) {
    errors.push(`${RETRY_FN} must mark rows exhausted at the cap instead of retrying forever.`);
  }
  if (!worker.includes("suppressed_emails")) {
    errors.push(`${RETRY_FN} must re-check suppression before each retry send.`);
  }
  // Authorization must stay with the shared helper. A table-read "probe" is not
  // sound: PostgREST answers a blocked read with HTTP 200 and an empty array,
  // so the public anon key passes it and the worker becomes a public send
  // trigger.
  if (!worker.includes("authorizeWorkerCaller")) {
    errors.push(
      `${RETRY_FN} must authorize callers with authorizeWorkerCaller from _shared/worker-auth.ts.`,
    );
  }
}

// 5. Every scheduled worker that can send email shares that same authorization.
const WORKER_AUTH = "supabase/functions/_shared/worker-auth.ts";
const SCHEDULED_SENDERS = [
  RETRY_FN,
  "supabase/functions/process-nurture-queue/index.ts",
];
if (!existsSync(join(ROOT, WORKER_AUTH))) {
  errors.push(`${WORKER_AUTH} is missing. Scheduled senders would have no shared authorization.`);
} else {
  const auth = read(WORKER_AUTH);
  if (!auth.includes("is_privileged_caller")) {
    errors.push(`${WORKER_AUTH} must decide authorization with the is_privileged_caller RPC.`);
  }
  for (const rel of SCHEDULED_SENDERS) {
    if (!existsSync(join(ROOT, rel))) continue;
    const src = read(rel);
    if (!src.includes("authorizeWorkerCaller")) {
      errors.push(`${rel} must call authorizeWorkerCaller before doing any work.`);
    }
    if (/\.from\(["']\w+["']\)\s*\n?\s*\.select\(["']id["']\)\s*\n?\s*\.limit\(1\)/.test(src)) {
      errors.push(`${rel} still uses a table-read authorization probe, which the anon key passes.`);
    }
  }
}

if (errors.length) {
  console.error("\nEmail delivery guard check FAILED:\n");
  for (const e of errors) console.error("  - " + e);
  console.error("");
  process.exit(1);
}

console.log("Email delivery guard check passed: reserved recipients are short-circuited before send.");
