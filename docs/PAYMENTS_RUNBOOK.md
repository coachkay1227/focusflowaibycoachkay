# Payments Runbook

_Last updated: 2026-06-26._

## Fulfillment model

All Stripe products fulfill via the `stripe-webhook` edge function listening to
`checkout.session.completed`. The post-checkout success page is **best-effort UX
only** — if the buyer closes the tab before the redirect, the webhook still
grants entitlement and sends the confirmation email.

## Idempotency

The webhook inserts every Stripe event id into `processed_stripe_events` BEFORE
running any branch. A duplicate delivery returns `{ received: true, duplicate: true }`
with no side effects. Per-branch lookups (e.g. `book_orders.stripe_session_id`)
act as a secondary guard.

## Product → branch mapping

| Product | Metadata key | Branch | Email template |
| --- | --- | --- | --- |
| Book Store | `book_order_id` | book_orders | `book-order-paid` |
| Autism Stories | `autism_order_id` | autism_orders | `autism-purchase-confirmation` |
| AI Business Audit ($47) | (product id) | business_audits | `audit-purchase-confirmation` |
| Rent-an-Agent (one-time) | (product id) | agent_orders | `agent-order-confirmation` |
| Build Studio | (product id) | one_time_orders | `build-studio-order-confirmation` |
| Advisory | (product id) | one_time_orders | `advisory-purchase-confirmation` |
| Subscriptions | `supabase_user_id` | user_access_levels | `transformation-welcome` / `rent-agent-welcome` |

## Failure handling

`recordFailureAndMaybeAlert` writes to `webhook_failures` and triggers the
`webhook-failure-alert` email if the rolling failure count crosses threshold.
Always check `webhook_failures` first when a buyer reports a missing entitlement.

## Admin overrides

Use `/admin/orders`, `/admin/autism-orders`, or `/admin/users` (Update Tier) to
manually grant entitlement. Both `update-autism-order` and `manage-users` write
to `admin_audit_log` for every change.