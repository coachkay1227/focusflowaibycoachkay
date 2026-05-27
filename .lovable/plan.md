# Promote Enterprise tier to a centered "banner box"

## What's wrong now

On `/rent-an-agent`, the Enterprise card is rendered as a 4th cell appended to the same grid that holds `RENT_AGENT_TIERS` (`RentAnAgent.tsx:248–314`). The grid uses `getSymmetricPricingGridClass(RENT_AGENT_TIERS.length)` — sized for the 3 paid tiers — and Enterprise is just dropped in after the `.map()`. Result: it inherits a column slot it wasn't designed for, lands flush-left at certain breakpoints, and visually reads like a forgotten 4th tier rather than the premium "talk to us" path.

## What to build

Split Enterprise out of the tier grid entirely and give it its own **centered banner row** directly below the 3-tier grid. Keep it inside the same section so the rhythm of the page is preserved.

### Layout

```text
[ Starter ]   [ Pro (highlighted) ]   [ Scale ]      ← existing 3-tier grid

         ┌─────────────────────────────────────┐
         │  ENTERPRISE BANNER (max-w-3xl, mx)  │     ← new
         └─────────────────────────────────────┘
```

- Desktop (`md+`): horizontal banner — left column (≈60%) holds crown badge, name, tagline, features list, best-for italics; right column (≈40%) holds price + "Request Enterprise Scope" CTA, vertically centered. `max-w-3xl mx-auto`.
- Mobile: stacks vertically, CTA full-width, same content order as today.
- Visual treatment: keep the existing `rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm` but **upgrade** to match the page's premium register —
  - `border-primary/40` (subtle gold edge, half-step under the highlighted Pro tier so it doesn't compete)
  - `ring-1 ring-primary/15`
  - faint gold gradient wash: `bg-gradient-to-br from-card/60 via-card/40 to-primary/5`
  - small "By application" eyebrow chip above the name, in the same style as "Most Popular" (mono-label, gold border, gold tint) so it reads as deliberately differentiated, not just bigger.

### Code changes (single file: `src/pages/RentAnAgent.tsx`)

1. Inside the section, keep the existing 3-tier grid exactly as-is — just remove the trailing Enterprise `<div>` (lines 291–313).
2. Right after the closing `</div>` of the grid, add a new wrapper:
   ```tsx
   <div className="mt-8 max-w-3xl mx-auto">
     <div className="relative overflow-hidden rounded-2xl border border-primary/40 ring-1 ring-primary/15 bg-gradient-to-br from-card/60 via-card/40 to-primary/5 backdrop-blur-sm p-8 md:p-10">
       {/* eyebrow chip + two-column md:grid layout */}
     </div>
   </div>
   ```
3. The inner content uses `grid md:grid-cols-[1.4fr_1fr] gap-8 md:gap-10 items-center`. Left column gets the crown, eyebrow chip, name, tagline, features, and best-for italics. Right column gets price (larger — `text-2xl font-semibold`), CTA (full-width within its column).
4. Bump the section's `max-w` if currently capped tighter than the banner needs (verify on render; current page is `max-w-6xl mx-auto`, which is fine — the `max-w-3xl` is on the banner itself).

## What I am NOT touching

- `RENT_AGENT_TIERS` data or the 3-tier grid logic.
- `getSymmetricPricingGridClass` helper.
- `OfferCard`, `OfferInquiryDialog`, or any other surface.
- Enterprise content (name, tagline, features, price, best-for) — same data, just re-presented.

## Verification

After the edit:
- Browser screenshot at desktop (1366) and mobile (390) to confirm the banner is centered, content reads cleanly, CTA is reachable, and the gold treatment lands at "premium not gaudy."
