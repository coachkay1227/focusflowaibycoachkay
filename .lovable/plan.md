

# SEO Hardening — Full Optimization Pass

## What's Already Strong
Your SEO is well above baseline. robots.txt, sitemap, structured data, OG tags, security headers, and per-page SEOHead are all in place. This plan addresses the remaining gaps to reach fully optimized.

## Plan

### Step 1 — Add missing crawlers to robots.txt
Add rules for: `Yandex`, `Baiduspider`, `Sogou`, `CCBot`, `Bytespider` (TikTok), `meta-externalagent` (Meta AI), `anthropic-ai`, `Cohere-ai`, `ia_archiver` (Alexa/Internet Archive). Apply same disallow patterns as existing bots.

### Step 2 — Add favicon and apple-touch-icon references to index.html
The `favicon.ico` file exists but isn't linked. Add `<link rel="icon">` and `<link rel="apple-touch-icon">` tags to `index.html`.

### Step 3 — Create web app manifest
Add `public/manifest.json` with app name, theme color, background color, icons, and display mode. Link it from `index.html`. This enables PWA-like behavior and better mobile bookmarking.

### Step 4 — Add Open Graph locale and site_name
Add `og:locale` and `og:site_name` meta tags to `SEOHead.tsx` for richer social previews.

### Files Changed
- `public/robots.txt` — add ~10 more crawler rules
- `index.html` — add favicon, apple-touch-icon, and manifest links
- `public/manifest.json` — new file
- `src/components/SEOHead.tsx` — add og:locale and og:site_name

### What This Does NOT Change
- No design or functionality changes
- No changes to existing crawl rules or sitemap content
- Domain references stay as-is (can be updated when custom domain is finalized)

