# Phase A findings: $47 AI Business Audit, landing to report to nurture

_Read-only audit. 2026-08-09. Evidence: live database rows, edge function source, and a Playwright pass against the running app._

## Outcome under test

A stranger lands on the audit offer, pays $47, and ends up reading a personalized report, with follow-up email arriving afterward.

## Journey as it actually runs

```text
entry link  ->  /audit/intake (3 steps, 17 fields)
            ->  start-audit-intake        business_audits row, status pending_payment
            ->  create-checkout           Stripe session, metadata carries audit_id
            ->  Stripe hosted checkout
            ->  stripe-webhook            flips row to paid, mints aud_ token, sends confirmation, enqueues 3 nurture touches
            ->  /audit/landing?session_id ->  complete-audit-intake  ->  generate-business-audit (fire and forget)
            ->  /auth  ->  /audit/report/:id?token=...
```

## Item classification

| Item | Verdict | Evidence |
| --- | --- | --- |
| `/audit` route | **Broken (missing)** | Loading `/audit` renders the 404 page. No route exists in `App.tsx`. |
| `/start` guest redirect | **Broken** | `src/pages/Start.tsx:49` and `:166` send guests to `/audit`, which 404s. |
| Shareable offer link for the audit | **Broken** | `src/lib/shareable-offers.ts:26` points the AI Business Audit front door at `/audit`. Every QR code and share link built from it lands on 404. |
| `/audit/intake` form + validation | Working | 3 steps, zod schema, phone optional, SMS consent only recorded with a real number. |
| `start-audit-intake` | Working | 7 rows exist, intake JSON persisted before Stripe, `is_test` auto-flagged for example.com addresses. |
| `create-checkout` | Working | Price validated against `PRICE_MODE_MAP`, `session_id` appended to the success URL, `audit_id` carried in metadata. |
| `stripe-webhook` audit branch | Working | 4 paid rows, each with a session id and an `audit_tokens` row. Idempotent via `processed_stripe_events` plus the unique session id. |
| `/audit/landing` header copy | **Fake success state** | The page prints "PAYMENT CONFIRMED" and "Your audit is being prepared" on mount, before any verification. Loading `/audit/landing` with no `session_id` at all still shows both lines above the error text. |
| Report generation trigger | Working with gaps | Only fired from `complete-audit-intake`, which the buyer reaches by loading the landing page or the report page. Nothing server-side guarantees generation if the buyer never opens either. All 4 paid rows do have reports, so the path works when followed. |
| Guest report access by token | Working | `/audit/report/:id?token=aud_...` renders the full report for a signed-out visitor via `get_audit_by_token`. |
| Report without token | Working | Shows "This audit requires access" and a sign-in button. No data leak. |
| Dashboard "Complete Intake" button | **Broken** | `src/pages/Dashboard.tsx:388` links to `/audit/intake?audit_id=<id>`, but `AuditIntake` only reads `useParams().id` plus a `token` query value. The query param is ignored, so the buyer gets a blank form that creates a second pending audit and asks for $47 again. The correct shape is `/audit/intake/<id>?token=aud_...`, which `AuditReport.tsx:145` already uses. |
| Nurture enrollment | Working with gaps | Idempotent upsert on `(audit_id, step)`, 3 touches planned per buyer. But of 4 paid audits only 1 has all 3 touches and 1 has a single legacy touch. The 2 earliest paid audits have zero touches, since enrollment shipped after them. No backfill exists. |
| Nurture worker | Unknown at runtime | 3 pending touches are all `is_test = true` and scheduled in the future, so the worker has had nothing real to send since Aug 8. Cannot prove the cron path from data alone. |
| Sample report block on `/audit/landing` | Mocked, by design | Hard-coded 72/100 score and sample wins, labeled "Sample only". Honest, but it sits under a fake confirmation header. |
| `sessionStorage` intake copy | Working, redundant | Server row is authoritative; local copy only helps the return trip. |
| Stripe signature failures | Working with gaps | 3 `webhook_failures` rows, all signature stage, all Aug 8 during test traffic. No failures since. Belongs to Phase B. |

## Conflicting rules and duplicate sources of truth

- Two different intake URL shapes for the same job: `/audit/intake/<id>?token=` (correct, used by the report page) and `/audit/intake?audit_id=<id>` (ignored, used by the dashboard).
- Two different front-door paths for the same offer: `/audit` in the shareable-offer table and `/start`, versus `/audit/intake` everywhere else. Only the second one resolves.
- The $47 price id is hard-coded in `AuditIntake.tsx` rather than read from the offer catalog.

## Live data snapshot

- 7 audits: 4 paid, 3 `pending_payment`. All 4 paid rows are `is_test = true`, so no real customer has completed this purchase.
- The newest row, created Aug 8 13:48, is `is_test = false` with a signed-in user and no Stripe session. A real person filled out the entire 17-field intake and never paid.
- 4 `audit_tokens` rows, all unclaimed, expiring Nov 6.
- Emails: `audit-purchase-confirmation` 3 sent, `audit-report-ready` 4 sent, `audit-intake-submitted` 4 sent. Suppressed rows are all test addresses.

## Fix list, ranked by revenue impact

1. Add a real `/audit` sales page (or redirect `/audit` to `/audit/intake`). It is currently a 404 that every share link, QR code, and guest `/start` redirect points at.
2. Fix the dashboard "Complete Intake" link to `/audit/intake/<id>?token=...` so a paid buyer is never asked to pay twice.
3. Stop `/audit/landing` from claiming "PAYMENT CONFIRMED" before `complete-audit-intake` returns ok. Show a neutral working state, and the confirmation only on success.
4. Backfill nurture touches for paid audits that have none, and add a repair pass so a missed enqueue is recoverable.
5. Read the audit price id from the offer catalog instead of hard-coding it in the page.
6. Follow up in Phase B on the 3 Stripe signature failures and on the total absence of checkout-start analytics events.

Nothing was changed in this phase.