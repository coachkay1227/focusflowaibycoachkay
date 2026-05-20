## Naming — LOCKED

Public-facing names (no legacy/repurposed terms):

**Free / Entry**
- Clarity Check
- Personality + Drive Assessment
- 90-Day Growth Planner ← (was "4/90/1 Planner")
- Personal Breakthrough Call ← (was "Personal Clarity Session")
- Business Breakthrough Call
- AI Strategy Call

**Core (paid)**
- 30-Day Personal Reset
- 30-Day Business Reset
- 30-Day AI Reset
- 90-Day Personal Transformation
- 90-Day Business Transformation
- 90-Day AI Transformation

**Premium**
- 6-Month Private Coaching
- Founding Members Waitlist

All other legacy names (F.O.C.U.S. Clarity Check, MAC Type, Power Hour, Lead the Room, Mirror Challenge, 4/90/1, etc.) are retired from public surfaces. They may persist as internal IP/vault content only.

---

## Phase 1 — Frontend rewrite

### `src/data/programs.ts`
- `Duration` union: replace `"8week" | "12week"` → `"30day" | "90day" | "6month"`.
- Retire from public catalog (move to `programs-archived.ts`, mark `public: false`):
  - Sugar Reset 8-Week, 30-Day Hydration Reset, 7-Day MAC Fitness, 8-Week AI Transformation, 12-Week Mastery, Mirror Challenge, Lead the Room, Cultivating Growth Mindset, Power Hour.
- Add/replace with the 14 entries above using fresh names, fresh slugs, fresh taglines.
- Map each to F.O.C.U.S. pillar + Path (Personal / Business / AI).

### `src/pages/Index.tsx`
- "3 Paths to Transformation" → 3 paths × 4 tiers (Entry → 30-Day → 90-Day → 6-Month).
- "Start Here — Free" grid: Clarity Check, Personality + Drive Assessment, 90-Day Growth Planner, 3 Breakthrough/Strategy Calls.

### `src/pages/Modules.tsx`
- Rewrite pricing cards to match new SKU set.

### `src/pages/Assessment.tsx`
- Rebrand header from "MAC TYPE ASSESSMENT" → "PERSONALITY + DRIVE ASSESSMENT" (logic + scoring stays).

### `public/sitemap.xml` + `src/pages/Sitemap.tsx`
- Update URLs to new slugs; remove retired pages.

### Copy scrub
- Global find/replace: "8-Week", "12-Week", "F.O.C.U.S. Clarity Check", "MAC Type Assessment", "4/90/1", "Mirror Challenge", "Lead the Room", "Power Hour" → new names or remove.

---

## Phase 2 — Stripe + Supabase

### Stripe (decisions still needed — see below)
Retire/archive: `prod_UGHVIcGfn5LEoU` (8-Week Cohort), `prod_UGHqGWOM8Iqo3K` (12-Week Mastery), `prod_UGHpmJnJVVhIef` (30-Day Intensive — duplicate).

Create new products (pricing TBD):
1. 30-Day Personal Reset
2. 30-Day Business Reset
3. 30-Day AI Reset
4. 90-Day Personal Transformation
5. 90-Day Business Transformation
6. 90-Day AI Transformation
7. 6-Month Private Coaching (one shared SKU or 3 per-path?)

Keep: `prod_UFpARkX0OxZg51` Subscriber $27/mo, `prod_UGHWgMWBPbxXjH` 30-Day F.O.C.U.S. Reset $297 (re-label as "30-Day Personal Reset" if pricing matches).

### Code updates
- `src/lib/stripe-tiers.ts`: rewrite `STRIPE_TIERS` with new product/price IDs and names.
- `supabase/functions/_shared/stripe-config.ts`: rewrite `PRODUCT_TIER_MAP` + `PRICE_MODE_MAP`.

### Supabase migration
- Add `elevation` value to `access_tier` enum (or fold 6-Month into `premium` — decision needed).
- Update `cohort_registrations.cohort_name` default → `'Founding Members Waitlist'`.

---

## Phase 3 — Backend / vault

- `src/data/programs-archived.ts`: house retired programs flagged `vault: true, public: false`.
- Backend-only IP stays accessible to enrolled clients via `ProgramDetail` gating.

---

## Memory updates
- `mem://billing/monetization-strategy` — new SKU set
- `mem://strategy/access-paths` — 3 paths × 4 tiers
- `mem://tech/program-catalog` — new public/vault split

---

## Decisions still needed before build

1. **Pricing** for the 6 new products (30-Day Business/AI Reset, 3× 90-Day, 6-Month).
2. **6-Month Private Coaching**: one shared SKU or one per path (Personal/Business/AI)?
3. **90-Day & 6-Month billing**: one-time PIF, installment (3× / 6× monthly), or both?
4. **`elevation` tier**: new enum value for 6-Month, or fold into `premium`?
5. **Free Breakthrough/Strategy Calls**: actually free (Calendly) or paid intro ($–$$)?
6. **Confirm retirements** fully removed from public site (data preserved in DB): Sugar Reset, Hydration, MAC Fitness, Mirror Challenge, Lead the Room, Cultivating Growth Mindset, Power Hour.
7. **Founding Members Waitlist** — keep current `cohort_registrations` table or rename?

Once you answer these 7, I build straight through Phase 1 → 2 → 3.
