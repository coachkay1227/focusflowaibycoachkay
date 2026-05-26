# Phase 3.3 — Hardening Pass (Execution Plan)

This is an audit sprint, not a feature sprint. I will execute the 10 steps **in order**, checkpoint after each, and only modify code when I find an actual bug, security issue, missing functionality, or compliance gap. The final deliverable is a single consolidated markdown report following the format you specified.

## Operating rules (applied throughout)

- Sequential, no skips. Each step reports `✅ CLEAN` / `⚠️ ISSUES FOUND` / `🔧 FIXED`.
- Fixes show BEFORE/AFTER diffs inline in the step's report section.
- Out-of-scope or user-decision-required findings are documented and surfaced in the "Critical Issues Requiring User Action" final section — not fixed.
- No new features. No Resend `from:` changes (domain still pending). No touching working production code without a concrete reason.

## Step-by-step approach

### Step 1 — Supabase Backend Integrity
- Cross-reference `<supabase-tables>` inventory against `supabase/migrations/*` to confirm no orphan tables.
- Build the RLS matrix from policy data already in context; flag any user-data table with RLS disabled or missing INSERT/UPDATE/DELETE coverage.
- Audit the 5 SECURITY DEFINER functions (`has_role`, `get_user_tier`, `handle_new_user`, `claim_audit_token`, `get_audit_by_token`) for `search_path`, cross-user data leakage, and `auth.uid()` vs user-passed identity.
- Walk `supabase/config.toml` and confirm `verify_jwt` per edge function matches its intent (public webhooks/guest flows = false; everything else default/true).
- Confirm `processed_stripe_events` idempotency calls exist in every branch of `stripe-webhook/index.ts`.

### Step 2 — Audit Resume/Retry Flow
- Read `src/pages/AuditIntake.tsx` end-to-end. Trace `?token=`, `?audit_id=`, `?audit_id=…&retry=1`, and `?token=…&audit_id=…` paths.
- Verify ownership check (`auth.uid() === audit.user_id`) and unauth → `/auth?next=` redirect.
- Confirm Dashboard CTAs (`Complete Intake`, `Retry`) pass the correct query params.
- **Fix in place** if any of the four entry paths is broken — this is in-scope per your instructions.

### Step 3 — Stripe Webhook Robustness
- Walk `supabase/functions/stripe-webhook/index.ts` branch-by-branch and produce an idempotency × branch matrix.
- Verify `stripe.webhooks.constructEvent` runs before any business logic.
- Check unique constraint definitions on `business_audits.stripe_session_id`, `autism_orders.stripe_session_id`, `book_orders.stripe_session_id`. If any are missing, that's a critical finding — propose a migration (do not auto-apply without your nod).
- Audit branch detection order to confirm no product ID can match two branches.
- Re-verify `PROTECTED_TIERS` preservation in `customer.subscription.deleted`.

### Step 4 — Token Security
- Inspect token generation in `supabase/functions/stripe-webhook/index.ts` (audit branch) — confirm `crypto.randomUUID()` or equivalent, not `Math.random`.
- Re-read `get_audit_by_token` and `claim_audit_token` for `auth.uid()` enforcement (we already see `p_user_id` is ignored in favor of `auth.uid()` — confirm that's intentional and documented).
- Document the magic-link-in-URL tradeoff and 90-day expiry behavior.

### Step 5 — AI Generation Error Paths
- Trace each of the 4 AI flows (`clarity-insight`, `mac-elaborate`, `generate-starter-report`, `generate-business-audit`) to confirm they use the shared `generateReport` util with consistent 401/402/429/5xx handling.
- Confirm intake is persisted **before** generation in `generate-business-audit` so retries don't lose data or double-charge.
- Check whether `recommended_offer` is validated against the Phase 3.2.5B enum. If not, recommend adding a guard (will fix in place since it's a real bug).

### Step 6 — Autism Orders Flow
- Trace each direct-buy package through `create-autism-checkout` → Stripe → webhook autism branch → `autism_orders` status flip → `send-transactional-email` with the `autism-purchase-confirmation` template.
- Confirm gift-wrap math, recipient note persistence, and inquiry-only routing (`OfferInquiryDialog` pre-filled lane).
- Verify the 3 PDFs (LMN, IEP, HSA/FSA receipt) — static asset reachability and dynamic receipt generation. Flag any missing assets.

### Step 7 — FAQ + Schema Validation
- Mentally parse each emitted JSON-LD `FAQPage` block from the lane pages and `/faq` against schema.org spec.
- Confirm `public/llms.txt` is current (pricing, three-entity distinction, no stale slugs) and served as a static asset.
- Verify the `<details>/<summary>` accordion in `FAQSection.tsx` works on mobile (native element — no JS required, already a11y-correct).
- Confirm anchor scroll behavior (`scroll-mt-24`) on `/faq#lane-*`.

### Step 8 — Build Studio Placeholder
- Search `AuditReport.tsx` for `build_studio_*` slug handling.
- If CTA is a broken link, **fix in place**: change to "Opening Soon — Join Waitlist" that writes to `cohort_registrations` with `source="build_studio_waitlist"`.

### Step 9 — Compliance + Terminology Sweep
- Ripgrep across `src/`, `supabase/`, `public/` for:
  - `501c3`, `501(c)(3)` — verify only attached to COED Columbus, never to Forward Focus Elevation or FocusFlow AI.
  - `FocusFlow Elevation Hub`, `Forward Focus AI`, `Forward Focus 501c3`, `FocusFlow nonprofit` — all should return zero hits.
  - Stale offer slugs: `focusflow_30`, `focusflow_90`, `focusflow_6mo`.
  - Autism packages showing `$0` or `Custom Scope` where they should now have real prices.
  - Unsupported FAQ claims: "Insurance-reimbursable" (vs "often eligible"), unqualified "therapeutic", "Approved by …", outcome guarantees.
- Fix copy in place for any verbatim violations; surface ambiguous cases for your review.

### Step 10 — Typecheck + Build + Final Trace
- `tsc --noEmit` must return 0 errors. Build must succeed (harness runs builds automatically; I will inspect output).
- List clearly dead code added across phases — **list only, do not remove**.
- Confirm `pgmq` queue helpers (`enqueue_email`, `read_email_batch`, `delete_email`, `move_to_dlq`) and `process-email-queue` are intact.
- Produce end-to-end traces for every paid flow listed.
- Verify Dashboard renders cleanly for empty/single/multiple state.
- Hit `/llms.txt` and `/sitemap.xml` via the published URL to confirm 200 + correct content-type.

## Deliverable

A single markdown report in the exact format you specified — one section per step plus the final "Overall Status / Critical Issues Requiring User Action / Recommended Next Steps Before Phase 4" footer.

## Estimated edit surface

Likely **small or zero** in steps 1, 3, 4, 7, 9, 10 (audit-only unless a real bug surfaces). Most probable real fixes:

- **Step 2:** AuditIntake retry/resume wiring may need surgical adjustments.
- **Step 5:** `recommended_offer` enum validation likely needs a guard.
- **Step 8:** Build Studio waitlist CTA likely needs to be added.

Anything destructive or migration-shaped (e.g. adding a missing UNIQUE constraint discovered in Step 3) I will surface as a recommendation and wait for your go-ahead before writing the migration, since migrations are irreversible and you may want to bundle them.

Approve to drop me into build mode and start Step 1.