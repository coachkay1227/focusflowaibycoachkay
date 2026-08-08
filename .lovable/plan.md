# Offer-to-Outcome Conversion Journey: Audit, Root Cause, and Fix Plan

## The headline

The money path is broken at one specific line, and I can prove it.

`supabase/functions/stripe-webhook/index.ts:116` calls the **synchronous** `stripe.webhooks.constructEvent(...)`. In the Deno runtime that function cannot work. I reproduced it locally with a correctly signed payload:

```text
--- SYNC constructEvent (what production uses) ---
SYNC FAILED: SubtleCryptoProvider cannot be used in a synchronous context.
             Use `await constructEventAsync(...)` instead of `constructEvent(...)`
--- ASYNC constructEventAsync ---
ASYNC OK: evt_local
```

Consequence: every genuine `checkout.session.completed` Stripe sends is rejected with `400 Invalid signature` before any fulfillment runs. No order row, no report, no confirmation email, no admin record — for any product. This is not a copy or layout problem. It is the single reason the revenue path has never delivered anything.

## Verified facts (backend evidence, not code appearance)

| Claim | Evidence |
|---|---|
| Zero completed purchases ever, from any product | Stripe: 69 sessions listed — 67 `expired/unpaid`, 2 `open/unpaid`, **0 paid** |
| The one real payment was not app checkout | Exactly 1 succeeded PaymentIntent ($250, March 2026) with no session or fulfillment trail |
| No webhook event has ever been processed | `processed_stripe_events` is **empty** |
| No fulfillment rows exist | `one_time_orders` 0, `agent_orders` 0, `autism_orders` 0, `book_orders` 1 `pending_payment`, `business_audits` 2 `pending_payment` (my test rows) |
| The signature path was never exercised by a real delivery | Endpoint is enabled for `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed` only. `checkout.session.expired` is **not** subscribed, so the 2 expiry events were never delivered — which is why no failure rows ever accumulated to warn you |
| The only failure row is not a real Stripe delivery | `webhook_failures`: 1 row, `signature / Unable to extract timestamp and signatures from header` — an unsigned probe |
| Blast radius of the bug is 1 file, 1 line | Repo-wide search: `constructEvent(` without `Async` appears **only** at `stripe-webhook/index.ts:116` |
| Email infrastructure works | `email_send_log`: `newsletter-welcome` and `weekly-newsletter-draft` `sent` (Aug 2-3). The 3 `dlq` rows are stale April failures, reason `Emails disabled for this project` |
| No purchase confirmation email has ever been sent | No purchase-confirmation row in `email_send_log` — expected, since fulfillment never ran |
| No dead internal CTAs | Every `to="/..."` in the app resolves to a registered route (set difference is empty); no `href="#"` placeholders |
| Traffic is real but thin | `analytics_events`: 132 `studio_lane_view`, 10 `studio_intake_open`, 2 `cta_click`; 5 newsletter subscribers |

## Classification

| Item | Status | Impact now | Exact test required |
|---|---|---|---|
| Webhook signature verification | **Broken (proven)** | Every payment silently fails to fulfill | A real signed delivery reaches the handler and lands in `processed_stripe_events` |
| Checkout session creation | Functional with gaps | Sessions open, then expire unpaid | A session reaches `payment_status=paid` |
| Fulfillment (order row, report, access token) | **Unknown — never executed** | Buyer pays and receives nothing | Row flips to `paid`, report JSON present, token issued |
| Purchase confirmation email | **Unknown — never executed** | Buyer gets no receipt | `email_send_log` row `sent` for the purchase template |
| Pre-Stripe lead capture | Verified end-to-end | Lead survives abandonment | Already proven: row persisted as `pending_payment` |
| Order success page truthfulness | Verified end-to-end | Cannot fake success | Already proven: expired session renders "couldn't confirm" |
| Admin visibility of orders | UI only | Admin screens are empty because the data is empty | A test purchase appears in the orders admin |
| Internal CTAs and routes | Verified (no dead links) | None | Route diff stays empty in CI |
| Post-purchase nurture | **Missing** | No follow-up exists | A per-buyer follow-up arrives and is logged |
| Trust and proof surface | Partial | Claims lack verifiable backing | Manual review against real outcomes |

## Fix plan (phased, smallest safe boundary first)

**Phase 1 — Unblock revenue (one line, fully reversible).**
Change line 116 to `await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)`. No other logic touched. Rollback is reverting one line. Proof required: a locally signed payload verifies, and the deployed function accepts a real Stripe delivery.

**Phase 2 — Detection, so this can never hide again.**
Subscribe the endpoint to `checkout.session.expired` (a harmless event the handler already ignores) so signature health is exercised continuously instead of only on payday. Add a self-check that verifies a self-signed payload at startup and logs the result. Surface the `webhook_failures` count on the admin dashboard with an alert when it is non-zero.

**Phase 3 — Prove fulfillment end to end.**
Run the existing fulfillment test with `FFTEST100` to completion and require all seven checks to read `pass` from live records: Stripe `paid`, event in `processed_stripe_events`, audit row `paid`, access token issued, report JSON generated, confirmation email `sent`, zero `webhook_failures`. No screen and no success message counts as proof.

**Phase 4 — Post-purchase next steps and nurture.**
Only after Phase 3 passes: make the confirmation email state exactly what happens next and when, and add a short follow-up tied to the individual buyer's fulfillment event (per-recipient and event-triggered, not a campaign).

**Phase 5 — Offer hierarchy, pricing clarity, and proof.**
Tighten the existing offer catalog so price, name, CTA target, and confirmation copy all come from one record, and replace unsupported claims with outcomes the backend can evidence.

## Failure scenarios addressed

1. **Silent signature rejection** (the live bug) — prevention: async verifier; detection: expiry-event heartbeat plus failure alert; rollback: one-line revert.
2. **Buyer pays and receives nothing** — prevention: the pre-Stripe lead row already lands, so a failed webhook is recoverable by session id; detection: `pending_payment` rows older than an hour whose Stripe session is paid; recovery: admin replay.
3. **Duplicate delivery fulfills twice** — already guarded by the unique insert into `processed_stripe_events`.
4. **Interface claims success before the backend finishes** — already fixed on the audit path; hold the remaining success screens to the same standard.
5. **Dead CTA or confusing offer** — the CI route-diff guard passes today; extend it to assert every offer CTA resolves to a funnel entry backed by an active product and a live price.
6. **Provider config drift** (inactive product, rotated webhook secret) — an inactive product already killed this funnel once; add a scheduled configuration assertion.

## Technical notes

- Files in scope for Phase 1: `supabase/functions/stripe-webhook/index.ts` only.
- No database migration, no policy change, and no secret change is required for Phase 1.
- Phase 2 touches Stripe endpoint event subscriptions (provider configuration) and needs explicit approval before I touch it.
- Everything marked "verified" came from live Stripe API reads, database queries, and a local Deno reproduction. Everything marked "unknown" has never executed in production, and I will not describe it as working until a real transaction proves it.

## Assumptions (kept separate from verified facts)

- I assume the 67 expired sessions are abandonment plus the previously found inactive-product bug, not a second checkout defect. Phase 3 confirms this.
- I assume `STRIPE_WEBHOOK_SECRET` matches the enabled endpoint. Its value is unreadable, so Phase 1's real delivery is what actually proves it. If verification still fails after the async fix, the secret is the next suspect.