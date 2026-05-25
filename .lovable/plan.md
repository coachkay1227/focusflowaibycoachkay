## 1. Audit: Proposal vs. Current Implementation

### 1a. Brand & positioning
| | Proposal | Current |
|---|---|---|
| Name | **Story, Legacy & Publishing Studio** | "Book Store" / `/store` |
| Positioning | "Premium studio… not a generic bookstore" | Generic catalog grid |
| Buyer narrative | 5 buyer personas, 5 lanes, signature stack, why-this-wins | Absent |
| Studio sections | Positioning, Lanes, Stack, Add-ons, Why, Buyers, Delivery, CTA | Hero + tabs + cards only |

### 1b. Publishing lanes
Proposal lists **5 lanes**; current code has **3 categories** (`children`, `coloring`, `nonfiction`). Missing/misaligned:

| Proposal lane | Current home |
|---|---|
| Personalized Storybooks & Gifts | `children` (close) |
| Legacy & Family Storytelling | Currently filed under `children` (Premium Legacy Book) — wrong audience |
| Expert / Authority Books | `nonfiction` (close) |
| Creator / Seller Publishing Assets | `coloring` (too narrow) |
| **Autism & Social Story Offers** | **Not present** |

### 1c. Packages & pricing deltas
| Package | Proposal | Current | Delta |
|---|---|---|---|
| Mini-Story Starter | **$497** | $499 | -$2 (round to match) |
| Storybook Pro | $1,250 | $1,250 | ok |
| Premium Legacy Book | $2,500 | $2,500 | ok, but lane/audience needs re-targeting (elders/memoirs, not just kids) |
| Outline + Draft Only | $750 | $750 | ok |
| Done-for-You Expert Book | $2,500 | $2,500 | ok |
| Booked & Branded | $4,500 | $4,500 | ok |
| **Autism & Social Stories** | Custom/Package | **MISSING** | add as inquiry-only offer |
| Quick Sketch Starter | n/a in proposal | $297 | keep under Creator/Seller lane |
| Etsy Seller Pack | n/a in proposal | $597 | keep under Creator/Seller lane |
| Ultimate Creator Package | n/a in proposal | $1,250 | keep under Creator/Seller lane |

Add-ons are already aligned ($397/$297/$197).

### 1d. Stripe + backend wiring health
Verified end-to-end and **functional**:
- `create-book-checkout` edge fn validates input, looks up server-authoritative prices in `_shared/book-catalog.ts`, creates `book_orders` row, opens Stripe Checkout, persists `stripe_session_id`, and rolls back the order if Stripe fails.
- `stripe-webhook` correctly routes sessions with `metadata.book_order_id` to mark `book_orders.status = paid` idempotently and triggers post-purchase emails.
- `verify-book-order` + `update-book-order` exist; `book_orders` RLS is correct (user reads own, admin reads all, no client writes).
- Secrets present: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

**No Stripe wiring is broken.** What is broken is *discoverability and naming*.

### 1e. Discoverability defects (the "ailing" symptom)
- `DesktopNav.tsx`: `/store` is listed in `PRIVATE_ROUTES`, which makes the nav shell **return null on `/store`** — users have no top nav while browsing the store.
- `DesktopNav.tsx` also returns null on `/` (home), so the "Book Store" pill is only visible on a handful of non-private interior routes; most paths users actually visit are in `PRIVATE_ROUTES` too.
- `MobileNav.tsx` has **no Book Store entry at all**.
- `Index.tsx` does not link to `/store` from the homepage.
- Sitemap exposure of the Studio is minimal.

---

## 2. Final Proposal: Story, Legacy & Publishing Studio

### 2a. Information architecture
Keep the route `/store` (preserves SEO + existing order links) but rebrand the page to **"Story, Legacy & Publishing Studio"**. Restructure into 5 lanes:

```
/store
 ├─ Hero               "Turn stories, expertise, and lived experience into powerful assets."
 ├─ Studio positioning (the "not a generic bookstore" paragraph)
 ├─ Lane tabs (5):
 │    1. Storybooks & Gifts
 │    2. Legacy & Family
 │    3. Expert / Authority
 │    4. Creator / Seller
 │    5. Autism & Social Stories
 ├─ Signature Package Stack (cards filtered by lane)
 ├─ Add-Ons & Upsells row
 ├─ Why This Lane Wins (5 bullets)
 ├─ Best-Fit Buyers table
 ├─ Delivery & Platform Logic block
 └─ Final CTA → first available lane
```

### 2b. Catalog changes (`src/lib/book-store.ts` + `_shared/book-catalog.ts`)
1. Replace `BookCategory` enum:
   ```
   "storybooks" | "legacy" | "authority" | "creator" | "autism"
   ```
2. Update `CATEGORY_LABELS` to the proposal lane names.
3. Re-tag packages:
   - `children-mini-story-starter` → `storybooks`, price **$497** (49700)
   - `children-storybook-pro` → `storybooks`
   - `children-premium-legacy` → `legacy`, retitle audience copy to "elders/memoirs/heirloom"
   - `coloring-*` (3 packages) → `creator`
   - `nonfiction-outline-draft` → `authority`
   - `nonfiction-expert-book` → `authority`
   - `nonfiction-booked-branded` → `authority`
4. Add new package:
   - `autism-social-story-custom` — lane `autism`, **inquiry-only** (no Stripe price), CTA opens the existing intake modal in "Custom quote" mode → routes to `apply-now` edge fn instead of `create-book-checkout`.
5. Mirror every change in `supabase/functions/_shared/book-catalog.ts` (server-authoritative prices — this is the only file Stripe trusts).

### 2c. New UI sections (presentation only, no business-logic changes)
- **PositioningBlock** component (studio paragraph + delivery promise).
- **LaneTabs** replaces `CategoryTabs` (5 lanes, gold underline accent).
- **WhyWinsList** (5 bullets from proposal).
- **BuyersTable** (5 rows from proposal).
- **DeliveryBlock** (KDP / Etsy / private / digital).
- **InquiryCard** (custom-quote variant for Autism lane).

All use existing design tokens — deep navy bg, gold accent, Cormorant headings.

### 2d. Discoverability fixes
- `DesktopNav.tsx`: remove `/store` and `/order-success` from `PRIVATE_ROUTES` so the nav shell remains visible while shopping.
- `MobileNav.tsx`: add `{ label: "Studio", path: "/store", icon: BookMarked }`.
- `Index.tsx`: add a Studio teaser block on the homepage linking to `/store` with the Studio tagline.
- `Sitemap.tsx`: surface the 5 lanes as anchor links under "Studio".
- Update `<SEOHead>` title/description on `/store` to the new Studio name; add JSON-LD `Service` schema for each lane.

### 2e. Stripe verification pass (no code changes expected, just confirm)
After the rebrand:
1. Confirm `_shared/book-catalog.ts` slugs & cents match `src/lib/book-store.ts`.
2. Run a sandbox checkout for one package per lane and confirm:
   - `book_orders` row created with `pending_payment`.
   - Stripe session opens, payment succeeds in test mode.
   - Webhook flips status to `paid` and queues `book-order-paid` email.
3. Confirm Autism lane's inquiry submission lands in `cohort_registrations` (or wherever `apply-now` writes) — **no Stripe call**.

### 2f. Analytics (uses the `analytics_events` table we just shipped)
Fire these events so drop-off per lane is measurable:
- `studio_lane_view` (path: lane id)
- `studio_package_view` (props: slug)
- `studio_intake_open` / `studio_intake_submit`
- `studio_checkout_started` / `studio_checkout_paid`
- `studio_inquiry_submitted` (Autism lane)

### 2g. Out of scope (call out for follow-up)
- Creating real Stripe Products/Prices for each package (currently we compute `price_data` inline — fine, but a real Product/Price catalog would let the admin manage them in Stripe directly).
- Building a per-lane landing page (`/store/legacy`, `/store/authority`, etc.) for paid traffic — recommended next, not in this pass.

---

## 3. Implementation order (when you switch to build mode)

1. **Catalog migration** — update `src/lib/book-store.ts` and `_shared/book-catalog.ts` together (lanes, prices, autism package).
2. **Page rebrand** — refactor `src/pages/Store.tsx` into the 8-section Studio layout; add the new presentation components.
3. **Intake modal** — add the "inquiry" mode branch that routes Autism lane to `apply-now` instead of `create-book-checkout`.
4. **Nav + homepage exposure** — fix `DesktopNav` private list, add Studio to `MobileNav`, add homepage teaser, refresh sitemap.
5. **Analytics instrumentation** — wire the 6 studio events through the existing `trackEvent` helper.
6. **End-to-end verification** — sandbox Stripe checkout for one paid lane + one inquiry submission for the Autism lane; spot-check webhook → `book_orders.status = paid`.

## 4. Bottom-line health check

- **Stripe path:** functional and idempotent. No fixes needed in the edge functions or webhook — only the catalog data they read needs to be updated in lockstep on both sides.
- **Visibility:** currently weak — the nav literally hides itself on `/store`, mobile has no entry, and the homepage has no link. This is the #1 reason the store *feels* "ailing" even though checkout works.
- **Brand alignment:** the largest gap. The current page is a flat product grid; the proposal calls for a positioned studio with 5 lanes, a buyers table, and a clear inquiry path for Autism/Social Stories.

Approving this plan will produce a Studio that matches the proposal one-for-one, keeps every existing paid SKU live in Stripe, and adds the missing Autism lane as an inquiry funnel — without breaking any current order or webhook contract.