# Visual regression check for OfferCard symmetry

## Reality check on "visual regression"

True pixel-diff visual regression needs Playwright + baseline screenshots + a CI runner that stores artifacts — none of which is wired into this project, and it would mean adding Playwright as a new dependency just for this. That's heavy for what we actually care about.

What we actually care about is preventing two specific regressions:
1. A grid that renders `<OfferCard>` siblings forgets `items-stretch` → cards stop matching height.
2. `OfferCard` itself loses its `h-full` / `flex-col` / `mt-auto` invariants → CTAs stop bottom-anchoring.

Both are structural invariants — detectable without rendering pixels. The right tool is the **vitest + jsdom** setup already in the project (`vitest.config.ts`, `src/test/setup.ts`).

## Plan

Add **two test files** that together act as the regression check.

### 1. `src/components/offers/OfferCard.symmetry.test.tsx`
- Render an `OfferCard` and assert the article element has `data-offer-card`, `h-full`, `flex`, `flex-col` on its className.
- Render with and without `secondaryCta` and confirm the CTA wrapper carries `mt-auto`.
- Render with and without `price` and confirm the title and tagline keep their locked `min-h` classes (`min-h-[3.6rem]` / `min-h-[2.6rem]` for default density).
- Render with 0 features → assert the spacer `<div className="flex-1" />` exists so empty-feature cards still push CTAs to the bottom.
- Render two siblings inside a `<div className="grid grid-cols-2 items-stretch">` with wildly different feature counts (1 vs 6) and confirm both root articles render `h-full` (jsdom won't measure pixels, but the className contract is what guarantees parity when the browser does layout).

### 2. `src/components/offers/OfferCard.gridUsage.test.ts`
A static-analysis test that reads every project source file once and asserts: **every JSX grid that contains an `<OfferCard>` (directly or via the known wrapper components `ProgramCard`, `PackageCard`, `AddonCard`, `AutismOfferCard`) declares `items-stretch` on its grid wrapper.**

Implementation:
- Walk `src/pages/**/*.tsx` and `src/components/**/*.tsx` with `fs.readdirSync` recursively.
- For each file, find every `className=` that contains `grid` AND any line within the same JSX block that renders one of the known offer components.
- Maintain an allowlist of known-good files mapped to the expected grid classes (Pricing, Build Studio, Truth, Store, Autism, Modules). If a new file uses an offer card in a grid without `items-stretch`, the test fails with a clear message naming the file and line.

This is the actually-load-bearing check — the OfferCard internals rarely change, but new grids are added all the time. The test makes it impossible to add a new offer-card grid without remembering `items-stretch`.

### 3. Tiny prep edit (already done in earlier turn)
`OfferCard` already emits `data-offer-card` on its root, so the unit test can target it without coupling to className strings. No production code change needed.

## What I am NOT doing and why

- **Playwright / pixel diffs** — would require a new dependency, a baseline image store, and a CI runner. Disproportionate for the failure mode we've actually seen (forgotten `items-stretch`). Happy to scope this as a follow-up if you want true cross-browser screenshot regression — say the word and I'll spec it separately.
- **Browser-tool live screenshot** — useful for one-time verification (and I can run it on request), but it's not a "check" that re-runs.
- **Storybook visual regression** — no Storybook in this project; not adding one for two tests.

## Open question

Do you want me to also run the live browser tool right now to capture **before/after screenshots** at mobile (375×812) and desktop (1366×768) for the four offer surfaces (Truth, Pricing, Build Studio, Store) as a one-time human-verifiable QA pass alongside the test suite? It's a separate thing from the regression *check* itself, but it's the fastest way to confirm "yes, everything looks symmetric today." If yes, I'll do both in the build pass.
