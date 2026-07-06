# FocusFlow AI — Stripe Offer Map & Live Verification

**Date:** 2026-06-29 · **Method:** repo-wide code inventory + read-only Stripe API
(live mode). Every price below was checked against the live account: existence,
active flag, amount, and billing mode. **Result: all 45 referenced prices exist,
are active, and match displayed prices and billing modes. Zero mismatches.**

Checkout is centralized in the `create-checkout` edge function, which validates
priceIds against `PRICE_MODE_MAP` (`supabase/functions/_shared/stripe-config.ts`)
and builds success/cancel URLs via `safePath`. Fulfillment is driven by
`stripe-webhook` keyed on **product** IDs.

## Verified offers (price ↔ live Stripe)

| Offer | Displayed | Price ID (suffix) | Live amount | Mode | Status |
|---|---|---|---|---|---|
| AI Business Audit | $47 | …MlvzjQQa | $47.00 | one-time | PASS (fixed 2026-06-29) |
| AI Strategy Intensive | $497 | …jxGozG2X | $497.00 | one-time | PASS |
| Subscriber | $27/mo | …hkxCXesA | $27/mo | recurring | PASS |
| RAA Starter Founding | $297/mo | …QFSaEnr4 | $297/mo | recurring | PASS |
| RAA Starter Standard | $497/mo | …kVgjsUl0 | $497/mo | recurring | PASS |
| RAA Pro Founding | $697/mo | …w6tk3kcg | $697/mo | recurring | PASS |
| RAA Pro Standard | $997/mo | …InI8JGZv | $997/mo | recurring | PASS |
| RAA Dream Team Founding | $997/mo | …LlE6CDGO | $997/mo | recurring | PASS |
| RAA Dream Team Standard | $1,497/mo | …IciRVQSD | $1,497/mo | recurring | PASS |
| 30-Day Personal Reset | $297 | …ts5JuE5a | $297.00 | one-time | PASS |
| 30-Day Business Reset | $497 | …3Qh5pIiH | $497.00 | one-time | PASS |
| 30-Day AI Reset | $997 | …87MVrKFy | $997.00 | one-time | PASS |
| 90-Day Personal Transformation | $997 | …scEqWHEK | $997.00 | one-time | PASS |
| 90-Day Business Transformation | $1,497 | …rit7Ko5x | $1,497.00 | one-time | PASS |
| 90-Day Full AI Transformation | $2,497 | …4Uti8udD | $2,497.00 | one-time | PASS |
| Link-in-Bio Hub | $297 | …4qqcndi2 | $297.00 | one-time | PASS |
| Personal Brand Site | $397 | …V5aYSxdp | $397.00 | one-time | PASS |
| Conversion Landing Page | $497 | …PvFHVSAJ | $497.00 | one-time | PASS |
| Lead Magnet Funnel | $697 | …2lbGJDQl | $697.00 | one-time | PASS |
| AI Chatbot Widget | $797 | …07dnyiRf | $797.00 | one-time | PASS |
| Site Care | $97/mo | …02mjIa6U | $97/mo | recurring | PASS |
| Collective Membership | $97/mo | …KStT1NEj | $97/mo | recurring | PASS |
| Agent Care | $197/mo | …pQCYOLeJ | $197/mo | recurring | PASS |
| Monthly Build Credits | $497/mo | …eEXu6hlp | $497/mo | recurring | PASS |
| GPT Agent Single — Own | $297 | …XyZlrDc7 | $297.00 | one-time | PASS |
| GPT Agent Agency — Own | $97 | …1ykOmyZG | $97.00 | one-time | PASS |
| GPT Agent Single — Hosted | $97/mo | …jITVAlvn | $97/mo | recurring | PASS |
| GPT Agent Agency — Hosted | $47/mo | …7K1325Tt | $47/mo | recurring | PASS |
| Claude Agent Single — Own | $397 | …rj3TE9U9 | $397.00 | one-time | PASS |
| Claude Agent Additional — Own | $247 | …ctO6udK4 | $247.00 | one-time | PASS |
| Claude Agent — Hosted | $147/mo | …PQlyjg1w | $147/mo | recurring | PASS |
| Knowledge Base Basic | $197 | …nf0wzqB9 | $197.00 | one-time | PASS |
| Knowledge Base Full | $397 | …ftFZG8TE | $397.00 | one-time | PASS |
| Branded Agent Dashboard | $297 | …XyUtcRfR | $297.00 | one-time | PASS |
| Autism Single Story | $47 | …5Fg4hh6H | $47.00 | one-time | PASS |
| Autism Therapy Toolkit | $127 | …W7LtYO75 | $127.00 | one-time | PASS |
| Autism Premium Illustrated | $297 | …cedSOHi6 | $297.00 | one-time | PASS |
| Autism Practice Bundle | $997 | …t06k0wdp | $997.00 | one-time | PASS |
| Autism Gift Wrap add-on | $25 | …RN9Mx1ND | $25.00 | one-time | PASS |
| Legacy: 8-Week Cohort | $997 | …8i3WGwS0 | $997.00 | one-time | PASS (legacy) |
| Legacy: 30-Day FOCUS | $297 | …RrF38PA8 | $297.00 | one-time | PASS (legacy) |
| Legacy: 30-Day Intensive | $497 | …uNY16veh | $497.00 | one-time | PASS (legacy) |
| Legacy: 12-Week Mastery | $1,997 | …u5PGmZih | $1,997.00 | one-time | PASS (legacy) |

## Intentionally not Stripe (inquiry/application/booking only)

6-Month Private Partnership ($3,997, apply-only) · RAA Enterprise · AI Lead
Engine tiers · Advisory lanes (Executive/Speaking/Corporate/Cohorts/University) ·
Build Studio Tier 2–4 builds · Autism School+IEP / Practice License · Store
inquiry packages.

## Notes & residual observations

1. **Payment link** `buy.stripe.com/fZu9ASbsQ71ugoy2eogIo04` (audit $47) remains
   defined in `offer-catalog.ts` but is no longer wired to any button (all audit
   CTAs route through `/audit/intake` → create-checkout). Buyers who use an old
   shared link still get the webhook fulfillment email with the magic link, and
   the report page now lets them complete intake via attach mode.
2. The live account contains additional products not referenced by this app
   (BidCommand, state playbooks, older subscriber SKUs, etc.) — unrelated
   projects on the same account; no action.
3. Webhook events consumed: `checkout.session.completed`,
   `customer.subscription.deleted` (tier revocation), plus 5-minute
   `check-subscription` polling for rent_agent.
