# Unify all card surfaces under the OfferCard 5-zone layout

## Audit — where we stand right now

| File | Uses OfferCard? | Notes |
|---|---|---|
| `src/components/ProgramCard.tsx` | yes | Full 5-zone usage with `primaryCta` + `secondaryCta`. Reference implementation. |
| `src/components/store/PackageCard.tsx` | yes | Has eyebrow/title/tagline/features/price/primaryCta. No secondary. |
| `src/components/store/AddonCard.tsx` | yes, but `density="compact"` and **no CTA** — zone 5 collapses, so it doesn't match the 5-zone geometry. Receives an `Icon` prop that's silently dropped. |
| `src/pages/AutismSocialStories.tsx` (inline `PackageCard`, lines 41-103) | **no** — hand-rolled `<div>` with its own bullets, gift-wrap checkbox, and Button. Out of system. |
| Grid wrappers around all of the above | inconsistent — some use `getSymmetricGridClass` + `items-stretch`, others don't. |

So three things need fixing to actually standardize: the inline Autism `PackageCard`, the `AddonCard` shape, and the grid wrappers around them.

## Plan

### 1. `src/pages/AutismSocialStories.tsx` — replace inline PackageCard with OfferCard
- Delete the local `PackageCard` component (lines 41-103) and the `useReveal` hook (per-card reveal is overkill and the rest of the site uses `AnimatedSection`).
- Render `OfferCard` directly inside the two grids. Map fields:
  - `eyebrow` → `"Autism & Social Stories"` (group label) or `pkg.bestFor` short form — propose using the section's group label so it matches Truth/Build Studio convention.
  - `title` → `pkg.name`
  - `tagline` → `pkg.bestFor`
  - `features` → `pkg.bullets`
  - `price` → `pkg.priceLabel` (preserve existing label string)
  - `primaryCta` → buy-now or inquiry, depending on `pkg.inquiryOnly`
  - `variant` → `standard` everywhere (no featured highlight is currently set)
- Gift-wrap checkbox: move into the OfferCard `footnote` slot. Keep local `giftWrap` state per card via a thin wrapper component (`AutismOfferCard`) that owns the checkbox state and forwards it into the buy handler. The footnote already renders at the bottom-center under the CTAs, so geometry stays locked — inquiry-only cards just render no footnote.
- Replace the two grids with `${getSymmetricGridClass(list.length)} gap-5 items-stretch` so checkout and inquiry rows align like Truth.

### 2. `src/components/store/AddonCard.tsx` — full 5-zone parity
- Drop `density="compact"`. The whole point is uniform geometry.
- Add a `primaryCta` so zone 5 isn't empty. The natural CTA is **"Add at checkout"** — purely informational (add-ons are bundled into the package order flow, not bought standalone). Clicking it scrolls to the packages section (`document.getElementById("packages")?.scrollIntoView(...)`) so users go pick a package to attach it to. If you'd rather the addon CTA do nothing visible (label-only badge), say so and I'll render it as a non-interactive "Included add-on" line in the `footnote` slot instead.
- The unused `Icon` prop: render it as a small icon row above the eyebrow OR remove it from the type and from `Store.tsx` callers. I'll remove it (the icon was never visible and dropping it keeps the OfferCard surface clean) unless you say otherwise.
- Provide a 1-line `tagline` derived from `addon.description`'s first sentence so the tagline zone isn't oversized, and pass the full description as a single feature bullet so the features zone is populated and matches sibling card heights.

### 3. Grid wrappers
- `src/pages/Store.tsx` packages grid (line 234): swap `grid md:grid-cols-2 lg:grid-cols-3 gap-6` → `${getSymmetricGridClass(visiblePackages.length)} gap-6 items-stretch`.
- `src/pages/Store.tsx` addons grid (line 250): swap `grid md:grid-cols-3 gap-5` → `${getSymmetricGridClass(ADDONS.length)} gap-5 items-stretch`.
- `src/pages/AutismSocialStories.tsx` both grids: as covered in step 1.
- `src/pages/Modules.tsx` (line 198): already uses `getSymmetricGridClass` — just add `items-stretch`.

### 4. Things I am NOT touching
- `OfferCard` itself — locked source of truth, no edits.
- `ProgramCard`, `store/PackageCard` — already conform.
- Any non-pricing cards (PILLARS, PROCESS, "Why this studio wins", "This is for you if you're a…", tool picks, etc.). Those are informational tiles, not offers, and shoving them into OfferCard would add ghost zones (price, CTA) that don't belong.

## Open questions before I execute

1. **AddonCard CTA**: scroll-to-packages "Add at checkout" button, or no CTA + render an "Included add-on" label in `footnote` (still keeps zone 5 occupied so geometry matches)?
2. **Autism gift-wrap UX**: OK to move the checkbox into the `footnote` slot under the CTA? It will look like: `[Buy Now — $X]` then below it a small `☑ Add gift wrap (+$XX)`. The alternative is keeping the checkbox above the CTA, which means a custom wrapper outside OfferCard and the cards will no longer be height-symmetric with the inquiry cards.

Tell me your call on those two and I'll ship it.
