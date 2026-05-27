## Finish wiring the Collective AI Build Studio

The page, dialog, catalog, Stripe config, and admin inquiries view already exist. This plan connects them to the rest of the app.

### 1. Routes (`src/App.tsx`)
- Add public route `/build-studio` → `CollectiveAIBuildStudio` (lazy import).
- Add admin route `/admin/build-inquiries` → `AdminBuildInquiries` (lazy import, behind existing admin protection).

### 2. Global navigation
- `src/components/DesktopNav.tsx`: add `{ label: "Build Studio", path: "/build-studio", icon: Wrench, authOnly: false }` between Advisory and Coach Kay.
- `src/components/MobileNav.tsx`: add the same entry in the matching slot.
- Pick a lucide icon already idiomatic to the codebase (`Wrench` or `Hammer`).

### 3. Admin navigation (`src/components/admin/AdminNav.tsx`)
- Add `{ to: "/admin/build-inquiries", label: "Build", icon: Wrench }` to the `navItems` array.

### 4. Sitemap (`public/sitemap.xml`)
- Append a `<url>` entry for `/build-studio` (priority 0.9, weekly), lastmod `2026-05-27`.
- Admin route stays out of the sitemap.

### 5. SEO regression check
- Run `bunx tsx scripts/check-seo-regressions.ts` after edits to confirm the new page passes title/description/canonical checks (the page already sets `SEOHead`).

### 6. Verify
- Confirm build passes (auto), spot-check `/build-studio` renders, nav highlights active state, and `/admin/build-inquiries` is reachable for admins.

### Out of scope
- No catalog, pricing, Stripe, or dialog changes — those were completed earlier.
- No new Stripe products (the 9 prices are already mapped).
