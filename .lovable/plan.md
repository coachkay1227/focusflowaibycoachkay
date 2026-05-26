# Plan: Re-verify Launch Readiness Audit

The prior 12-step audit summary was produced before recent changes (SEO classifications for `/autism-social-stories` + `/faq`, and the `claim_audit_token` REVOKE migration). This plan re-runs the audit with the current code, fixes trivial drift inline, and flags anything substantive.

## Approach

Sequential, read-mostly. Per-step ✅/🔧/⚠️/❌ with matrices. Fix discipline:
- **Auto-fix silently**: typos, dead slugs, missing alt/aria, console.log, 501c3 misattribution
- **Auto-fix with diff**: llms.txt pricing drift, missing AI enum validation, missing loading/error states
- **FLAG only**: new Stripe SKUs, pricing changes, auth changes, substantive copy, missing email templates

**Do not touch**: AuthContext, useSubscription, useAccessLevel, create-checkout, ReportView, generate-business-audit (except offer_slug validation), clarity-insight, coach-chat, pattern-detect, ApplyNowDialog, OrderSuccess, AuditIntake, AuditReport, AuditLanding, Resend from-addresses, stripe-webhook (except missing branch handlers).

## 12 Steps

1. **Routes & SEO** — verify `App.tsx` routes, `<SEOHead>` present, run `scripts/check-seo-regressions.ts`. Confirm `/autism-social-stories` + `/faq` classified.
2. **Stripe SKU↔CTA matrix** — `_shared/stripe-config.ts`, `book-catalog.ts`, grep `startCheckout(` / `priceId:` / `create-*-checkout`. FLAG missing Transformation/Lead Engine/$3,997 SKUs.
3. **stripe-webhook branches** — order, `processed_stripe_events`, `PROTECTED_TIERS`, `webhook_failures`. Matrix only.
4. **GHL inquiry coverage** — trace ApplyNowDialog / OfferInquiryDialog / AutismIntakeModal / AuditIntake → ghl-webhook.
5. **AI edge functions** — generate-business-audit, clarity-insight, coach-chat, pattern-detect. Auto-fix-with-diff if `offer_slug` enum not enforced.
6. **Auth integrity** — AuthContext, useRoles, useAccessLevel, useSubscription, ProtectedRoute, `handle_new_user`, bootstrap admins. Read-only.
7. **Email templates** — registry + each template. Re-confirm autism-purchase-confirmation status. FLAG missing.
8. **FAQ + SEO + llms.txt** — JSON-LD parses, sitemap entries, llms.txt pricing matches `stripe-config.ts`. Auto-fix-with-diff for llms.txt drift.
9. **Compliance sweep** — `rg` for `501c3`, entity names, `focusflow_30|90|6mo`, insurance reimbursement language. Auto-fix trivial.
10. **Analytics** — `lib/analytics.ts` coverage, `index.html` tracking scripts. Report + decision flag.
11. **Mobile + a11y** — MobileNav, 4 modals, alt/aria/button-type spot-check. Auto-fix trivial.
12. **Build + 8 flow traces** — re-run SEO check + sitemap, code-trace A–H ($47 audit, autism bundles, studio orders, Rent-an-Agent sub + cancel, PROTECTED_TIERS preservation, 30/90-day emails, inquiry → GHL, refunds).

## Deliverable

Single markdown report:
- Per-step status table
- Full matrices (SKU↔CTA, webhook branches, GHL paths, email templates, flows A–H)
- BEFORE/AFTER diffs for every auto-fix
- CRITICAL / RECOMMENDED / DEFERRED issue tiers
- Live Stripe test-mode checklist for user

## Expected scope

0–8 small auto-fixes (most likely: llms.txt pricing, a11y nits, dead slugs, offer_slug validation). Carryover known items (autism-purchase-confirmation template, Resend domain verification, tracking pixel decision, 6-Month Partnership + Lead Engine SKU disposition) get re-flagged, not silently changed. No new files unless a critical bug demands one.
