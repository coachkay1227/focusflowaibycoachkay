# Post-purchase delivery tracking, retry, and recovery (simplified, not yet built)

This replaces the earlier version of this plan. Same buyer outcome, three fewer moving parts: no new table, one edge function instead of two, no new admin page.

## What the buyer sees

On the confirmation screen, a checklist of real backend stages instead of one spinner:

```text
Payment confirmed          done
Order recorded             done
Access link created        done
Your report                still writing
Confirmation email         sent to you@example.com
```

Each line reflects backend state, never an assumption. After roughly 30 seconds of polling with nothing new, the spinner stops and the screen offers:

- "Resend my access link" - re-sends to the address stored on the order, never a typed-in address, and re-kicks report generation if the report is missing.
- "Read the full report" once the report exists.
- The direct contact line as the last resort.

The same panel appears on the audit report page when the report has not generated yet.

Retries happen only when someone asks. No background worker.

Guardrails: the checkout session id in the URL is the proof of purchase. Resends are capped at 3 per order per hour, counted from existing `email_send_log` rows.

## What you see

`/admin/orders` gets a "needs attention" filter, per-row stage badges, and two row actions: Retry report, Resend access link. Both write to `admin_audit_log`.

## Technical notes

- Extend `verify-checkout-session` to return a `stages` object: `payment`, `order`, `access_link`, `report`, `email`. Sources: `audit_tokens` presence, `business_audits.report != null`, latest status in `email_send_log` for the record's confirmation template. Non-audit products report `report` as not applicable.
- One new edge function `fulfillment-recovery` with two modes. No JWT means the `cs_` session id is the proof. An admin JWT plus `has_role` means a record id is accepted. Both modes run the same steps: reuse or create the `audit_tokens` row, invoke `generate-business-audit` when intake exists but no report, re-invoke `send-transactional-email` with a fresh idempotency key. Returns the updated stages. Writes `admin_audit_log` in admin mode.
- New `src/components/DeliveryStatusPanel.tsx` used by both `OrderSuccess.tsx` and `AuditReport.tsx`.
- No migration. Rate limit reads `email_send_log`, history reads `admin_audit_log`.

## Verification

- Unit tests for stage derivation (audit vs non-audit, missing token, missing report, failed email) and the rate limiter.
- Playwright pass on the confirmation screen against a settled test session, checking the checklist and the recovery view.
- Production build plus the role invariant and payment link guards.
