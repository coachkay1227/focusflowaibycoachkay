## Bundled Remediation — Phases A through D in one pass

To clarify: the previous turn was the **audit report only** — read-only findings. No code was changed in that turn. This plan is the actual fix bundle for the 6 real risks identified (R1–R6).

---

### What gets changed

**1. Webhook idempotency (R1 — High)**
- Edit `supabase/functions/stripe-webhook/index.ts`.
- Add a shared `markEventProcessed(eventId)` helper that inserts into the existing `processed_stripe_events` table with `on conflict do nothing` and returns `false` if the row already existed.
- Wrap every `checkout.session.completed` branch (subscription, agent, autism, book, one-time, audit) in an early-return guard using that helper.
- No schema change — `processed_stripe_events` already exists.

**2. Admin audit log (R2 — Medium)**
- Migration: new table `public.admin_audit_log` with columns `admin_id uuid`, `action text`, `target_table text`, `target_id text`, `metadata jsonb`, `created_at timestamptz default now()`.
- GRANTs: `authenticated` SELECT/INSERT, `service_role` ALL. No `anon`.
- RLS: SELECT and INSERT restricted to `has_role(auth.uid(),'admin')`.
- Wire `AdminViewContext` to insert one row when the "View as user" toggle flips (`action: 'admin_view_toggle'`, `metadata: { enabled }`).
- Wire `manage-users` and `update-autism-order` edge functions to insert a row on every admin write.

**3. CI build-time guard for email templates (R3 — Medium)**
- New script `scripts/check-email-templates.ts`.
- Greps `supabase/functions/**/*.ts` for `sendTransactionalEmail({ template: '<slug>' })` calls and asserts a matching file exists under `supabase/functions/_shared/transactional-email-templates/`.
- Wire into `.github/workflows/seo-regressions.yml` as an additional step (rename workflow conceptually, no file rename needed).

**4. Playwright admin-view E2E (R4 — Medium)**
- New test `tests/admin-view-toggle.spec.ts`.
- Uses existing `playwright-fixture.ts` admin session.
- Flow: login → `/dashboard` → click toggle → assert a paid-tier card shows lock state → click toggle → assert unlocked.

**5. Payments runbook (R5 — Low)**
- New file `docs/PAYMENTS_RUNBOOK.md` documenting that autism/book checkouts fulfill via webhook (authoritative) and the success page is best-effort UX only.

**6. Methodology link on assessment results (R6 — Low)**
- New public route `/methodology` that renders `docs/ASSESSMENT_LOGIC.md` (simple markdown render).
- Add a small "How this assessment is generated →" link in the footer of `AIDisclaimer.tsx` so it appears on `/result`, `/audit/report/:token`, `/agent-result` automatically.

---

### What is NOT touched
- No changes to `user_roles`, `profiles`, `user_access_levels`, RLS on existing tables.
- No changes to Stripe products, prices, or live keys.
- No changes to Voice Bible or email copy.
- No changes to public pricing or marketing routes.
- No changes to `src/integrations/supabase/client.ts` or `types.ts`.

### Execution order (single pass)
1. Migration for `admin_audit_log` (requires approval).
2. After approval: edit `stripe-webhook`, `AdminViewContext`, `manage-users`, `update-autism-order`.
3. Add `scripts/check-email-templates.ts` + workflow step.
4. Add `tests/admin-view-toggle.spec.ts`.
5. Add `/methodology` route + `AIDisclaimer` footer link.
6. Add `docs/PAYMENTS_RUNBOOK.md`.
7. Run build + role-invariant script + new template check to verify zero errors.

Approve and I'll execute the bundle.
