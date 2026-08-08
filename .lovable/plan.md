# Post-purchase delivery tracking, retry, and recovery

Right now the confirmation screen only knows two things: is the payment settled, and did an order row appear. If the AI report stalls or the confirmation email never lands, the buyer sees a spinner that eventually stops and has no way out except emailing you. This adds a visible delivery checklist, a buyer-triggered resend, and an admin screen where you can fix any order yourself.

## What the buyer sees

On the confirmation screen, instead of one spinner, a short checklist of the real stages:

```text
Payment confirmed          done
Order recorded             done
Access link created        done
Your report                still writing
Confirmation email         sent to you@example.com
```

Each line reflects backend state, never an assumption. While a stage is pending it says so plainly. If the report or email is still not there after about 30 seconds of polling, the screen stops spinning and shows:

- "Resend my access link" - re-sends the confirmation email to the address on the order (never to a typed-in address), and re-kicks report generation if the report is missing.
- "Read the full report" once the report exists.
- The direct contact line, kept as the last resort.

The same status block and resend button appear on the audit report page when the report has not generated yet, so a buyer who returns from their email also has a way forward.

Retries happen only when someone asks: the buyer clicking resend, or you clicking retry in admin. No background worker.

Guardrails: the checkout session id in the URL is the proof of purchase, and the email always goes to the address stored on the order, so a shared link can never redirect access. Resends are capped (3 per order per hour) so a repeatedly clicked button cannot spam an inbox.

## What you see

New admin screen at `/admin/delivery-status`, linked from the admin dashboard:

- Recent purchases across all five fulfillment tables (audits, one-time orders, agent builds, books, social stories), newest first.
- Per row: buyer email, product, when it was paid, and a stage badge for order row / access link / report / confirmation email.
- Filters for "needs attention" (any stage missing) and a date range, plus search by email or session id.
- Per row actions: Retry report generation, Resend access link. Both write to the existing admin audit log so every manual recovery is traceable.

## Technical notes

Status reporting
- Extend `verify-checkout-session` to return a `stages` object: `payment`, `order`, `access_link`, `report`, `email`. It already resolves the fulfillment table and record id. Add: `audit_tokens` presence for `access_link`, `business_audits.report != null` for `report`, and a latest-status-per-`message_id` lookup in `email_send_log` for the confirmation template tied to that record.
- For non-audit products, `report` is reported as not applicable rather than pending, so a book order never looks stuck.
- Keep polling in `OrderSuccess.tsx` but drive the UI from `stages`; cap at roughly 12 attempts with backoff, then switch to the recovery view instead of the current hard "failed" screen when payment is settled.

Recovery
- New public edge function `resend-fulfillment`: validates the `cs_` session id against Stripe, requires a settled payment, resolves the fulfillment row, then (a) reuses the existing `audit_tokens` row or creates one, (b) invokes `generate-business-audit` when the audit has intake but no report, (c) re-invokes `send-transactional-email` for the product's confirmation template with a fresh idempotency key so the queue actually sends again. Returns the updated stages.
- New admin edge function `recover-fulfillment`: JWT verified, `has_role(auth.uid(), 'admin')` enforced in code, accepts a record id plus action, performs the same steps, and writes an `admin_audit_log` entry.
- New table `fulfillment_recovery_log` (session id, record id, kind, actor, created_at) with grants, RLS restricted to service role writes and admin reads. Powers the resend rate limit and the admin history.

Frontend
- New `src/components/DeliveryStatusPanel.tsx` used by both `OrderSuccess.tsx` and `AuditReport.tsx`, with stage rows and the resend button.
- New `src/pages/admin/AdminDeliveryStatus.tsx`, route registered in `App.tsx` and classified as admin-exempt in the SEO check script, plus a card on the admin dashboard.

Verification
- Unit tests for the stage-derivation helper (audit vs non-audit, missing token, missing report, email dlq) and the rate limiter.
- Playwright pass over the confirmation screen against a real settled test session, checking the checklist renders and the recovery view appears when the report is absent.
- Production build plus the existing role invariant and payment link guards.
