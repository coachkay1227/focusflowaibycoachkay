# Post-Purchase Nurture Sequence (Audit Buyers)

Three scheduled emails on Day 1, 3, and 7 after a paid $47 AI Business Audit. Phone number and SMS consent get captured now so texting can be switched on later without re-touching the funnel.

## What the buyer experiences

Day 0 already works and does not change: the purchase confirmation fires from the payment webhook, and the report-ready email fires when the AI report finishes generating.

The new sequence starts after that:

- **Day 1 — Your insight.** Leads with the single highest-leverage finding pulled from their actual generated report, plus one concrete action to take this week. Links to the full report.
- **Day 3 — Your access is live.** Confirms what their account now unlocks (dashboard, challenges, community) with direct links, so nothing they paid for sits undiscovered.
- **Day 7 — Book your next step.** One clear scheduling nudge using the live booking URL from admin settings.

Every touch carries the standard unsubscribe footer, and anyone who unsubscribes or bounces is skipped automatically.

## Content boundary

These emails deliver the purchased insight, confirm access, and schedule the next step. They will not carry upsell or promotional copy for other offers — mixing that in turns a fulfillment sequence into a marketing drip, which damages sender reputation and is not supported by the platform's email rules. The Day 7 email points at booking a call, which is the next step of what they already bought.

## Phone and SMS consent

- An optional phone field plus an explicit, unchecked "text me updates about my audit" checkbox is added to the audit intake form (before payment).
- If the phone is still missing after purchase, the confirmation screen asks once more.
- Both are stored on the audit record. Nothing is texted yet — no SMS provider is wired, and none is added in this plan.
- Consent is stored as an explicit boolean with a timestamp, so when SMS is turned on later there is a defensible consent record rather than a guess.

## Technical detail

**Schema.** New `public.nurture_touches` table: `audit_id`, `email`, `step` (1/3/7), `template_name`, `scheduled_for`, `status` (`pending`/`sent`/`skipped`/`failed`), `sent_at`, `last_error`, `is_test`. Unique on `(audit_id, step)` so a re-delivered webhook can never double-enroll. RLS enabled, with `GRANT` for `service_role` (worker) and admin-only read via `has_role`; no `anon` access. Two new columns on `business_audits`: `phone` and `sms_consent_at`.

**Enrollment.** The audit branch of `stripe-webhook` inserts the three pending rows on successful fulfillment, using `ON CONFLICT DO NOTHING`. Rows from the internal fulfillment test are flagged `is_test` and never sent.

**Worker.** New `process-nurture-queue` edge function, service-role only, run by `pg_cron` every 15 minutes following the same `net.http_post` pattern as the existing newsletter job. It claims due rows, sends through the existing `send-transactional-email` function with an idempotency key of `nurture-{audit_id}-{step}`, and records the outcome. If the Day 1 report has not generated yet, that touch is deferred rather than sent empty.

**Templates.** Three new React Email templates registered in the template registry, styled from the existing audit templates so branding stays consistent.

## Verification before I call it done

- A dry run that enrolls a real test audit, fast-forwards the scheduled times, and proves all three emails actually send and land in the send log — not just that the code compiles.
- Unit tests on the scheduling and skip logic: correct day offsets, no double-send, suppressed address skipped, missing-report deferral.
- Confirmation that an unsubscribed address stops receiving the remaining touches.
- Clean typecheck and production build.

## Known limitation, stated up front

There is no signal in this app for "the customer already booked a call" — booking happens off-site and nothing reports back. So the Day 7 nudge will go out even to someone who already booked. Options are to accept it (the copy can be written so it reads fine either way) or to wire booking notifications back into the app, which is separate work. I will write the copy to degrade gracefully and flag this rather than pretend it is handled.