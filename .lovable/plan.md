## What you noticed (and why it's happening)

**Footer only on 6 pages.** Right now `SiteFooter` is only imported in: Index, Truth, FAQ, Collective, Autism, and the Legal layout. Every other public route (Modules, Store, Coach Kay, Community, Rent-an-Agent, Advisory, Build Studio, Starter Kit, Program Detail, Audit pages, Sitemap) has no footer — so users hit a dead end.

**3/1 grid problem.** Modules uses `lg:grid-cols-3`, so a pillar with 4 programs renders as 3 on top + 1 orphan on the bottom-left (your Foundation screenshot). Same risk on Store and Pricing.

**Nav names too vague.** "Studio" and "Truth" don't tell anyone what's inside.

---

## The fix — 4 parts

### 1. Global footer (wrap, don't duplicate)

Instead of importing `<SiteFooter />` into 20+ pages, add a single `<PublicLayout>` wrapper that renders nav + page + footer. Apply it in `App.tsx` to every public route. Auth-gated app routes (Dashboard, Profile, Admin, Clarity session, Onboarding, Auth) stay footerless — those are app shells, not marketing pages.

Routes that get the footer: `/`, `/modules`, `/programs/:slug`, `/store`, `/starter-kit`, `/coach-kay`, `/community`, `/rent-an-agent`, `/advisory`, `/build-studio`, `/collective`, `/truth`, `/faq`, `/autism-social-stories`, `/audit/landing`, `/sitemap`, `/privacy`, `/terms`, `/disclaimer`, `/refund-policy`, plus the 404 page.

Pages that currently import `SiteFooter` directly get the import removed so we don't render it twice.

### 2. Grid symmetry — no more orphan cards

New rule applied everywhere cards are rendered:

```text
1 card    -> centered, max-width single card (not stretched)
2 cards   -> 2-up on desktop, 1-up mobile
3 cards   -> 3-up on desktop, 1-up mobile
4 cards   -> 2x2 on desktop (NOT 3+1), 1-up mobile
5 cards   -> 3+2 centered, or switch to 2-up of 3 rows
6+ cards  -> 3-up grid, always fills rows
Mobile    -> 1 per row, always (1/1/1...)
```

Concretely:
- **Modules pillar grids**: switch from fixed `lg:grid-cols-3` to a small `getGridClass(count)` helper that picks the right column count per pillar so Foundation's 4 cards land as a 2x2, single cards center, etc.
- **Store packages / addons / templates**: same helper.
- **Pricing section**: already 4 columns at `lg` — keep it but center if fewer than 4 tiers are active.
- **Lead Engine grid** (your second screenshot, 3+2): apply the helper so 5 cards render as a centered 3+2 or switch to 2-up — never an orphan-left bottom row.

All grids stay `grid-cols-1` on mobile so everything flows 1/1/1 as you asked.

### 3. Nav rename — "Studio" and "Truth" become clickable

| Current | New label | Why |
|---|---|---|
| Studio | **AI Build Studio** | Tells people Kay's team builds AI for them |
| Truth | **The Truth About AI** | Matches the page title, creates curiosity |
| Coach Kay | **Meet Coach Kay** | Verbs out-pull nouns |
| FAQ | **FAQ** | Stays |
| Work With Me | **Work With Me** | Stays (dropdown) |

Inside the "Work With Me" dropdown, the items keep their existing labels (Paths, Store, Rent-an-Agent, Advisory, Build Studio, Collective AI, Community) but get one-line descriptors so the menu reads like a directory, not a list. Same labels mirror on mobile.

### 4. 404 audit + link sweep

Before you're back, do a sweep:
- Render every public route in dev and confirm no white screen / 404.
- Grep the codebase for every `to="..."` and `href="/..."` and confirm each target exists in `App.tsx`.
- Special-case the legacy redirects already in place (`/about` -> `/coach-kay`, `/ai-starter-kit` -> `/starter-kit`, `/email-unsubscribe` -> `/unsubscribe`) and add any missing ones found during the sweep.
- Confirm the footer's "Sitemap" link, the SiteFooter "Book a session" outbound, and the Community Skool link all resolve.

---

## What's left from the previous plan

The earlier `/truth` page plan (8 pledges, F.O.C.U.S. bridge, Tool Picks section) is **already shipped** — `ToolPickCard.tsx`, `tool-picks.ts`, and the new TruthAboutAI sections are all live. The navigation/brand alignment plan you approved is also shipped. So nothing is outstanding from prior plans — this new plan covers everything you just flagged.

After this ships you'll be clean to start the email sequence work.

---

## Files touched (technical)

- **New:** `src/components/layout/PublicLayout.tsx` — renders `DesktopNav` + `MobileNav` + `<Outlet />` + `SiteFooter`.
- **New:** `src/lib/grid.ts` — `getSymmetricGridClass(count: number)` helper.
- **Edit:** `src/App.tsx` — wrap public routes in `<PublicLayout>` using a parent `<Route element={<PublicLayout />}>` block.
- **Edit:** `src/pages/Index.tsx`, `Faq.tsx`, `TruthAboutAI.tsx`, `Collective.tsx`, `AutismSocialStories.tsx`, `legal/LegalLayout.tsx` — remove now-duplicate `SiteFooter` imports/renders.
- **Edit:** `src/pages/Modules.tsx`, `Store.tsx`, `PricingSection.tsx`, `RentAnAgent.tsx`, `BuildStudio.tsx` (anywhere with card grids) — use `getSymmetricGridClass`.
- **Edit:** `src/components/DesktopNav.tsx`, `MobileNav.tsx` — rename labels + add dropdown descriptors.
- **Audit script (not committed):** quick `rg` pass over `to="/` and `href="/` to surface dead links.

No backend, no schema, no data changes.
