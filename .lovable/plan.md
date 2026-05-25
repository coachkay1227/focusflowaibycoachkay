## Goal

Stand up four standalone paid-offer landing pages matching the FocusFlow AI Paid Offers Sales Sheet. Each page is fully SEO'd, on-brand (cinematic navy + gold), and converts via direct Stripe Checkout where pricing is fixed, or an inquiry form where pricing is custom.

## The 4 pages

| Route | Lane | Conversion model |
|---|---|---|
| `/programs` (new) | Transformation Paths | Already-built `/programs/:slug` enrollment flow — page is a curated index of the 10 existing programs |
| `/studio` (new) | Story, Legacy & Publishing Studio | Inquiry CTA per package (custom-scoped) |
| `/rent-an-agent` (new) | Automation & Agent Systems | Direct Stripe Checkout per tier |
| `/advisory` (new) | Advisory, Events, Cohorts, AI University | Mixed: low-ticket checkout, enterprise inquiry |

Existing `/store` (digital downloads — books, playbooks) stays as is and is cross-linked from the new pages.

## Page-by-page scope

### 1. `/programs` — Transformation Paths index
Lightweight index above the existing `/programs/:slug` detail pages. Three tracks (Personal / Business / AI), 30-day + 90-day + 6-month tiers, F.O.C.U.S. pillar callouts, "Start your path" CTAs that route into the existing enrollment flow. No new Stripe wiring — uses the existing `program-catalog` and enrollment edge function.

### 2. `/studio` — Publishing Studio
Marketing page for 8 package families from the sales sheet:
- Mini-Story Starter ($497), Storybook Pro ($1,250), Premium Legacy Book ($2,500)
- Outline + Draft Only ($750), Done-for-You Expert Book ($2,500), Booked & Branded ($4,500)
- Autism & Social Story Offers (custom), Studio Add-Ons ($197–$397)

Every CTA opens a shared inquiry modal (`StudioInquiryDialog`) that posts to a new `studio-inquiry` edge function → forwards to GHL via existing `GHL_WEBHOOK_URL`. No Stripe wiring this round.

### 3. `/rent-an-agent` — Automation & Agent Systems
Hero, "How Rent-an-Agent works" 3-step explainer, then two pricing grids:

**Rent-an-Agent (subscription)** — 4 tiers × Founding/Standard toggle:
| Tier | Founding | Standard | Reuses Stripe product |
|---|---|---|---|
| Starter (single agent) | $297/mo | $497/mo | `prod_UI3bHaM3iNOTJd` (Founding) / `prod_UI3bn3UaV9XD4q` (Standard) |
| Pro / Growth | $697/mo | $997/mo | `prod_UI3bhmlY2kgDcK` / `prod_UI3bH83UkOhFdF` |
| Dream Team / Full Squad | $997/mo | $1,497/mo | `prod_UI3bP0P7W0fAiZ` / `prod_UI3beYm5zLDjDR` |
| Enterprise | from $1,997/mo | $2,997/mo | Inquiry-only (custom scope) |

**One-time setup fees** bundled into checkout (line item 2):
- Starter setup → `prod_UI3bLKAWvq65ts`, Growth setup → `prod_UI3buYjdmATvUf`, Full Squad setup → `prod_UI3byZ9ltsS19a`.

**AI Lead Engine** — 5 tiers ($697 → $4,997/mo + setup). All inquiry-only this round (custom GHL sub-account provisioning required).

**AI Business Audit** — $47 one-time, direct Stripe Checkout. Reuses `prod_U91GXGNgo01tYp` (single canonical product). Removes the duplicate `prod_U9aYYX5NtbWNwM` + `prod_U7VwwWHK0IssLs` from active wiring (left in Stripe untouched).

Founding/Standard toggle is a local UI state — changes which `price_id` the checkout button sends. A "Founding Pricing" badge expires when toggled off.

### 4. `/advisory` — Advisory, Events & Premium Education
Single page, five sub-sections:

1. **1-on-1 Consulting & AI Strategy Intensives** — $497 intensive (Stripe Checkout) + $500/hr executive advisory (inquiry).
2. **Speaking, Workshops & Team Trainings** — From $750 (inquiry). Surface the existing Claude Code Workshop + Claude Beginner Workshop products as direct checkout where seats are open.
3. **Corporate, EAP & Workforce Learning** — Inquiry only.
4. **Transformation Cohorts & The Collective AI Summit** — Surfaces existing `prod_UGHVIcGfn5LEoU` (8-Week Cohort) + `prod_U7NjKIOcqLAYOP` (Summit) where pricing is fixed; otherwise inquiry.
5. **AI University Roadmap Tracks** — Inquiry / waitlist.

All inquiry CTAs use the same `advisory-inquiry` edge function → GHL webhook (lane + tier passed as metadata).

## Stripe work

1. **Create prices** for the 11 Rent-an-Agent products that currently have none (4 subscription tiers × Founding+Standard = 8 recurring prices; 3 setup products = 3 one-time prices). Done via `stripe--create_stripe_product_and_price` is for new products — for existing products without prices, use `stripe_api_execute PostPrices` with `product: prod_xxx`.
2. **Add one new product**: Strategy Intensive ($497 one-time) for `/advisory`.
3. Extend `src/lib/stripe-tiers.ts` with new tier keys: `rent_agent_starter`, `rent_agent_pro`, `rent_agent_dream_team`, `audit_47`, `intensive_497`. Each entry stores `{ price_id, setup_price_id?, tier_label, founding: boolean }`.
4. Extend the existing `create-checkout` edge function to accept `tier_key` + optional `setup_price_id` → builds a 2-line-item Checkout Session (`mode: 'subscription'` for recurring, `mode: 'payment'` for one-time). Success URL `/order-success?tier=…`, cancel URL back to the originating page.
5. **Webhook**: `stripe-webhook` already maps `price.product` → access tier (per `mem://billing/stripe-configuration`). Add the 3 new Rent-an-Agent product IDs → `rent_agent` tier in `user_access_levels`. Audit + Intensive don't grant ongoing access — webhook just records the order in `orders`.

## Inquiry edge functions

Two new functions (`studio-inquiry`, `advisory-inquiry`) — same shape as any existing GHL forwarder. JWT-protected. Payload: `{ name, email, org?, lane, tier_or_package, budget?, message }`. Forwards to `GHL_WEBHOOK_URL` with tag = lane.

## Shared components

- `OfferLanePage` layout — hero (eyebrow + Cormorant H1 + DM Sans sub + dual CTA), 3-step process strip, pricing grid, FAQ accordion, footer CTA.
- `PricingTierCard` — supports `mode: 'checkout' | 'inquiry'`, optional setup-fee badge, founding/standard toggle awareness.
- `FoundingToggle` — segmented control (gold pill active, navy outline inactive) with "Limited founding seats" microcopy.
- `InquiryDialog` — reusable shadcn Dialog + react-hook-form + zod, posts to either inquiry function based on `lane` prop.

## SEO

Each new route added to `public/sitemap.xml`, gets per-page `<SEOHead/>` with unique title/description/canonical, `Service` + `Offer` JSON-LD schemas per pricing tier, and breadcrumb schema. Existing `seo:check` script enforces this on build. All four pages classified as `INDEXABLE`.

## Navigation

Header nav adds "Offers" dropdown → Programs / Rent-an-Agent / Studio / Advisory / Store. Footer gets a "Paid Offers" column with the same 5 links. Existing `/store` link stays.

## Out of scope (deferred)

- AI Lead Engine direct checkout (custom GHL provisioning required first).
- Building a top-level `/offers` hub page.
- Renaming or merging older duplicate Stripe products — left untouched in Stripe.
- Corporate enterprise quoting tool / proposal generator.

## Technical notes

- Reuse `src/lib/program-catalog.ts` pattern → new `src/lib/offer-catalog.ts` holds the 4-lane structured data so pages, sitemap, JSON-LD, and the Stripe tier map all read from one source.
- New routes added to `src/App.tsx` with `Suspense + PageSkeleton`, classified in `scripts/check-seo-regressions.ts` as `INDEXABLE`.
- All pricing displayed via `formatCurrency()` helper (already used in `/store`).
- Founding pricing memory: persist toggle state in `localStorage` so a returning visitor sees their last view.
- No new DB tables — leverages existing `orders`, `user_access_levels`, `enrollments`.

## Files touched (estimated)

**New (~12):** `src/pages/Programs.tsx`, `src/pages/Studio.tsx`, `src/pages/RentAnAgent.tsx`, `src/pages/Advisory.tsx`, `src/lib/offer-catalog.ts`, `src/components/offers/OfferHero.tsx`, `src/components/offers/PricingTierCard.tsx`, `src/components/offers/FoundingToggle.tsx`, `src/components/offers/InquiryDialog.tsx`, `supabase/functions/studio-inquiry/index.ts`, `supabase/functions/advisory-inquiry/index.ts`, `src/components/offers/OfferFAQ.tsx`.

**Edited (~7):** `src/App.tsx`, `src/lib/stripe-tiers.ts`, `supabase/functions/create-checkout/index.ts`, `supabase/functions/stripe-webhook/index.ts`, `public/sitemap.xml`, `scripts/generate-sitemap.ts`, `scripts/check-seo-regressions.ts`, header + footer nav components.
