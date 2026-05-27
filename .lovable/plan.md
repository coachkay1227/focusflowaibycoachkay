## What's actually wrong

The home page (`src/pages/Index.tsx`) has its **own hand-rolled header** that was never updated when we restructured the global nav. That's why "everything doesn't feel aligned end-to-end" — because it literally isn't.

### Mismatches found

1. **Nav items are stale.** Home shows `Paths · Studio · Truth · Coach Kay · FAQ` (old flat list). Every other page now shows the 4-group system: `Start Here · Work With Me · Tools & Resources · Truth & About`. So clicking the logo to go home makes the nav visibly change — confusing and unprofessional.
2. **Wordmark drift.** Home renders the wordmark with inline `<span>`s (`Focus` + `Flow` + `AI`). Every other page uses `<BrandLogo />`. Any future tweak to the brand mark won't propagate to home.
3. **CTA label drift.** Home CTA = "Get My Clarity Code". Global nav CTA = "Start Clarity". Pick one.
4. **Account UI drift.** Home shows raw avatar + dashboard link + signout icon inline. Global nav uses a single account dropdown (Dashboard / Profile / Admin / Sign out). Two different account UIs depending on the page.
5. **White sliver above the portrait** (the thing you flagged). The `coachKayPortrait` asset has white pixels at the top edge of the source image and `object-cover` reveals them inside the navy column. There's no top gradient masking it — the bottom has a fade-to-navy gradient but the top is unmasked.

## The plan (frontend-only, zero functional changes)

### 1. Replace the inline home header with the global pattern
In `src/pages/Index.tsx`:
- Delete the entire custom `<nav>` block (lines ~74–130).
- Render `<DesktopNav />` and `<MobileNav />` at the top of the page instead.
- Update `DesktopNav.tsx`: remove the `isHome` early-return so it renders on `/` too. (It already hides on `/auth`, `/kiosk`, `/reset-password`, `/onboarding` via `NAV_HIDDEN_ROUTES` — that stays.)
- Update Index's top padding so the hero clears the now-fixed 64px nav (`pt-16`).

Result: identical header on every page, identical wordmark, identical account dropdown, identical CTA ("Start Clarity"). Single source of truth.

### 2. Fix the portrait white sliver
In the `40% — Portrait` column:
- Add a top-edge gradient overlay mirroring the existing bottom one:
  ```text
  linear-gradient(to bottom, hsl(220 40% 8%) 0%, transparent 12%)
  ```
- Also set `objectPosition: "center 20%"` on the `<img>` so the framing nudges down past the white edge.

Both together guarantee the navy column reads as solid navy at the top regardless of source asset.

### 3. Sanity sweep
After the change, walk: `/` → `/modules` → `/ai-tools` → `/dashboard` → `/profile` and confirm the header is byte-identical (same groups, same logo, same CTA, same account dropdown). Mobile too.

## Out of scope
- No route changes, no auth changes, no Stripe, no edge functions, no data shape changes.
- Not re-cropping the source portrait asset (CSS masking is enough and reversible).
- Not touching admin nav, footer, or legal pages.

## Files touched
- `src/pages/Index.tsx` — remove custom nav, mount global nav, fix portrait overlay + object-position.
- `src/components/DesktopNav.tsx` — remove the `isHome` hide so the global nav renders on `/`.
