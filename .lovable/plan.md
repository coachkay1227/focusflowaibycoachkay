## What I found

Stripe products + prices already exist (and have been mapped server-side in `_shared/stripe-config.ts` + `PRICE_MODE_MAP`) for all 6 transformation paths:

| Program | Price ID |
|---|---|
| 30-Day Personal Reset — $297 | `price_1TbAaPBReje0oFcLts5JuE5a` |
| 30-Day Business Reset — $497 | `price_1TbAguBReje0oFcL3Qh5pIiH` |
| 30-Day AI Reset — $997 | `price_1TbAhOBReje0oFcL87MVrKFy` |
| 90-Day Personal Transformation — $997 | `price_1TbAhtBReje0oFcLscEqWHEK` |
| 90-Day Business Transformation — $1,497 | `price_1TbAiNBReje0oFcLrit7Ko5x` |
| 90-Day Full AI Transformation — $2,497 | `price_1TbAimBReje0oFcL4Uti8udD` |
| 6-Month Private Partnership — $3,997 | *no Stripe price — discovery call only (as designed)* |

The homepage `PricingSection` already uses these for instant-buy. The leak is in:

- `src/components/ProgramCard.tsx` — every `isGated` program (without a cohort code) renders "Apply for access".
- `src/pages/ProgramDetail.tsx` — every `visibility: "public"` program renders "Apply for {title}" via `ApplyNowDialog`, regardless of whether a Stripe price exists.

Net effect on `/modules`: the 6 transformation paths show "Apply for access" instead of a buy button, and the detail pages do the same — so we're losing instant-buy conversions on every reset/transformation card.

## Fix (frontend only — no new Stripe products needed)

1. **`src/data/programs.ts`**
   - Add an optional `stripePriceId?: string` field to the `Program` interface.
   - Populate it on the 6 transformation-path entries (lines ~2025–2123) using the price IDs above.
   - Leave the 6-Month Partnership entry with no `stripePriceId` so it keeps its application/discovery-call flow.

2. **`src/components/ProgramCard.tsx`**
   - Before the `isGated` "Apply for access" branch, add an instant-buy branch: if `program.stripePriceId` is set, primary CTA becomes `Buy now — {priceDisplay}` (or `Sign in to continue` when logged out, mirroring `PricingSection`'s pending-checkout pattern with `sessionStorage`). Click invokes `create-checkout` with `successPath: "/dashboard?welcome=program"` and `cancelPath: "/modules"`, then redirects to `data.url`.
   - Keep the existing "View details" secondary CTA so layout/geometry is unchanged.
   - Reuse `trackCheckoutStart` from `@/lib/gtag` so analytics stays consistent with `PricingSection`.

3. **`src/pages/ProgramDetail.tsx`**
   - In the pricing/CTA block, when `isPublicOffer && program.stripePriceId`, render a `Buy now — {priceDisplay}` button that calls the same `create-checkout` flow (instead of opening `ApplyNowDialog`).
   - Fallback to the current Apply button only when `stripePriceId` is absent (i.e. the 6-Month Partnership).

4. **No backend changes.** `create-checkout` already validates these price IDs via `PRICE_MODE_MAP`, the webhook already maps the products to `reset_30` / `transformation_90` tiers in `PRODUCT_TIER_MAP`, and `TRANSFORMATION_PROGRAM_MAP` already fires the right welcome email.

## Verification

- Open `/modules` and confirm the 6 reset/transformation cards now show `Buy now — $X` (and the 6-Month Partnership card still says "Apply for access").
- Open `/programs/30-day-personal-reset` (and the other 5) and confirm the right rail shows the buy button, not the Apply dialog.
- Click one buy button as a signed-in user → lands on Stripe Checkout for the correct price.
- Click as a signed-out user → routed to `/auth`, and after sign-in resumes checkout via the `PENDING_CHECKOUT_KEY` pattern.