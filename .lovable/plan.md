# Build Studio + PricingSection ↔ Truth page: geometry alignment

## What I found when I opened the files

Both files **already use `OfferCard`** end to end:
- `src/components/PricingSection.tsx` lines 240-254 — every offer renders through `OfferCard`.
- `src/pages/CollectiveAIBuildStudio.tsx` lines 252-275 — every tier offer renders through `OfferCard`.

So the migration isn't actually missing — it's already done. What **doesn't** match the Truth page is the *grid geometry around the cards*. Three concrete differences are making the cards look uneven compared to `/truth-about-ai`:

| Surface | Truth page (the reference) | What the other two do |
|---|---|---|
| Grid wrapper | `grid grid-cols-1 md:grid-cols-3 gap-5 **items-stretch**` | Build Studio: no `items-stretch`. PricingSection: no `items-stretch`. |
| Grid helper | n/a (hand-rolled 3-up) | Build Studio uses `getSymmetricGridClass`. PricingSection uses a hand-rolled `lg:grid-cols-3`. |
| Card wrapper | `<OfferCard>` is a direct grid child | PricingSection wraps each card in `<AnimatedSection className="h-full">`, which becomes the grid item — and because `AnimatedSection` applies an `opacity`/`transform` transition on its own `<div>`, it adds a stacking layer between the grid row and the card. With `items-stretch` missing this is what breaks height parity. |

That's why the Truth cards look symmetric and the other two don't — same component, different containers.

## The plan

### 1. `src/components/PricingSection.tsx`
- Add `items-stretch` to the grid wrapper.
- Replace the hand-rolled `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with `getSymmetricGridClass(group.offers.length)` so a 3-card group locks 3-up and a single-card group (Partnership) centers naturally, removing the `centerSingle` hack (`[&>*]:lg:col-start-2`).
- Keep the `AnimatedSection` wrapper for the entrance fade, but ensure it stays `h-full` so the inner OfferCard can stretch to the grid row.

### 2. `src/pages/CollectiveAIBuildStudio.tsx`
- Add `items-stretch` to the offer grid (line 252) so all OfferCards in a tier render at the tallest sibling's height — matches Truth.
- No other changes — it's already using `OfferCard` + `getSymmetricGridClass`.

### 3. Leave alone
- `OfferCard` itself — it's the locked-symmetry source of truth. No changes.
- The PILLARS row (Speed / Systems / Sovereignty) and the PROCESS row on Build Studio — those are intentionally a different visual treatment (icon + paragraph cards, not pricing offers). Migrating them to `OfferCard` would add a price/CTA zone they don't need. **Confirm** before I touch them.

## Open question

Are the **PILLARS** cards or the **PROCESS** cards on Build Studio what you actually meant by "tier cards"? They're the only custom cards left on that page. If yes, I'll migrate them too — but they're informational, not priced offers, so I'd render them in `OfferCard` with `density="compact"`, no `price`, no CTAs, just title + tagline + bullet (or skip bullets entirely). Tell me which interpretation matches what you saw and I'll execute.
