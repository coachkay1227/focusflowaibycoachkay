## Two deliverables: The Truth Page + sitewide offer-card symmetry

---

### Part 1 — `/truth` — "The AI Reality Guide" (100x'd)

A new long-form page that becomes the gravitational center of the site: the page people land on, finally exhale, and *then* convert. It replaces the attached HTML's flat layout with the cinematic FocusFlow shell (deep navy, gold, Cormorant + DM Sans, IntersectionObserver reveals — no Framer/GSAP per project rule).

**Proposed positioning (the "100x" rewrite)**

- **Promise**: *"The truth about AI — for your life, your business, and what comes next."*
- **Sub-promise**: *"No hype. No fear. No gurus. Just the clearest thinker in the room walking you through what AI actually is, what it isn't, and the exact next step for you — personal, business, or full transformation."*
- **Voice**: First-person Kay. Direct. Calm authority. The page reads like a single conversation, not a brochure.
- **Funnel logic**: every section earns trust; the page ends by routing the reader into one of three paths based on *where their fear is*:
  - **Personal** → 30/90-day personal reset
  - **Business** → 30/90-day business reset + Build Studio
  - **Full AI Transformation** → 90-day Full AI + 6-month Private Partnership

**Page structure (top → bottom)**

1. **Hero** — eyebrow "The AI Reality Guide", title "The truth about AI. *No hype. No fear. Just clarity.*", trust tags, one primary CTA "Find your path" (scrolls to path picker).
2. **The honest opener** — "Yes, AI is changing everything. That's not a reason to panic." + pull-quote.
3. **Myth-busting grid** — 6 cards (False / Nuanced / True badges) from the attached HTML, restyled in FocusFlow tokens.
4. **What AI is actually good at / where it fails** — two-column truth list.
5. **The fear conversation** — six "Fear → Truth" cards.
6. **The AI scam economy** — red-flag cards (Kay's unique angle, none of the competition says this).
7. **Skills that matter more now** — six skill cards.
8. **The Three Paths** *(new — the conversion engine)* — three symmetric path cards: Personal Reset / Business Reset / Full AI Transformation. Each card: outcome, who it's for, starting price, primary CTA → program detail, secondary "Talk to Kay first" → `/coach-kay`.
9. **Trust strip** — "Why people trust this room": 4 micro-proof badges (years of practice, # transformations, honest-pricing pledge, no-affiliate pledge).
10. **Final CTA** — "Still unsure? Take the 60-second Clarity Check." → `/clarity`.
11. **SEO**: SEOHead with title "The Truth About AI — Personal, Business & Full Transformation | Coach Kay", strong meta description, FAQPage + Article JSON-LD, added to sitemap + check-seo-regressions INDEXABLE.
12. **Nav**: add "Truth" link in Desktop/Mobile nav (before Build Studio) so it's the most prominent doorway.

**Files**
- `src/pages/TruthAboutAI.tsx` (new)
- `src/App.tsx` — add `/truth` route + lazy import
- `src/components/DesktopNav.tsx` and `src/components/MobileNav.tsx` — add "Truth" entry
- `public/sitemap.xml` + `scripts/generate-sitemap.ts` + `scripts/check-seo-regressions.ts` — register `/truth`
- Reuse the new `OfferCard` (see Part 2) for the Three Paths block

---

### Part 2 — Sitewide offer-card symmetry

Today the site has at least 5 different offer-card shapes: `ProgramCard`, `PackageCard`, `AddonCard`, the inline tier cards on `CollectiveAIBuildStudio.tsx`, the pricing rows in `PricingSection.tsx`, and ad-hoc cards on `Advisory.tsx` / `RentAnAgent.tsx` / `Store.tsx`. They have different heights, paddings, button placements, badge styles, and price formatting — visually inconsistent.

**Fix**: introduce one shared primitive and migrate every offer surface to it.

**New component**: `src/components/offers/OfferCard.tsx`

A single locked layout with five vertical zones (every card, every page):

```text
┌───────────────────────────────┐
│ [eyebrow tag]   [optional badge]│  ← zone 1 (fixed height)
│ Title (Cormorant, 2 lines max)│  ← zone 2 (min-h locked)
│ Short positioning line        │  ← zone 3 (min-h locked, 2 lines)
│ ─────────────                  │
│ • feature                     │  ← zone 4 (flex-1, equal stretch)
│ • feature                     │
│ • feature                     │
│ ─────────────                  │
│ Price block (locked baseline) │  ← zone 5a
│ Primary CTA  /  ghost CTA     │  ← zone 5b (always bottom)
└───────────────────────────────┘
```

Props: `eyebrow`, `badge?`, `title`, `tagline`, `features[]`, `price`, `priceSuffix?`, `primaryCta`, `secondaryCta?`, `variant: "standard" | "featured" | "premium"`, `pillar?`.

Rules baked in:
- `display: flex; flex-direction: column; h-full` so every card in a grid is the same height.
- `min-h` on title (2-line clamp) and tagline (2-line clamp) so short copy doesn't shrink the card.
- Features list uses `flex-1` so the price/CTA block always sticks to the bottom.
- One radius (`rounded-2xl`), one border (`border border-border/40`), one hover (`hover:border-primary/40 hover:shadow-elegant`), one focus ring.
- Price uses a single formatter (`formatPrice` helper) — no more mixed `$X / mo` vs `$X USD/month`.

**Migrations** (each replaces ad-hoc markup with `<OfferCard …>`):
1. `src/components/ProgramCard.tsx` → thin wrapper around OfferCard
2. `src/components/store/PackageCard.tsx` → wrapper
3. `src/components/store/AddonCard.tsx` → wrapper (compact variant)
4. `src/pages/CollectiveAIBuildStudio.tsx` — replace inline tier cards
5. `src/components/PricingSection.tsx` — replace
6. `src/pages/Advisory.tsx`, `src/pages/RentAnAgent.tsx`, `src/pages/Store.tsx`, `src/pages/Index.tsx`, `src/pages/AutismSocialStories.tsx` — replace any remaining offer markup
7. New Truth page Three Paths block uses it natively

**Visual QA**
- Walk every offer page in the preview at 1280px and 375px, confirm equal card heights per row and aligned CTAs.
- Run the SEO regression script after the new `/truth` route lands.

---

### Out of scope (this turn)
- No Stripe / pricing changes — symmetry is purely presentational.
- No copy changes to existing programs beyond what `OfferCard` requires (eyebrow + tagline). Where copy is missing I'll derive it from the program catalog.
- No new images generated unless you ask — I'll lean on type and tokens.

### One thing to confirm before I start
The "Three Paths" CTAs on the Truth page — should the Business path point at `/programs/30-day-business-reset` (program) or `/build-studio` (done-for-you)? My default is **program → reset for under $5k buyers, Build Studio as the secondary CTA** on that card. Say the word if you want them swapped.
