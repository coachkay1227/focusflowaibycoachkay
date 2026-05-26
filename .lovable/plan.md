## Phase 3.4 — Launch Readiness Audit Plan

This is a 12-step, read-mostly audit. I'll execute steps sequentially, reporting after each, and only make code changes per the Fix Discipline rules (auto-fix trivial, auto-fix-with-diff small, FLAG anything touching Stripe/pricing/auth/compliance/copy substantively).

### Execution approach per step

**Step 1 — Route inventory.** Read `src/App.tsx` + every route component header (just enough to confirm imports + `<SEOHead>` presence). Run `scripts/check-seo-regressions.ts`. Report matrix.

**Step 2 — Stripe SKU verification.** Read `supabase/functions/_shared/stripe-config.ts`, `book-catalog.ts`, and grep for `startCheckout(` / `priceId:` / `create-autism-checkout` / `create-book-checkout` across `src/`. Build SKU↔CTA matrix. FLAG (do not edit) any Transformation Lane / Lead Engine SKUs that don't exist — these are price/SKU changes.

**Step 3 — Webhook branches.** Read `supabase/functions/stripe-webhook/index.ts` end-to-end. Verify branch order, `processed_stripe_events` guard per branch, `PROTECTED_TIERS` on `subscription.deleted`, `webhook_failures` writes. Report matrix only — no edits unless a real bug (per rule 5, stripe-webhook is protected except missing branch handlers).

**Step 4 — GHL coverage.** Grep for `apply-now` / `OfferInquiryDialog` / `ApplyNowDialog` callers; trace payloads. Report path matrix. FLAG missing paths.

**Step 5 — AI flows.** Read each of the 4 edge functions + frontend retry surfaces. Check `generate-business-audit` for offer_slug enum validation against the 29-slug list. Auto-fix-with-diff if validation is missing (small bug fix on existing flow). Report.

**Step 6 — Auth integrity.** Read `AuthContext`, `useRoles`, `useAccessLevel`, `useSubscription`, `ProtectedRoute`, `handle_new_user` trigger. Verify bootstrap admin emails. Report. Do not modify protected files.

**Step 7 — Email templates.** Read `supabase/functions/_shared/transactional-email-templates/registry.ts` + each template. Verify the autism + audit templates exist (last audit flagged autism as missing — re-confirm current state). FLAG any still-missing templates as USER action.

**Step 8 — FAQ + SEO + llms.txt.** Read all 5 FAQ-bearing pages, validate JSON-LD parses, read `public/llms.txt` + `public/sitemap.xml`. Cross-check prices in llms.txt against `stripe-config.ts`. Auto-fix-with-diff for pricing drift in llms.txt (data-file, not copy).

**Step 9 — Compliance + copy sweep.** `rg` for `501c3|501\(c\)\(3\)`, `Focus Flow Elevation|Forward Focus Elevation|FocusFlow AI`, `focusflow_30|focusflow_90|focusflow_6mo`, `insurance.*reimburs`. Auto-fix trivial findings (typos, dead slugs, 501c3 misattribution per global rule). FLAG substantive copy changes.

**Step 10 — Analytics.** Read `src/lib/analytics.ts`, grep `trackEvent(` call sites. Read `index.html` for tracking scripts. Report coverage + FLAG decision items.

**Step 11 — Mobile + a11y + perf.** Spot-check `MobileNav`, modals (`ApplyNowDialog`, `OfferInquiryDialog`, `AutismIntakeModal`, `AuditIntake`), images for alt text, lazy routes in App.tsx. Auto-fix trivial a11y gaps (missing alt, aria-label, button type). Report perf flags.

**Step 12 — Build + 8 flow traces.** Already-passing typecheck/build verified via harness. Re-run `scripts/check-seo-regressions.ts`. Code-trace flows A–H step-by-step against the source files. Report individual pass/fail.

### Fix discipline I will apply
- **Auto-fix silently:** typos, missing imports, broken anchors, dead slugs, unused vars, missing alt/aria, console.log left in prod, 501c3 misattribution.
- **Auto-fix with diff:** llms.txt pricing drift, missing validation on AI offer_slug enum, missing loading/error states on existing flows.
- **FLAG (no edit):** any new Stripe SKU, any pricing change, any auth-flow change, any substantive copy rewrite, any Forward Focus / autism reimbursement language, any architecture decision, missing Transformation/Lead Engine SKUs, missing email templates beyond what already exists.

### Do not touch
- AuthContext, useSubscription, useAccessLevel, create-checkout, ReportView, generate-business-audit (except adding offer_slug validation), clarity-insight, coach-chat, pattern-detect, ApplyNowDialog, OrderSuccess, AuditIntake, AuditReport, AuditLanding, Resend `from:` addresses.
- stripe-webhook (except adding a missing branch handler if one is genuinely broken).

### Deliverable
Single consolidated markdown report in the exact format specified, with per-step ✅/🔧/⚠️/❌ status, full matrices, BEFORE/AFTER diffs for every fix, and the three-tier final issue list (CRITICAL / RECOMMENDED / DEFERRED) + the live Stripe test-mode checklist for the user.

### Estimated scope
~12 sequential checkpoints, mostly read-only. Expect 0–8 small auto-fixes (llms.txt pricing, a11y, dead slugs, offer_slug validation). Anything bigger gets flagged, not changed. No new files created unless a critical bug demands one.

Ready to execute on approval.