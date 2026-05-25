# Full Audit — Rent-an-Agent + Advisory Rollout

## TL;DR

**Status: ship-ready after 3 small fixes.** The new pages, routing, Stripe wiring, sitemap, SEO, navigation, and the new `rent_agent` tier are all internally consistent. Three regressions worth fixing before publish:

1. **Admin can't assign the new `rent_agent` tier** — hardcoded dropdown.
2. **Stripe success-redirect silently falls back to `/dashboard`** — URL-validation regex rejects the encoded tier names the new pages send.
3. **`/auth?next=…` is ignored** — RentAnAgent/Advisory send a query param Auth.tsx never reads, so post-login users land on `/dashboard` instead of returning to the pricing page.

Everything else (routes, lazy loading, webhook tier mapping, NO_TIER short-circuit, PROTECTED_TIERS, sitemap, SEO regressions, footer/nav, inquiry → apply-now) is correctly wired.

---

## What I audited

- Routing & lazy-load (`src/App.tsx`)
- New pages: `/rent-an-agent`, `/advisory`
- New components: `OfferInquiryDialog`
- Single-source-of-truth: `src/lib/offer-catalog.ts`
- Tier plumbing: `use-access-level.ts`, `tier-constants.ts`, `stripe-tiers.ts`, `AccessGate.tsx`
- Edge functions: `create-checkout`, `check-subscription`, `stripe-webhook`, `apply-now`
- Stripe config: `supabase/functions/_shared/stripe-config.ts` (product map, NO_TIER set, price-mode map, PROTECTED_TIERS)
- Migration: `access_tier` enum extension
- Discovery surfaces: `MobileNav`, `DesktopNav`, Index footer, `public/sitemap.xml`, `scripts/generate-sitemap.ts`, `scripts/check-seo-regressions.ts`
- Admin surfaces: `AdminUsers.tsx`
- Auth return-path flow: `ProtectedRoute.tsx`, `Auth.tsx`

---

## ✅ What's correct

**Routing & pages**
- `/rent-an-agent` and `/advisory` registered, lazy-loaded with `PageSkeleton` fallback. No duplicate routes, no orphan imports.
- Both pages have `<SEOHead>` with valid title, description, canonical path, and JSON-LD (CollectionPage + ItemList + Service offers).
- Both pages render their own header + MobileNav and link back to `/`.

**Stripe wiring**
- All 6 Rent-an-Agent prices + 2 entry offers exist in `PRICE_MODE_MAP` with correct `subscription` / `payment` modes.
- All 6 Rent-an-Agent products mapped to `rent_agent`; one-time SKUs `prod_U91…` (Audit) and `prod_UaEU…` (Intensive) are in `NO_TIER_PRODUCTS` so the webhook acknowledges them without firing `unknown_product` alerts.
- `stripe-webhook` short-circuits NO_TIER products before tier-upsert; upgrades happen via `metadata.supabase_user_id`; cancellations correctly downgrade rent-agent subs to `free`.
- `check-subscription` adds `rent_agent` to `PROTECTED_TIERS`, so once granted it's never overwritten by polling.

**Tier system**
- `AccessTier` union, `TIER_RANK` (rent_agent = 4, premium = 3, corporate = 5), `TIER_LABELS`, and `STRIPE_TIERS` all consistent.
- `AccessGate` still works because every consumer reads from the same constants.
- DB enum migrated with `ADD VALUE IF NOT EXISTS` (idempotent, safe to re-run).

**Discovery & SEO**
- `public/sitemap.xml`, `scripts/generate-sitemap.ts`, and `scripts/check-seo-regressions.ts` all include `/rent-an-agent` and `/advisory`.
- `MobileNav` + `DesktopNav` + Index footer link both pages.
- No dead routes, no `/api/...` style edge-function calls, no missing imports.

**Inquiry → CRM**
- `OfferInquiryDialog` posts `{ type: "inquiry", name, email, organization, programName, message }` — matches the contract `apply-now` already enforces (`type ∈ {application, inquiry}`, `programName` optional). Email + GHL fan-out works as-is.

**Memory rules respected**
- All new edge-function code uses `esm.sh` (no `npm:` specifiers).
- No external animation libs introduced.
- RLS unchanged; users still can't self-modify access tier.

---

## 🐛 Bugs to fix

### 1. `AdminUsers.tsx` — hardcoded tier dropdown
`src/pages/admin/AdminUsers.tsx:23`
```ts
const tierOptions: AccessTier[] = ["free", "subscriber", "cohort", "premium", "corporate"];
```
Missing `"rent_agent"`. Admins can't manually grant or revoke the new tier from the UI. (The webhook handles it automatically, but manual overrides are blind.)

**Fix:** add `"rent_agent"` to the array, ideally between `"premium"` and `"corporate"` to match rank order.

### 2. `create-checkout` — `safePath` regex too strict
`supabase/functions/create-checkout/index.ts:35-36`
```ts
const safePath = (p, fallback) =>
  typeof p === "string" && /^\/[A-Za-z0-9/_\-?=&]*$/.test(p) ? p : fallback;
```
Both new pages send paths like `/order-success?tier=Rent-an-Agent%20Starter%20(Founding)`. That string contains `%`, space, `(`, `)`, and `.` — none allowed. Validation silently fails, the redirect falls back to `/dashboard?checkout=success`, and the `tier` context is lost on the success screen.

**Fix options (pick one):**
- Allow safe URL characters: `/^\/[A-Za-z0-9/_\-?=&%.,()~ ]*$/` (still same-origin, no scheme/host).
- Or drop the friendly tier name and pass a short key (e.g. `?tier=raa_starter_founding`) so we keep the strict allowlist.

Preferred: option B (short keys) — keeps the allowlist tight.

### 3. `?next=` query param ignored on `/auth`
`src/pages/RentAnAgent.tsx:65` and `src/pages/Advisory.tsx:28` do:
```ts
navigate(`/auth?next=${encodeURIComponent("/rent-an-agent")}`);
```
But `src/pages/Auth.tsx` only reads `sessionStorage("auth:returnTo")` and `location.state.from`. The `?next=` value is never consumed → after sign-in the user is sent to `/dashboard` (or onboarding), not back to the pricing page they were about to buy from. Conversion hit.

**Fix (pick one):**
- Cheapest: in both pages, set `sessionStorage.setItem("auth:returnTo", "/rent-an-agent")` (or `/advisory`) before `navigate("/auth", { state: { from: "/rent-an-agent" } })`.
- Cleanest: teach `Auth.tsx` to also read `new URLSearchParams(location.search).get("next")` and persist it into `auth:returnTo`. Then `?next=` works for any caller.

---

## ⚠️ Minor / informational

- **`src/integrations/supabase/types.ts`** is auto-regenerated. Until the next regeneration the `Database["public"]["Enums"]["access_tier"]` union won't include `rent_agent`, which means `AdminUsers.tsx`'s `AccessTier` import is temporarily out of sync. This self-heals on the next pull and doesn't break runtime.
- **Pre-migration Rent-an-Agent customers** (if any) currently sit at `premium`. Because `premium` is in `PROTECTED_TIERS`, `check-subscription` won't auto-relabel them to `rent_agent`. If you want them re-labelled, a one-time SQL update is needed — otherwise leave them alone (rent_agent rank ≥ premium rank, so they don't lose any access).
- **Memory dissonance**: `mem://core` still says "Rent-an-Agent products grant `premium` tier." That note is now stale and should be updated post-fix.

---

## Implementation order

```text
1. AdminUsers tier dropdown ............ 1-line change
2. create-checkout safePath ............ choose regex broaden OR short tier keys
   └─ if short keys: also update RentAnAgent.tsx + Advisory.tsx callers
3. Auth ?next= handling ................ 2 small edits OR Auth.tsx URLSearchParams read
4. Update mem://core stale note ........ memory write
5. (Optional) seed update for legacy premium → rent_agent
```

Approve and I'll apply 1–4 in one pass.
