## Diagnosis

The site already has `react-helmet-async` + a `SEOHead` component that sets per-page title/description/canonical/OG, and the scanner does execute JS (it correctly picked up `/clarity/clarity-check`'s unique title). So most of the "duplicate" findings are stale — they were captured before SEOHead was rolled out. But there are **real bugs and gaps** to fix:

1. `ClaritySession.tsx` always passes `path="/clarity"`, so every `/clarity/:moduleId` page emits canonical = `/clarity` — Google sees them all as dupes of the index.
2. `/auth`, `/sitemap`, `/reset-password`, `/onboarding`, `/dashboard`, `/profile`, `/coach`, `/mirror-challenge`, `/challenges/:type`, `/result`, `/order-success`, `/unsubscribe`, `/email-unsubscribe`, all `/admin/*` should send `noindex, nofollow` (login/private/utility pages).
3. `public/sitemap.xml` currently lists `/auth` — should be removed (the generator's static list includes it).
4. JSON-LD coverage is thin: only Index has a full graph; `/coach-kay` lacks Person, `/programs/:slug` lacks Course/Service, no BreadcrumbList anywhere.
5. A couple of pages may render `SEOHead` only after data-load / auth — scanner can capture the loading-state head. We'll mount SEOHead at the top of those components so it ships on first paint.

H1s: I spot-checked the 11 pages flagged as missing H1 (`Modules`, `CoachKay`, `Community`, `Store`, `Assessment`, `Challenges`, `StarterKit`, `Auth`, `Sitemap`) — they all DO render an `<h1>` in JSX today. That part of the report is stale; nothing to change in code. We'll just mark those findings fixed after a rescan.

## Plan

### 1. Extend `SEOHead`
- Add `noIndex?: boolean` prop → emits `<meta name="robots" content="noindex, nofollow">`.
- No other API changes.

### 2. Fix per-route canonical + noindex (one-line per page)
- `ClaritySession.tsx`: build `path` as `/clarity/${moduleId ?? "clarity-check"}` (or `/clarity` only when no module). Make `title` include the module name (already does).
- Add `noIndex` on: `Auth`, `ResetPassword`, `Onboarding`, `Dashboard`, `Profile`, `CoachChat`, `MirrorChallenge`, `ResultScreen`, `OrderSuccess`, `Unsubscribe`, `EmailUnsubscribe`, `Sitemap`, and all `admin/*` pages that render `SEOHead`. Add SEOHead where missing on admin pages (just for the noindex tag).
- Move `<SEOHead>` to render before any loading guard on pages where it currently lives below an early-return.

### 3. Sitemap + robots
- `scripts/generate-sitemap.ts`: drop `/auth` and `/sitemap` from the static route list (private/utility pages).
- `public/robots.txt`: ensure `Disallow: /auth`, `/reset-password`, `/dashboard`, `/profile`, `/coach`, `/onboarding`, `/admin/`, `/order-success`, `/email-unsubscribe`, `/unsubscribe`, `/result`, `/mirror-challenge`, `/sitemap` are listed (already partially there from earlier task — verify).

### 4. JSON-LD coverage
- `/coach-kay`: add `Person` schema (name, jobTitle "Master Certified Life Coach", sameAs social links if present, image).
- `/programs/:slug`: add `Course` schema (name, description, provider Person Coach Kay, offers price/currency from program data) per program.
- `/store`: `ItemList` of products.
- `/modules`: `ItemList` of modules.
- `/coach-kay` + key marketing pages: add `BreadcrumbList`.
- Keep `globalGraph()` (Organization + WebSite + Person) inlined sitewide via SEOHead — already does this.

### 5. Mark scanner findings fixed
After the edits, batch-call `seo--update_findings` for: canonical, duplicate-title, duplicate-description, H1, JSON-LD, and noindex findings, with one-line explanations each.

## Files to touch
- `src/components/SEOHead.tsx` (add `noIndex` prop)
- `src/pages/ClaritySession.tsx` (dynamic path)
- `src/pages/{Auth,ResetPassword,Onboarding,Dashboard,Profile,CoachChat,MirrorChallenge,ResultScreen,OrderSuccess,Unsubscribe,EmailUnsubscribe,Sitemap}.tsx` (noIndex)
- `src/pages/admin/*.tsx` (add SEOHead with noIndex where missing)
- `src/pages/CoachKay.tsx`, `ProgramDetail.tsx`, `Store.tsx`, `Modules.tsx` (richer JSON-LD)
- `scripts/generate-sitemap.ts` (drop /auth, /sitemap)
- `public/robots.txt` (verify disallow list)

No backend, no database, no business-logic changes.

Approve and I'll implement.