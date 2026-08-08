# Money-Path Trace: $47 AI Business Audit (Evidence-Based)

Scope: the exact failing user action — a visitor pays for the AI Business Audit and expects a report. No code, database, provider, or secret changes were made. Every claim below is backed by a live read.

## Verdict

The fulfillment chain has **never executed once in production**. It is not proven broken — it is **unproven** — and two real defects guarantee data loss on the paths that do run.

## Hard evidence collected

| Check | Result |
|---|---|
| Live Stripe checkout sessions (last 25) | 19 `expired/unpaid` payment + 6 `expired/unpaid` subscription. **Zero paid, ever.** |
| `processed_stripe_events` rows | 0 — the webhook has never received a single event |
| `business_audits` / `one_time_orders` / `agent_orders` / `autism_orders` | 0 rows each |
| `book_orders` | 1 row, stuck at `pending_payment`, its session expired May 6 |
| `email_send_log` | 24 rows, all newsletter/welcome. **No purchase email ever sent.** Two early rows sit in `dlq` with "Emails disabled for this project" |
| Stripe webhook endpoint | enabled; subscribed to `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed` — matches the handler code |
| Legacy trigger.dev endpoint | confirmed `disabled` |

## Step by step: expected vs actual

```text
1 /audit/intake form submit
  expected: lead persisted server-side, then redirect to Stripe
  ACTUAL:   intake written to sessionStorage only, plus Stripe metadata.
            No database row is created.                                    [BROKEN]

2 Stripe Checkout
  expected: some sessions reach paid
  ACTUAL:   100% expire unpaid. No completed purchase in account history.  [UNKNOWN]

3 stripe-webhook checkout.session.completed
  expected: business_audits + audit_tokens rows, confirmation email, GHL event
  ACTUAL:   the code path is complete and correctly guarded, but has never
            run. It inserts `intake: {}` — paid intake data is not carried
            over from Stripe.                                              [UNVERIFIED]

4 Redirect to /audit/landing?lead_id=...
  expected: intake attached to the paid audit
  ACTUAL:   works only in the same browser tab that submitted the form.
            Different device, cleared storage, or resuming from the email
            link means the intake is lost permanently.                     [BROKEN]

5 /order-success
  expected: confirm payment against the backend before claiming success
  ACTUAL:   on a verification error, a missing session_id, or a thrown
            exception it falls through and renders "Payment Confirmed" with
            "access unlocked". It never reads Stripe payment_status.       [FALSE SUCCESS]

6 Admin visibility
  expected: admin sees paid-but-unfulfilled orders and abandoned leads
  ACTUAL:   no lead rows exist to show; order and failure views are empty. [MISSING]

7 Recovery
  expected: a replay or manual fulfillment path
  ACTUAL:   no replay tool; Stripe event replay is the only route.         [PARTIAL]
```

## Points where the interface can claim success before the backend finishes

1. `OrderSuccess.tsx` — three separate paths (no `session_id`, verification error, thrown exception) all land on the "Payment Confirmed" screen. This is the highest reputational risk: an unpaid or failed checkout still shows success.
2. `AuditIntake.tsx` — `toast.success("Intake saved…")` fires in attach mode before report generation is confirmed.
3. Legacy sessions in Stripe history have `success_url` pointing at `stripe.com` and at a Calendly booking widget, bypassing any verification screen entirely.

## Minimal fix plan (three changes, in order)

**F1 — Persist the lead before Stripe.** Fixes steps 1 and 4. On intake submit, insert a `business_audits` row with `status='pending_payment'` and the full intake, pass its id in Stripe metadata, and have the webhook update that row instead of inserting `intake: {}`. Keep sessionStorage as a fallback only. Result: no lead is ever lost, and abandoned carts become a follow-up list.

**F2 — Make /order-success tell the truth.** Verify the session server-side against Stripe `payment_status` and render three distinct states: confirmed, still processing (with retry), and needs help. Never render "Payment Confirmed" from a fallback branch.

**F3 — Prove step 3 with one real transaction.** Run one live $47 checkout using the existing 100%-off code `FFTEST100`, then assert: `processed_stripe_events` has 1 row, the `business_audits` row is paid with intake populated, an `audit_tokens` row exists, `email_send_log` shows `audit-purchase-confirmation` as `sent`, and the magic link renders a real report. Only that full sequence closes the money path.

## Explicitly out of scope

Repointing $297+ offers to the lead-gen page (already built, waiting on the URL), the `SECURITY DEFINER` advisories, and `scam_alerts` public visibility — all previously reviewed and accepted.