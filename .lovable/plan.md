
# Full-Stack Audit Report — FocusFlow AI (coachkayai.life)

Read-only audit. **No code was changed in this pass.** Below is what exists, what works, what's broken, what I changed in the previous turn (per your "detect any changes I didn't ask" request), and the prioritized path to launch + #1 ranking in the OH AI-coaching niche.

---

## 1. Changes I made in the LAST turn (you should know)

You explicitly approved the SEO/JSON-LD plan, so all of these were in-scope — none were unauthorized:

- **Created** `src/lib/seo-schema.ts` (Person/Org/WebSite graph, breadcrumb, OfferCatalog, programSchema builders).
- **Edited** `src/components/SEOHead.tsx` — auto-injects global graph.
- **Edited** `src/App.tsx` — `/about` now `<Navigate to="/coach-kay" replace />`.
- **Edited** `src/pages/Index.tsx`, `Modules.tsx`, `CoachKay.tsx`, `Store.tsx`, `Community.tsx`, `ProgramDetail.tsx` — per-route JSON-LD.

**Out-of-scope drift check: NONE detected.** I did not touch nav, pricing, programs, edge functions, RLS, Stripe config, or any business logic.

---

## 2. Frontend audit — what's wired, what's orphan

**Routes in `App.tsx`: 28.** Reachability:

| Status | Routes |
|---|---|
| ✅ Reachable & in nav | `/`, `/modules`, `/coach-kay`, `/community`, `/store`, `/dashboard`, `/profile`, `/clarity`, `/assessment` |
| ⚠️ Reachable but orphan in nav | `/coach` (Coach Chat), `/challenges`, `/mirror-challenge`, `/result`, `/programs/:slug`, `/order-success`, `/onboarding`, `/sitemap` (HTML), `/kiosk`, `/email-preview`, `/email-unsubscribe`, `/unsubscribe` |
| 🔒 Admin only | `/admin`, `/admin/users`, `/admin/analytics`, `/admin/content`, `/admin/orders` |
| 🔁 Redirect | `/about` → `/coach-kay` (new) |
| 🚪 Auth | `/auth`, `/reset-password` |

**Nav inconsistencies (still broken):**
- `DesktopNav` hides on Dashboard/CoachKay/Store (custom nav PRIVATE_ROUTES list) → **Book Store invisible after login.**
- `MobileNav` has no Book Store entry.
- Dashboard's inline nav has no Book Store, no Coach Chat link.
- Coach Kay page has no global Back/Home affordance (bespoke header).
- Three nav systems coexist (DesktopNav + MobileNav + Dashboard inline) — should consolidate into one `AppHeader`.

---

## 3. Catalog audit — `src/data/programs.ts`

54 programs total. Visibility breakdown verified:

| Visibility | Count |
|---|---|
| public | **7** ✅ matches PricingSection |
| lead_magnet | 3 |
| backend | 38 |
| retired | 6 |

**Issues:**
- Lead magnets (Clarity Check, MAC-Type, KPI/ROI Tracker) are marketed as "no signup required" but `/programs/:slug` is still inside `<ProtectedRoute>`. Promise vs reality mismatch.
- Backend modules have no Dashboard surface showing what a tier unlocks.
- `ProgramDetail.tsx` shows generic "Included inside [tier]" copy instead of naming the parent offer.
- `parentOfferId` not consistently set across 38 backend modules.

---

## 4. Backend audit (Lovable Cloud / Supabase)

**Edge functions present:** 25 (apply-now, clarity-insight, coach-chat, create-checkout, customer-portal, stripe-webhook, ghl-webhook, weekly-insights, manage-users, email queue, etc.).
**DB functions:** `has_role`, `get_user_tier`, `handle_new_user`, email queue helpers — all `SECURITY DEFINER` with `search_path = public` ✅.
**RLS:** `user_access_levels` blocks self-tier-mutation ✅.
**Secrets:** Stripe, GHL, Lovable AI Gateway all set ✅.

**Untested in this audit (recommend Wave 2):**
- Stripe webhook → tier upgrade end-to-end (live mode).
- `apply-now` → email queue → admin notification.
- `clarity-insight` guest flow (only edge function with `verify_jwt = false`).
- `weekly-insights` cron behavior.

---

## 5. SEO / Visibility audit

| Area | Score | Notes |
|---|---|---|
| Title/desc/canonical | 9/10 | SEOHead correct on all primary routes |
| JSON-LD | 9/10 | Just upgraded — global graph + offer catalog + breadcrumbs + per-program Course |
| robots.txt | 9/10 | Per-bot rules + AI crawlers explicitly allowed; sitemap line present |
| sitemap.xml | 7/10 | 56 entries; **hand-edited** (no generator script — drifts when routes change); still contains some retired slugs |
| Duplicate content | 9/10 | `/about` → `/coach-kay` redirect just shipped |
| Headings / a11y | 7/10 | Custom buttons used in place of `<button>` in a few places; icon-only buttons mostly have aria-labels |
| Performance | 7/10 | Routes lazy-loaded; LCP image not preloaded; no `vite-imagetools` |
| Schema gaps | — | No Product schema for Book Store; no VideoObject; no per-program FAQPage |

**Competitive positioning (OH / AI coaching):** No Semrush data pulled yet. To credibly claim "#1 in Ohio for AI consulting/coaching/community building" we need a baseline. Recommend running `semrush--domain_analysis` + `competitive_analysis` against `coachkayai.life` vs. likely peers (e.g. AI Ohio, Built-In Columbus coaches, regional consultants) before committing to keyword targets.

---

## 6. Accessibility audit (quick scan)

**Critical:** none found.
**Warning:**
- Several `<button>`s rebuild Tailwind styles instead of using the shadcn `Button` primitive (consistency, focus rings).
- `min-h-screen` used in places where `min-h-dvh` would be better on mobile.
- Coach Kay page has no clear back/home control.

**Info:** decorative orbs lack `aria-hidden`; some heading hierarchies skip levels inside cards.

---

## 7. What still needs to be done before launch

**Wave 1 — Polish (1–2 hours)**
1. Unify nav: single `AppHeader` used across `/`, Dashboard, CoachKay, Store; add Book Store + Coach Chat for logged-in users.
2. Resolve lead-magnet promise: make `/programs/focus-clarity-check`, `/programs/mac-type-assessment`, `/programs/kpi-roi-tracker` truly public (route-level allowance, not just visibility flag).
3. Add Dashboard "Unlocked modules" panel that lists backend modules included in the user's tier.
4. Prune 6 retired slugs from `public/sitemap.xml`.
5. Add minimal Footer with Sitemap, Community, Book Store, Privacy/Unsubscribe.

**Wave 2 — Trust & conversion (2–3 hours)**
6. Personalize ProgramDetail's "Included inside [Offer]" using `parentOfferId`.
7. Add Product schema for Book Store items.
8. Backfill `parentOfferId` audit across 38 backend modules.
9. Wire up end-to-end Stripe checkout test in test mode for all 7 public offers.
10. QA `apply-now` + `clarity-insight` guest flow.

**Wave 3 — SEO push to #1 (2–4 hours + ongoing)**
11. Build `scripts/generate-sitemap.ts` + `predev`/`prebuild` hooks so sitemap can't drift again.
12. Add per-program FAQPage schema (3 Q/A each on the top 7 offers).
13. Preload LCP image, convert hero art to AVIF/WebP via `vite-imagetools`.
14. Add OH-localized landing copy ("Columbus, Ohio AI coaching", "Ohio-based AI strategist", "Midwest AI training").
15. Run Semrush competitive analysis vs. OH AI consulting peers; pick 5 long-tail keywords to seed into copy.
16. Commission 3 short-form video clips for hero + Coach Kay page → enables VideoObject schema.

**Distance from launch:** Wave 1 + Wave 2 = launchable in ~half a day of focused work. Wave 3 is what gets you to #1.

---

## 8. Open questions before I implement anything

1. **Lead-magnet gating** — OK to move the 3 lead magnets outside `ProtectedRoute` so they truly require no signup? (Today they're gated.)
2. **Nav consolidation** — OK to retire `DesktopNav`, the bespoke Dashboard nav, and the CoachKay header and replace with one unified `AppHeader`?
3. **Footer** — minimal (Sitemap / Community / Store / Privacy / Unsubscribe) or none?
4. **Ohio SEO push** — want me to run Semrush competitive analysis now so we have data before adding Ohio-localized copy?

Answer 1–4 and I'll execute Wave 1 + Wave 2 in a single pass, then queue Wave 3.
