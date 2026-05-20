## Goal

Make `/modules` a clean program-discovery page. All pricing/selling lives on the homepage `PricingSection`.

## Changes to `src/pages/Modules.tsx`

1. **Delete the entire Pricing block** (lines ~173–232): the "YOUR JOURNEY / Choose your path" section with START HERE, GO DEEPER, FULL TRANSFORMATION, and CUSTOM SOLUTIONS cards — including all `renderPricingCard` calls and the Corporate & Private Coaching panel.

2. **Delete the social proof testimonial grid** (lines ~234–251) so the page focuses on programs rather than conversion. (Optional — confirm below.)

3. **Remove now-unused code:**
   - `renderPricingCard` function and the `PricingPlan` interface (lines ~67–~120 area)
   - Imports: `STRIPE_TIERS`, `Mail` icon, `Button` (only if no other usage), and any pricing-related helpers
   - `applyDialog` state + the `ApplyNowDialog` mount, **only if** no other CTA on the page uses it

4. **Tighten the hero**: keep the "F.O.C.U.S. PROGRAMS / Choose your path" intro (lines 160–171). Add a single small line under it pointing curious-about-pricing visitors home, e.g. *"Looking for pricing? See all transformation paths on the home page."* with a subtle link to `/#pricing` (or `/`).

5. **Keep intact:**
   - Pillar tabs (line ~253+)
   - Program grid rendering with `AccessGate`
   - All `programs` data wiring

## Out of scope

- Homepage `PricingSection` (already correct)
- Auth, routing, Supabase, tier logic
- Stripe checkout flow (unchanged — checkout now triggered only from PricingSection → ApplyNowDialog or program detail pages)

## Question to confirm before implementing

- Keep the 3 testimonials on `/modules`, or remove them too for a pure discovery page?
