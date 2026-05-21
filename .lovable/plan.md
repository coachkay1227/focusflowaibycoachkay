
# Plan — Full JSON-LD Schema Rollout + SEO Hygiene

Implements the expert schema package you pasted. One pass, no placeholders left in production output.

## What gets built

### 1. `SEOHead` becomes the single source of truth
- Add a new `injectGlobalGraph` prop (default `true`) to `src/components/SEOHead.tsx`.
- When true, automatically inject the sitewide `@graph` (Person + Organization + WebSite) on every page that uses SEOHead — so we don't have to add it manually to each route.
- Page-specific `jsonLd` (WebPage / AboutPage / CollectionPage / Course / BreadcrumbList) continues to be passed in by each page, and renders as additional `<script>` blocks.
- Helper `src/lib/seo-schema.ts` exports reusable builders:
  - `globalGraph()` → Person/Organization/WebSite graph with your real NAP, sameAs, contact.
  - `breadcrumb(items)` → BreadcrumbList builder.
  - `programSchema(program)` → Course + WebPage + BreadcrumbList for a `Program`, branching on `visibility`:
    - `public` → full `Course` schema
    - `lead_magnet` → `Course` only if publicly accessible; otherwise `WebPage` only
    - `backend` → bare `WebPage` (no Course, no pricing — avoids exposing protected content)
    - `retired` → no schema (page redirects)

### 2. Canonical fix for `/about` vs `/coach-kay`
- In `src/pages/CoachKay.tsx`, switch `SEOHead` canonical from `/about` to `/coach-kay`.
- Update the route component so `/about` renders a 301-style client redirect to `/coach-kay` using `<Navigate to="/coach-kay" replace />` in `src/App.tsx`. This eliminates the duplicate AboutPage entity and concentrates link equity.

### 3. Per-route JSON-LD wiring
Each page passes a route-specific schema array into `SEOHead`:

- `src/pages/Index.tsx` — keep existing FAQPage; add `WebPage(#home)` + `BreadcrumbList` + `OfferCatalog` listing the 7 public offers (Service entries with stable `@id`s, `provider` referencing `#organization`, `url` pointing at `/programs/<slug>` for each).
- `src/pages/Modules.tsx` — `CollectionPage` + `BreadcrumbList`.
- `src/pages/CoachKay.tsx` — `AboutPage` (`about` → `#person`) + `BreadcrumbList`. Person entity comes from the global graph, no duplication.
- `src/pages/Store.tsx` — `CollectionPage` + `BreadcrumbList`. (Product schema for individual books deferred — flagged as Wave 2.)
- `src/pages/Community.tsx` — `WebPage` + `BreadcrumbList`.
- `src/pages/ProgramDetail.tsx` — call `programSchema(program)` from the helper, which emits the correct shape based on `visibility`.

### 4. Filled-in offers + program slugs (no placeholders)

The `OfferCatalog` on the home page will list the 7 public Services with real names and URLs:

```
30-Day Personal Reset       → /programs/30-day-personal-reset
30-Day Business Reset       → /programs/30-day-business-reset
30-Day AI Reset             → /programs/30-day-ai-reset
90-Day Personal Transformation       → /programs/90-day-personal-transformation
90-Day Business Transformation       → /programs/90-day-business-transformation
90-Day Full AI Transformation        → /programs/90-day-full-ai-transformation
6-Month Private Transformation Partnership → /programs/6-month-private-partnership
```

The 3 lead magnets (`focus-clarity-check`, `mac-type-assessment`, `kpi-roi-tracker`) get full `Course` schema on their detail pages once they're truly public — for now they ship with `WebPage` schema only because `/programs/:slug` is still behind `ProtectedRoute` (matches your audit's "broken promise" finding).

### 5. robots.txt / sitemap hygiene
- `public/robots.txt` already has `Sitemap: https://coachkayai.life/sitemap.xml` ✓ (verified — no change needed).
- `public/sitemap.xml` still references the old slug `mirror-challenge` and the duplicate `/about` flow isn't there. Will prune retired slugs in this same pass and confirm only the 47 entries that match current public + lead-magnet + retired-redirect slugs remain.
- Decision: keep the hand-edited `public/sitemap.xml` for now (you don't have a generator script and adding one is out of scope for this schema pass). Flagging it for Wave 3.

## Technical details

### New file
`src/lib/seo-schema.ts` — pure functions, no React. Exports:
- `SITE_URL`, `PERSON_ID`, `ORG_ID`, `WEBSITE_ID` constants.
- `globalGraph()`, `breadcrumb()`, `webPage()`, `aboutPage()`, `collectionPage()`, `courseFromProgram()`, `programSchema()`, `offerCatalog(programs)`.

### Changed files
- `src/components/SEOHead.tsx` — auto-injects global graph.
- `src/App.tsx` — `/about` → `<Navigate to="/coach-kay" replace />`.
- `src/pages/Index.tsx`, `Modules.tsx`, `CoachKay.tsx`, `Store.tsx`, `Community.tsx`, `ProgramDetail.tsx` — pass route-specific schemas.
- `public/sitemap.xml` — prune entries that no longer resolve.

### What's NOT in this pass (deferred, called out in audit)
- Product schema for Book Store items.
- VideoObject markup (no hero video currently).
- Per-program FAQPage (no per-program FAQs in data).
- Sitemap generator script + `predev`/`prebuild` hooks.
- Unifying the navigation headers (separate plan).
- Making lead magnets truly public (separate plan — affects routing, not just schema).

## Open questions
1. **Confirm NAP details** for the Person/Organization graph:
   - Address: Columbus, OH, US ✓?
   - Phone: +1-380-287-7936 ✓?
   - Email: hello@coachkayelevates.org ✓?
   - sameAs URLs: coachkayelevates.org, forward-focus-elevation.org, LinkedIn ✓? Any social URLs to add (IG, YouTube, Skool)?
2. **`/about` redirect** — confirm you want a hard client redirect to `/coach-kay` (recommended), or keep `/about` rendering with a canonical pointing to `/coach-kay`?

Answer those two and I'll execute the whole thing in one wave.
