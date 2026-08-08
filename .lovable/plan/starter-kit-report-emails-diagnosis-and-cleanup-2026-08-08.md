# starter-kit-report emails: diagnosis and cleanup

## What the data actually shows

There is no delivery bug. Every one of the 8 `failed` rows for `starter-kit-report` was created by my own Phase 2 rate-limit tests, and all 8 went to addresses I invented for those tests:

```text
throttle-test@example.com
throttle-test2@example.com
throttle-test3@example.com
```

Resend refuses `example.com` on purpose and answers with a 422 validation error: "Invalid `to` field. Please use our testing email address instead of domains like `example.com`."

Confirmed by query:
- `starter-kit-report`: 8 failed, 8 pending. All 8 failures are `@example.com`.
- Real (non-`example.com`) recipients for this template: zero rows. It has never been sent to a live address.
- Every other template over the last 14 days is 100% `sent`, no failures: audit-intake-submitted, audit-nurture-insight, audit-purchase-confirmation, audit-report-ready, newsletter-welcome, purchase-next-steps, weekly-newsletter-draft.

So the fix is not to the mail path. The fix is to stop QA from writing fake failures into your delivery record, and to actually prove this one untested template works.

## What to change

### 1. Stop test addresses from being logged as delivery failures

In `send-transactional-email`, before calling Resend, check the recipient domain against the reserved, permanently-undeliverable set: `example.com`, `example.org`, `example.net`, and any `.test`, `.invalid`, or `.localhost` address. For those, skip the send and log a single row with status `suppressed` and reason `reserved_test_domain`, returning a success-shaped response so QA scripts still exercise the code path.

Result: rate-limit and journey tests stop manufacturing red `failed` rows, and `failed` in the log means a real problem again.

### 2. Separate permanent rejections from retryable ones

Right now any non-2xx from Resend is written as `failed` with no distinction. A 422 validation error will never succeed on retry, while a 429 or 5xx will. Record the classification in the log row's metadata (`permanent` vs `retryable`) so the admin views and any future retry logic can tell them apart, and so a bad address never consumes retry budget.

### 3. Attach correlation metadata

The `starter-kit-report` rows have empty `metadata`, unlike other templates, because `generate-starter-report` passes no metadata when invoking the send. Pass the report row id and a `source` value so a failure can be traced back to the report that triggered it.

### 4. Clean the historical noise

The 8 existing `@example.com` rows are QA artifacts, not history worth keeping. Re-label them to `suppressed` with reason `reserved_test_domain` so your dashboards and "needs attention" filters read true. No real sends are touched.

### 5. Prove the template actually delivers

Trigger one real `starter-kit-report` send to an address you own and confirm the `sent` row, the rendered subject, and the report content in the body. This is the only template in the system with no successful real send on record, so it is worth one live check rather than an assumption.

## Technical notes

- Files: `supabase/functions/send-transactional-email/index.ts` (reserved-domain guard, error classification), `supabase/functions/generate-starter-report/index.ts` (metadata on invoke).
- One migration to re-label the 8 QA rows.
- `scripts/qa/phase4-delivery-journey.py` and the Phase 2 rate-limit checks keep passing, since suppressed test addresses still return a success-shaped response.
- Deploy both edge functions after the change, then run the live send check.

## What I am not doing

Not changing the sender domain, the Resend key, the queue, or the retry/cron machinery. Nothing in the data points at them, and all other templates are sending cleanly.
