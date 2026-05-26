# Full Launch Audit + Email Campaign Plan

## Part 1 — Comprehensive Launch Audit (read-only)

I'll produce a single consolidated report covering everything **working / broken / missing / needs-update** across 10 surfaces. No code changes during the audit — findings only, then we triage.

### Audit surfaces

1. **Routes & SEO** — all 46 routes, `<SEOHead>` coverage, sitemap (28 entries), robots.txt, llms.txt pricing drift, JSON-LD validity, canonical/og tags
2. **Stripe payment surface** — every SKU in `_shared/stripe-config.ts` cross-checked against UI CTAs (`startCheckout`, `priceId`, `create-*-checkout`). Flag missing SKUs (6-Month Partnership $3,997, Lead Engine 5 tiers) and orphaned SKUs
3. **stripe-webhook** — branch coverage (book / autism / audit / tier-map / NO_TIER), idempotency via `processed_stripe_events`, PROTECTED_TIERS preservation, `webhook_failures` alerting
4. **Edge functions inventory** — all 30+ functions: deployment status, JWT verification posture, ESM import compliance, error handling, CORS
5. **Database & RLS** — run linter, verify `user_access_levels` / `user_roles` / `audit_tokens` / `business_audits` / `orders` / `enrollments` policies, SECURITY DEFINER function grants
6. **Auth flow** — AuthContext, ProtectedRoute coverage, bootstrap admins, `handle_new_user` trigger, Google OAuth status, password reset, magic-link audit claim flow
7. **Email infrastructure** — domain status (`notify.coachkayelevates.org`), Resend `from:` verification, template registry (9 templates), queue/cron health, **missing autism-purchase-confirmation template**, GHL webhook coverage
8. **AI flows** — `generate-business-audit` (offer_slug enum), `clarity-insight`, `coach-chat`, `pattern-detect`, `generate-starter-report`, `mac-elaborate`, `weekly-insights` — model usage, JWT, error paths
9. **Compliance & copy** — 501c3 misattribution sweep, dead slug detection, entity naming, refund/disclaimer/terms presence, insurance language
10. **Mobile + a11y + analytics + build** — viewport check at 369px (current), MobileNav, modal a11y, tracking pixel decision, `tsc`, prebuild, SEO regression script, 8 end-to-end flow traces (A: $47 audit · B: autism bundles · C: studio orders · D: Rent-an-Agent sub+cancel · E: PROTECTED_TIERS preservation · F: 30/90-day welcome emails · G: inquiry→GHL · H: refunds)

### Deliverable format

Single markdown report with:
- **Per-surface status table** (✅ working / ⚠️ needs update / ❌ broken / 🔲 missing)
- **Detailed findings** grouped by surface
- **Final 3-tier triage**: 🔴 CRITICAL (blocks launch) · 🟡 RECOMMENDED (do before launch) · 🟢 DEFERRED (post-launch ok)
- **Carryover items** explicitly re-confirmed: Resend domain verification, autism-purchase-confirmation template, 6-Month Partnership SKU disposition, Lead Engine SKU disposition, tracking pixel decision
- **Live Stripe test-mode checklist** (12 flows)

## Part 2 — Final Page + Email Campaign (scoping only, build after audit)

After the audit lands, I need two answers from you to scope cleanly:

**A. The one remaining page** — which one? Likely candidates based on prior phases:
- `/transformations` lane page (Phase 4 scope per memory)
- Something else?

**B. Email campaign scope** — to plan correctly I need:
- **Type**: transactional drip (welcome → day 3 → day 7 → day 30) vs. nurture sequence vs. launch announcement?
- **Audience**: free signups · audit purchasers · autism customers · Rent-an-Agent subs · cohort/transformation enrollees · inquiry-only leads?
- **Trigger source**: enrollment events (Lovable transactional) vs. marketing drip (GHL)? Per project rule: **transactional → Lovable, marketing/drip → GHL**.
- **Number of sequences + emails per sequence** (rough)

## Execution order

1. Run audit (15–20 parallel read calls, no writes)
2. Deliver consolidated report
3. You triage + answer A/B above
4. Switch to build mode for final page + email campaign

## What I will NOT touch during the audit

AuthContext · useSubscription · useAccessLevel · create-checkout · ReportView · ApplyNowDialog · OrderSuccess · AuditIntake/Report/Landing · stripe-webhook (except documenting) · Resend from-addresses · RLS on working tables.

Approve to run the audit.