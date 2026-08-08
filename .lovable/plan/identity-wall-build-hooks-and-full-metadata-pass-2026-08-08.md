# Identity wall, build hooks, and full metadata pass

Eight-part cleanup so the site ships correct files on every production build, every public page has its own crawlable metadata, and brand rules hold everywhere.

## 1. Identity hard wall
Three files carry the legal surname today: `public/llms.txt`, `src/lib/coach-voice.ts`, and `supabase/functions/_shared/coach-voice.ts`. All three get rewritten to Coach Kay / Kenza Alaoui only. The voice files keep an explicit negative rule so no AI output can reintroduce it. Finish with a repo-wide search (source, public, supabase, docs, memory) and report the match count, which must be zero.

## 2. Build hooks
Today `predev` runs sitemap generation and the SEO check, and nothing runs them at build time, so production ships stale files.

- `prebuild`: sitemap generation, then the SEO regression check. A failing check fails the build.
- `postbuild`: the prerender step.
- The existing payment-link and email-guard checks stay in `build`.

## 3. Sitemap coverage
`scripts/generate-sitemap.ts` stamps every entry with today's date. That `lastmod` gets removed entirely, since no page-specific timestamp source exists for static routes. Blog entries keep their own published/modified dates from `src/data/blogPosts.ts`.

Missing routes get added, including `/start`. Note: `/about` and `/ai-starter-kit` are redirect routes in `src/App.tsx` (they send visitors to `/coach-kay` and `/starter-kit`). Listing redirects in a sitemap works against indexing, so the plan adds their real destinations and keeps the redirects working, rather than listing both.

## 4. Prerender and default meta
The base `index.html` gets a real default title, description, og:title/description/type/url, and twitter tags so any page a crawler hits without JS reads sensibly. `scripts/prerender-blog.ts` is generalised into a route table and extended past the blog to the main commercial routes: `/`, `/coach-kay`, `/agents`, `/agents/builds`, `/agents/lead-engine`, `/agents/hermes`, `/rent-an-agent`, `/build-studio`, `/advisory`, `/store`, `/autism-social-stories`, `/truth`, `/starter-kit`, `/faq`, `/assessment`, `/ai-tools`, `/pause-hub`, `/collective`, `/blog`. Output is capped by a constant so the build size stays safe.

## 5. Per page metadata
Audit every public route's `SEOHead` call: title under 60 characters, description under 160, self-referencing canonical and og:url, plus og:title, og:description, og:type and twitter:card. Any page relying on a generic sitewide title gets a written one. The SEO check gains assertions for the title and description length limits so this cannot regress.

## 6. Cross link the ecosystem
A shared footer block links the three properties with distinct one-line framing: FocusFlow AI (this site, the commercial arm), Coach Kay Elevates (the personal brand), and The F.O.C.U.S. Diagnostic at https://the-diagnostic-coachkayai-life.lovable.app. The same links land in `public/llms.txt` and the sitewide structured data so crawlers connect the properties without treating them as one site.

## 7. Brand rules
- Em dashes removed from user-facing copy across pages and components (86 files currently contain one). Rewritten as periods or commas, not simply swapped.
- Hardcoded hex values and raw color utilities in page and component files replaced with design tokens. Navy `#0D1B2A`, Gold `#C9A84C`, Cream `#F5EDD6` are confirmed in the token layer so the tokens carry the exact brand values.
- Scan for income-guarantee language and remove any.
- Forward Focus Elevation reads "fiscally sponsored" wherever it appears and is kept off commercial pages.

## 8. Verify and report
Re-run the SEO regression check, the payment-link and email guards, the unit suite, and a production build. Confirm the generated `sitemap.xml` and prerendered HTML files. Also clear two live preview errors (`busyPriceId`, `LEAD_ENGINE_TIERS`) before verifying. Then a written summary of what changed, then publish.

## Technical notes
- Files touched: `package.json`, `index.html`, `scripts/generate-sitemap.ts`, `scripts/prerender-blog.ts` (generalised), `scripts/check-seo-regressions.ts`, `public/llms.txt`, `src/lib/coach-voice.ts`, `supabase/functions/_shared/coach-voice.ts`, `src/components/SEOHead.tsx`, the site footer, and the public page components.
- No database or edge-function behaviour changes beyond the voice prompt text.