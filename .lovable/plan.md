# Automatic retry for failed starter-kit report delivery

Right now, if a Quick Start Report email fails on the provider's side, nothing tries again. The row sits in the send log as `failed` and the person never gets their report unless someone notices and resends by hand. This adds a worker that retries those sends on its own, waits longer between each attempt, and gives up after a clear limit instead of hammering a bad address forever.

## What gets retried, and what does not

Only failures that could plausibly succeed later:

- **Retried:** provider timeouts, rate limits, and provider-side errors (the failures already tagged `retryable`).
- **Never retried:** rejected or malformed addresses and invalid payloads (already tagged `permanent`). Retrying these is guaranteed to fail again, so they are parked immediately as "needs a human" instead of burning attempts.
- **Never retried:** reserved test addresses and suppressed or unsubscribed recipients. Those are already short-circuited before any send.

## The retry schedule

Four attempts, then stop:

```text
attempt 1   5 minutes after the failure
attempt 2   30 minutes later
attempt 3   2 hours later
attempt 4   6 hours later
--> give up: status 'exhausted', flagged for admin attention
```

Total window is roughly nine hours, which covers a provider outage without leaving a buyer waiting a full day. A recipient who unsubscribes or bounces mid-window is dropped from the queue rather than retried.

## Rebuilding the email safely

A retry cannot reuse the original request body, because the worker only sees the log row. Every `starter-kit-report` send already records the `starter_kit_report_id` it came from, so the worker reads that report back out of the database and rebuilds the email from the stored source. If the report row is gone, the retry is parked rather than guessed at.

The send address always comes from the stored report, never from anything a caller passes in. Each attempt carries its own idempotency key, so a retry after a genuine failure goes through while a double-fired worker cannot send twice.

## Where you see it

- **`/admin/orders`** already has a "Needs attention" filter. Emails that exhausted their retries or hit a permanent failure show up there too, so one screen answers "is anything undelivered right now".
- A small **Delivery retries** panel on the nurture queue console lists in-flight retries with attempt count and next attempt time, plus a "Retry now" button for the impatient case and a "Stop retrying" button to park one manually.

## Technical detail

**New table `email_delivery_retries`** (migration, with GRANTs and RLS: admin read, service_role full):
`id`, `message_id`, `template_name`, `recipient_email`, `source_id` (the starter kit report id), `attempts`, `max_attempts`, `next_attempt_at`, `status` (`pending` / `sent` / `exhausted` / `parked`), `last_error`, `failure_class`, `created_at`, `updated_at`. Unique on `message_id` so one failure never enqueues twice.

**`send-transactional-email`**: when a send fails with `failure_class: 'retryable'` and the template is retry-eligible, upsert a row into `email_delivery_retries` with `next_attempt_at = now() + 5 minutes`. Permanent failures upsert as `parked` so they are still visible without being retried. Retry-eligibility lives in one shared list (`_shared/retryable-templates.ts`), starting with `starter-kit-report`, so adding a template later is a one-line change.

**New function `retry-failed-emails`**: claims due `pending` rows in a small batch, rebuilds `templateData` from `starter_kit_reports`, re-invokes `send-transactional-email`, then marks the row `sent` or schedules the next backoff step, flipping to `exhausted` at the cap. Authorizes exactly like `process-nurture-queue` (bearer probe against a table only service_role and admins can read), so the scheduler can call it but the public cannot. Re-checks suppression immediately before each send.

**Scheduling**: a pg_cron job every 5 minutes, created with the same pattern as the existing nurture worker.

**Tests and guards**:
- Unit tests for the backoff schedule and the cap (attempt 5 never happens), for permanent failures never being scheduled, and for retry-eligibility matching.
- Phase 4 journey gains a section that forces a retryable failure, runs the worker, and asserts in SQL that the retry row advanced and the email reached `sent` — then asserts the whole log still has zero stuck `failed` rows.
- The existing build guard is extended so a failed retryable send always enqueues a retry.
