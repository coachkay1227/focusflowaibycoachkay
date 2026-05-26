
# Transformation Paths — Approved Launch Plan

Booking link for Partnership: `https://call.coachkayelevates.org/widget/booking/T9DLwsDPEI4rfRHDdhjp`

## Decisions locked
- 6 offers → direct Stripe Checkout (one-time payment).
- Partnership ($3,997) → CTA opens the booking link in a new tab. No application form, no Stripe SKU.
- Tier grouping: 3 new tiers — `reset_30`, `transformation_90`, `partnership` (added later, manual).
- Auth required before checkout (cleaner fulfillment + tier provisioning).

## Phase 1 — Create Stripe products (catalog only)
Create 6 one-time products + prices via `stripe--create_stripe_product_and_price`:
| Product | Price |
|---|---|
| 30-Day Personal Reset | $297 |
| 30-Day Business Reset | $497 |
| 30-Day AI Reset | $997 |
| 90-Day Personal Transformation | $997 |
| 90-Day Business Transformation | $1,497 |
| 90-Day Full AI Transformation | $2,497 |

Capture returned `prod_…` and `price_…` IDs.

## Phase 2 — Wire the checkout
1. **`supabase/functions/_shared/stripe-config.ts`** — add the 6 new prices to `PRICE_MODE_MAP` (`payment`) and the 6 new products to `PRODUCT_TIER_MAP` mapped to `reset_30` (×3) and `transformation_90` (×3).
2. **DB migration** — extend the `access_tier` enum with `reset_30` and `transformation_90`. Update `TIER_RANK` / `TIER_LABELS` in `src/lib/tier-constants.ts` and the `AccessTier` union in `src/hooks/use-access-level.ts`.
3. **`src/components/PricingSection.tsx`** — replace single `openApply` with per-offer handler:
   - 6 offers: call `supabase.functions.invoke("create-checkout", { body: { priceId, successPath: "/dashboard?welcome=<slug>", cancelPath: "/#pricing" } })` → `window.open(url)`.
   - If not signed in: redirect to `/auth?intent=buy:<priceId>` and auto-resume after login.
   - Partnership: `window.open(BOOKING_URL, "_blank")` — no dialog, no form.
4. **Button labels** — replace "Apply for…" with "Start Personal Reset" / "Start Business Coaching" / etc. Partnership becomes "Book Discovery Call".

## Phase 3 — Minimal fulfillment scaffolding
- **`supabase/functions/stripe-webhook/index.ts`** — already maps product→tier from `PRODUCT_TIER_MAP`. Add: send a per-tier welcome transactional email (`reset-welcome`, `transformation-welcome`) and push a GHL tag (`reset_personal`, `transformation_ai`, etc.) so Coach Kay's CRM segments by offer.
- **New transactional templates** (2): `reset-welcome.tsx` + `transformation-welcome.tsx` under `supabase/functions/_shared/transactional-email-templates/`. Each lists what's included + next step + Skool link. Register in `registry.ts`.
- **`/dashboard`** — add a "Your Program" panel that switches by tier: shows the offer name, what's included (static list per tier), and a "Book your first call" CTA for `transformation_90` (same booking link).
- Defer building the actual module/call delivery for now — tier + welcome email + dashboard panel = enough to start collecting money and notify Coach Kay manually for fulfillment.

## Phase 4 — End-to-end QA (Stripe test mode)
- Sign-up → click each of 6 offers → Stripe Checkout opens → complete with test card `4242…` → land on `/dashboard?welcome=…` → confirm: webhook fired, tier updated in `user_access_levels`, welcome email sent, GHL tag pushed.
- Sign-out test: click "Start AI Reset" → redirected to `/auth?intent=buy:price_…` → after login, checkout auto-opens.
- Partnership: click "Book Discovery Call" → new tab opens to GHL booking widget. No Stripe call.
- One $1 live charge per product type after switch to live mode, then refund.

## Out of scope
- Module content, drips beyond welcome email, automated call scheduling for 90-day tiers.
- Changes to existing Rent-an-Agent / legacy / Audit flows.
- Design changes beyond button labels in `PricingSection`.

## Files touched
- Create: 2 email templates.
- Migrate: enum extension.
- Edit: `PricingSection.tsx`, `stripe-config.ts`, `stripe-webhook/index.ts`, `tier-constants.ts`, `use-access-level.ts`, `Dashboard.tsx`, `transactional-email-templates/registry.ts`.

Ready to execute on approval.
