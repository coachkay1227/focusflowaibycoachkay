# Phase 3 — Delivery visibility and recovery

Goal: after a payment settles, the buyer and you both see the truth of every delivery stage, read from real rows, and can re-trigger the missing piece without code changes. No migration. No new admin page.

## 1. verify-checkout-session returns real stages

Today it returns one flat verdict: `confirmed` or `processing`. It becomes a per-stage report, every value read from a row that exists:

- `payment` — Stripe `payment_status` / session status.
- `order` — the fulfillment row found in `business_audits`, `one_time_orders`, `agent_orders`, `book_orders`, `autism_orders` (already looked up; now reported instead of collapsed).
- `access_link` — an `audit_tokens` row for the audit id, with its expiry.
- `report` — `business_audits.report` non-null (only claimed for audit orders).
- `email` — latest `email_send_log` row for `next-steps-<session_id>`, deduplicated by `message_id`, reporting `pending` / `sent` / `dlq`.

Each stage is `pending | done | failed | not_applicable` plus a short human reason. The existing top-level fields stay so nothing that reads the response breaks.

## 2. One recovery function

New `fulfillment-recovery` with two ways in, nothing else:

- **Buyer:** the `cs_...` session id is the proof. No login needed.
- **Admin:** a JWT that passes `has_role(uid, 'admin')`, addressed by record id.

Rules that make this safe:
- Resends go only to the email already on the order or the Stripe session. A typed-in address is never accepted.
- Capped at 3 resends per order per hour, counted from `email_send_log` rows for that session.
- Actions available: resend next-steps email, re-issue the access link, re-run a missing report. Each is idempotent on the session id.
- Every run writes an `admin_audit_log` row through the existing `logOrderAudit` helper, so it shows on `/admin/audit-log`.

## 3. One shared DeliveryStatusPanel

A single component used by `OrderSuccess.tsx` and `AuditReport.tsx`. It lists each stage with its real state and, when something is stuck, offers one button that calls `fulfillment-recovery`. Copy stays honest: it never says delivered when the row says pending. `OrderSuccess` keeps its existing polling and its "we couldn't confirm this payment" screen.

## 4. /admin/orders gets the same truth

- A "needs attention" filter: settled payment with any stage not done.
- Stage badges on each row.
- Two row actions: resend next-steps, re-issue access link. Both go through the same function and both write to the audit log.

## Gate before this is called done

On a real settled session I break one stage deliberately, show the panel reporting it honestly, click recover, then show you the new backend rows: the `email_send_log` row with a provider message id, the `audit_tokens` row, and the `admin_audit_log` entry. A rendered success screen is not evidence.

## Technical notes

- Files: `supabase/functions/verify-checkout-session/index.ts`, new `supabase/functions/fulfillment-recovery/index.ts`, new `src/components/DeliveryStatusPanel.tsx`, `src/pages/OrderSuccess.tsx`, `src/pages/AuditReport.tsx`, `src/pages/admin/AdminOrders.tsx`.
- Reuses `_shared/next-steps-email.ts`, `_shared/order-audit.ts`, `_shared/cors.ts`, `_shared/rate-limit.ts`.
- `fulfillment-recovery` runs `verify_jwt = false` with in-code validation, matching the pattern used by the other functions here, because the buyer path has no JWT.
- Zod-validated body; no new tables, no schema change.
- Rollback: each item is its own commit; the panel is additive.
