

# SEO Overhaul: Structured Data, Sitemap, Meta Tags & Best Practices

## Current State (Audit Findings)

| Area | Status | Issue |
|------|--------|-------|
| **Page titles** | Missing | Only `index.html` has a title; all SPA routes share the same one |
| **Meta descriptions** | Missing | No per-page descriptions |
| **Canonical tags** | Missing | No canonical tags anywhere |
| **Sitemap.xml** | Missing | No sitemap exists |
| **HTML Sitemap** | Missing | No sitemap page |
| **Structured data (JSON-LD)** | Missing | No schemas at all |
| **Image alt attributes** | Mostly N/A | App uses icons, not images; one `alt="Avatar"` exists — acceptable |
| **robots.txt** | Present | Functional but missing `Sitemap:` directive |
| **OG/Twitter meta** | Partial | Present on index.html but static; uses placeholder Lovable OG image |

## Plan

### 1. Add react-helmet-async for per-page meta tags
- Install `react-helmet-async`
- Wrap `App` with `<HelmetProvider>`
- Create a reusable `<SEOHead>` component accepting title, description, canonical, and JSON-LD schema
- Add unique `<SEOHead>` to each page with relevant title/description/canonical

### 2. Per-page SEO metadata

| Page | Title | Description |
|------|-------|-------------|
| `/` | FocusFlow AI — AI-Powered Clarity Coaching by Coach Kay | See clearly. Move with purpose. AI-powered clarity coaching... |
| `/modules` | Modules — FocusFlow AI | Explore guided clarity modules... |
| `/challenges` | Challenges — FocusFlow AI | Take on transformative challenges... |
| `/coach` | Coach Kay — FocusFlow AI | Chat with your AI clarity coach... |
| `/clarity` | Clarity Session — FocusFlow AI | Begin your guided clarity check... |
| `/dashboard` | Dashboard — FocusFlow AI | Track your clarity journey... |
| `/community` | Community — FocusFlow AI | Connect with fellow clarity seekers... |
| `/profile` | Profile — FocusFlow AI | Manage your profile and preferences... |
| `/auth` | Sign In — FocusFlow AI | Sign in or create your account... |

### 3. JSON-LD Structured Data
- **Homepage**: `Organization` + `WebSite` with `SearchAction`
- **Modules page**: `ItemList` of `Course` items
- **Challenges page**: `ItemList` of `Event` items
- **Coach Chat**: `FAQPage` or `Service` schema
- **Clarity Session**: `Service` schema

### 4. Canonical tags
- Each `<SEOHead>` outputs `<link rel="canonical" href="...">` using the page path

### 5. Static sitemap.xml
- Create `public/sitemap.xml` listing all public routes with priorities
- Since this is an SPA with known routes, a static file is sufficient

### 6. HTML Sitemap page
- Create `/sitemap` route with a simple page listing all public links

### 7. Update robots.txt
- Add `Sitemap: https://id-preview--389fc99e-23f6-4cc3-83cc-c164e7894c32.lovable.app/sitemap.xml`

### 8. Update index.html
- Add `<link rel="canonical" href="/">` as fallback
- Keep existing OG tags (they'll be overridden per-page by Helmet)

## Files Changed

| Action | File |
|--------|------|
| Create | `src/components/SEOHead.tsx` |
| Create | `public/sitemap.xml` |
| Create | `src/pages/Sitemap.tsx` |
| Update | `src/App.tsx` (add HelmetProvider, sitemap route) |
| Update | `src/main.tsx` (HelmetProvider wrapper) |
| Update | `public/robots.txt` (add Sitemap directive) |
| Update | `index.html` (canonical fallback) |
| Update | All page files (add `<SEOHead>` with unique meta + JSON-LD) |

## Technical Notes
- `react-helmet-async` chosen over `react-helmet` (maintained, SSR-ready)
- JSON-LD schemas follow Google's structured data guidelines
- Sitemap is static since all routes are known at build time; if dynamic content is added later, it can be generated via an edge function

