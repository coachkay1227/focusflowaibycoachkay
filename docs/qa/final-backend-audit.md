# Final backend audit

_Run: 2026-08-08. Read-only. No schema or code changes were applied._

Legend: **VERIFIED** working as intended, **FIX** needs a change, **N/A** does not apply to this project.

## 1. Connection and error handling — VERIFIED

- The frontend client reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the environment; both are present in `.env`. No hardcoded URLs or keys in `src/`.
- Eight key routes were loaded in a real browser against the running app: `/`, `/dashboard`, `/start`, `/admin/orders`, `/admin/nurture`, `/audit/intake`, `/modules`, `/challenges`. Every route rendered its own content. No blank screens, no error boundary fallbacks, no failed data fetch left the page empty.
- Console output contains only React development warnings (function components given refs, one unrecognized DOM prop). These come from the dev build and do not appear in production. No thrown errors, no unhandled rejections.

## 2. Authentication — VERIFIED

- A real signed-in session was restored and `/dashboard` rendered with the user's name, tier badge, and clarity score.
- Admin access confirmed without any purchase: the admin nav rendered all 20 sections and `/admin/orders` and `/admin/nurture` both loaded live data while the account shows "Free Tier".
- `/start` redirected to `/dashboard` for an account with no pending purchase, which is the intended fallback.
- Email/password, Google, and password reset are all wired through `AuthContext` with `emailRedirectTo` and `redirectTo` scoped to `window.location.origin`.

## 3. Row Level Security — VERIFIED

All 32 tables in the public schema have RLS enabled and at least one policy. Zero tables are unprotected.

The four single-policy tables were reviewed individually and are correct by design:

| Table | Single policy | Why that is right |
| --- | --- | --- |
| `audit_tokens` | service role only | Tokens are read through the `get_audit_by_token` security-definer function, never directly. |
| `processed_stripe_events` | service role only | Webhook idempotency ledger. No client ever reads it. |
| `webhook_alert_state` | service role only | Internal alert throttle. |
| `webhook_failures` | service role only | Internal failure log. |

## 4. Table grants — FIX (low severity, optional)

Every public table grants full privileges (`SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER`) to both `anon` and `authenticated`. This is the legacy Supabase default for this project, not something added by hand.

No data is actually exposed: RLS is on for all 32 tables and every policy scopes access. The grant is the outer door, the policy is the lock, and the lock holds. Verified by loading the app as an anonymous visitor and as a signed-in user.

The optional tightening: revoke `TRUNCATE`, `REFERENCES`, and `TRIGGER` from `anon` and `authenticated` across the public schema, and revoke write privileges from `anon` on the tables whose policies never permit anonymous writes. This is defense in depth, not a live hole. It touches all 32 tables at once, so it should ship on its own and be followed by a full smoke pass rather than bundled with a feature.

## 5. SECURITY DEFINER function exposure — VERIFIED, warnings are intentional

The linter reports 5 warnings, all in this class. Each one was traced to a real caller:

| Function | Callable by | Caller | Verdict |
| --- | --- | --- | --- |
| `get_audit_by_token` | anon, authenticated | `use-audit-access.ts`, `use-buyer-onboarding.ts` | Required. This is the public audit funnel. Revoking anon breaks a guest buyer reaching their own report. |
| `claim_audit_token` | authenticated | `use-audit-access.ts` | Required. Links a guest audit to a new account at signup. Already ignores its `p_user_id` argument and only ever links to `auth.uid()`. |
| `has_role` | authenticated | `use-roles.ts` plus 10 edge functions | Required. This is how the app knows you are an admin. Already refuses to answer for any user other than the caller. |
| `get_user_tier` | authenticated | tier gating | Required. Already refuses to answer for any user other than the caller. |
| `handle_new_user` | service role only | signup trigger | Already closed. Not client callable. |
| `update_updated_at_column` | service role only | timestamp triggers | Already closed, and it is `SECURITY INVOKER`. |

**Conclusion: no change needed.** All 5 warnings are the linter noticing functions that must stay callable for the product to work, and each one carries its own internal caller check. The two that never needed API access are already revoked. These warnings should be marked as accepted rather than "fixed", because closing them would break the audit funnel and admin detection.

## 6. Edge functions — FIX (config hygiene)

41 functions were inventoried against their declared config and the guard actually written in their code. Every function that touches sensitive data has an in-code guard. No function was found relying on config alone.

Guard patterns in use:
- `has_role(auth.uid(), 'admin')` in code: `admin-nurture`, `admin-webhook-health`, `manage-users`, `list-payment-links-status`, `run-audit-fulfillment-test`, `draft-weekly-newsletter`, `send-email`, `generate-business-audit`, `update-autism-order`, `update-book-order`.
- Stripe signature verification with `constructEventAsync`: `stripe-webhook`.
- Caller-bearer authorization probe: `process-nurture-queue`.
- Session id as proof of purchase: `verify-checkout-session`, `verify-book-order`, `verify-autism-order`.
- Intentionally public: `clarity-insight`, `apply-now`, `start-audit-intake`, `complete-audit-intake`, `handle-email-unsubscribe`, `newsletter-subscribe`.

The hygiene gap: 13 functions have no explicit `verify_jwt` line and run on the deploy default, including `admin-nurture`, `process-nurture-queue`, `log-order-next-step`, `manage-users`, and `check-subscription`. They are all safe today because the guard is in the code, but the config no longer documents intent. Recommended: add an explicit `verify_jwt` line for each so the file states the auth model for all 41 functions. Config-only change, no behavior change.

## 7. Quotas and performance — VERIFIED

Top consumers by total execution time:

- The platform email queue poller: 733,220 calls at 0.08 ms mean. Platform managed, nothing to change.
- `app_settings` key lookup: 358 calls, 14.70 ms mean. This is the booking links read. It runs per email send and per page that needs a booking URL. Worth caching in memory inside `getBookingLinks` if send volume grows, not now.
- `analytics_events` inserts: 171 calls, 34-51 ms mean. Write path, expected cost.
- `module_enrollments` full scan ordered by `enrolled_at`: 369 calls, 8.30 ms mean. This is the admin enrollments list with no date filter. Fine at current row counts; add an index on `enrolled_at` if the table passes a few thousand rows.
- `user_access_levels` tier lookup: 3,584 calls, 0.80 ms mean. Primary key lookup, already optimal.

Nothing is looping. The nurture worker batches 25 touches per run and claims only rows that are due and not test rows, so repeated cron firings do no redundant work.

## 8. Storage — N/A

The project has no storage buckets. There are no uploads or downloads to test, and no bucket policies to review. Every file the product delivers goes out through email or a Stripe-hosted link.

## Summary

| Area | Status |
| --- | --- |
| Connection and error handling | VERIFIED |
| Auth, admin bypass, tier gating | VERIFIED |
| RLS on all 32 tables | VERIFIED |
| Table grants | FIX, optional, defense in depth |
| SECURITY DEFINER warnings | VERIFIED, accept all 5 |
| Edge function guards | VERIFIED |
| Edge function config hygiene | FIX, config only |
| Performance and quotas | VERIFIED |
| Storage | N/A |

Nothing here blocks publishing. The two FIX items are hygiene: one config file, and one optional grant tightening that should ship alone.
