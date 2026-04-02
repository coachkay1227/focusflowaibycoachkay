

# Comprehensive Supabase Audit Report

---

## 1. CONNECTION & CONFIGURATION

**Status: WORKING**

- Client at `src/integrations/supabase/client.ts` is correctly auto-generated, uses env vars, persists sessions, auto-refreshes tokens.
- `.env` has all 3 required variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`).
- 7 secrets configured in edge function environment (LOVABLE_API_KEY, STRIPE_SECRET_KEY, GHL_API_KEY, plus Supabase system secrets).

**Issue found:** `create-checkout/index.ts` line 22 creates the Supabase client with `SUPABASE_ANON_KEY` instead of `SUPABASE_SERVICE_ROLE_KEY`. It works because it only calls `auth.getUser(token)`, but it's inconsistent with `check-subscription` and `customer-portal` which correctly use the service role key for admin operations. Not a blocker, but fragile.

---

## 2. AUTHENTICATION

**Status: WORKING with minor issues**

- `AuthProvider` correctly sets up `onAuthStateChange` before `getSession()` (proper order).
- Sign-up uses `emailRedirectTo: window.location.origin`.
- Password reset redirects to `/reset-password` correctly.
- `ResetPassword.tsx` page exists for the reset flow.
- `handle_new_user` trigger auto-creates `profiles` and `user_access_levels` rows on signup.

**Issues:**
- **Auth form accessibility (FIXED):** Labels exist as `sr-only` (line 137, 152 in Auth.tsx). This is acceptable for screen readers.
- **No email confirmation enforcement check:** Cannot verify from code alone whether auto-confirm is disabled. Should confirm in auth settings.

---

## 3. DATABASE TABLES & SCHEMA

**Status: WORKING — 7 tables, all with RLS**

| Table | RLS | Policies | Issues |
|-------|-----|----------|--------|
| `profiles` | Yes | SELECT/INSERT/UPDATE own | No DELETE — correct |
| `user_access_levels` | Yes | SELECT own only, no user INSERT/UPDATE/DELETE | Correct — only service role modifies |
| `user_preferences` | Yes | SELECT/INSERT/UPDATE own | No DELETE — correct |
| `clarity_sessions` | Yes | SELECT/INSERT own | No UPDATE/DELETE — correct for immutable sessions |
| `module_enrollments` | Yes | Full CRUD own | Has unique constraint (user_id, module_id) |
| `challenge_enrollments` | Yes | Full CRUD own | Has unique constraint (user_id, challenge_type) |
| `challenge_progress` | Yes | SELECT/INSERT/UPDATE own | No DELETE — correct |

**No foreign keys to `auth.users`:** Correct pattern — the code references user IDs without FK constraints on the auth schema.

**Issue:** No foreign keys exist on ANY table. `profiles.id`, `user_access_levels.id`, `user_preferences.id` all reference auth user IDs by convention but have no FK constraint. If a user is deleted from auth, orphan rows remain. The `handle_new_user` trigger uses `ON DELETE CASCADE` would only work if FKs existed.

---

## 4. RLS POLICY ANALYSIS

**Overall: SOLID** — No recursive policies, no public read on sensitive data.

**Specific findings:**

- `user_access_levels`: Users can only SELECT their own tier. INSERT/UPDATE/DELETE all return `false` for authenticated users. Only service role (edge functions) can modify. This is the correct security pattern for tier management.

- `clarity_sessions`: No UPDATE policy means sessions are immutable once created. Good design for audit trail.

- **Potential gap:** `challenge_progress` and `module_enrollments` SELECT policies use `auth.uid() = user_id` but don't filter in the application code — the queries rely entirely on RLS. This is correct but means the app queries (`select("*")`) without `.eq("user_id", ...)` in `enrollment-store.ts` lines 24-27 and 104-107. RLS handles it, but adding the filter would be defense-in-depth.

- **No public/anonymous access:** All policies require `authenticated` role. Anonymous users cannot read or write any table. The app correctly falls back to localStorage for unauthenticated users (`session-store.ts`).

---

## 5. EDGE FUNCTIONS AUDIT

### 5a. Authentication on Edge Functions

| Function | Auth Method | Status |
|----------|-------------|--------|
| `clarity-insight` | JWT via `getClaims()` | SECURED |
| `coach-chat` | JWT via `getClaims()` | SECURED |
| `pattern-detect` | JWT via `getClaims()` | SECURED |
| `check-subscription` | `getUser(token)` with service role | SECURED |
| `customer-portal` | `getUser(token)` with service role | SECURED |
| `create-checkout` | `getUser(token)` with anon key | SECURED (but see note above) |
| `weekly-insights` | `getUser()` via client | SECURED |

**`supabase/config.toml`:** `verify_jwt = false` on clarity-insight, coach-chat, pattern-detect. This is correct because they do in-code JWT verification.

**Missing from config.toml:** `check-subscription`, `customer-portal`, `create-checkout`, `weekly-insights` are NOT listed. They deploy with the Lovable default (`verify_jwt = false`), which is fine since they all do in-code auth. But `weekly-insights` should be explicitly listed for consistency.

### 5b. Input Validation

| Function | Validation | Status |
|----------|------------|--------|
| `clarity-insight` | Validates answers object, key/value types, lengths, moduleId | GOOD |
| `coach-chat` | Validates messages array, length limits, role/content checks | GOOD |
| `pattern-detect` | Validates sessions array, length limit | GOOD |
| `create-checkout` | Only checks `priceId` exists — no format validation | WEAK |
| `check-subscription` | No body input needed | N/A |
| `customer-portal` | No body input needed | N/A |
| `weekly-insights` | No body input needed | N/A |

**Issue:** `create-checkout` does not validate that `priceId` matches a known price. Any string is passed directly to Stripe. Stripe will reject invalid IDs, but the error is generic (500). Should validate against known price IDs before calling Stripe.

### 5c. Behavior & Logic Issues

1. **`create-checkout` hardcodes `mode: "subscription"` (line 55).** The new cohort/premium products are one-time payments. Stripe will reject a one-time price with `mode: "subscription"`. This is a **BLOCKER** — purchasing cohort ($997), premium ($297/$497/$1997) tiers will fail at Stripe checkout.

2. **`check-subscription` only checks `subscriptions.list`** — it does not check for one-time payment completions. Users who buy a one-time product will never get their tier upgraded via this function. The PRODUCT_TIER_MAP exists but only activates for active subscriptions.

3. **No Stripe webhook handler exists.** There is no `stripe-webhook` edge function. Tier upgrades rely entirely on the 60-second polling in `use-subscription.ts`. For one-time purchases, this polling will never find an active subscription — so cohort/premium buyers will never get access.

---

## 6. STORAGE

**Status: NOT USED**

No storage buckets exist. Avatar URLs in `profiles.avatar_url` are stored as external URLs (user-provided). No file upload functionality exists in the app.

**Issue:** Avatar URL is rendered as an `<img src>` with no sanitization (Profile.tsx line 122). A user could set their avatar URL to a tracking pixel or malicious content. Should validate URL format and optionally proxy through a storage bucket.

---

## 7. QUOTA & PERFORMANCE CONCERNS

- **Supabase query limits:** Default 1000-row limit. Current queries are small (5 sessions, single rows). No risk yet.
- **60-second subscription polling** (`use-subscription.ts`): Makes an edge function call every minute per active user. At scale (100+ concurrent users), this creates significant edge function invocations. Should use a Stripe webhook instead.
- **`weekly-insights` calls AI on every render** — the component-level caching (24hr localStorage TTL) was mentioned in memory but needs verification in the component code.
- **`programs.ts` is 1965 lines** loaded on every route — code-splitting was identified but not yet implemented.

---

## 8. CRITICAL ISSUES SUMMARY

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | `create-checkout` hardcodes `mode: "subscription"` — one-time purchases fail | **BLOCKER** | Detect price type and set `mode: "payment"` for one-time prices |
| 2 | No Stripe webhook — one-time purchase tier upgrades never happen | **BLOCKER** | Build `stripe-webhook` edge function to handle `checkout.session.completed` |
| 3 | `check-subscription` only queries subscriptions, not one-time payments | **HIGH** | Add Checkout Session or Payment Intent lookup for one-time products |
| 4 | `create-checkout` uses anon key instead of service role key | **LOW** | Switch to `SUPABASE_SERVICE_ROLE_KEY` for consistency |
| 5 | No avatar URL sanitization | **MEDIUM** | Validate URL format (https only, image extensions) |
| 6 | No priceId validation in `create-checkout` | **MEDIUM** | Validate against known STRIPE_TIERS before calling Stripe |
| 7 | 60s subscription polling at scale | **MEDIUM** | Replace with webhook-driven approach |
| 8 | No orphan cleanup if auth user deleted | **LOW** | Add `ON DELETE CASCADE` FKs or a cleanup function |

---

## 9. RECOMMENDED FIX ORDER

1. **BLOCKER — Fix `create-checkout` mode detection** (30 min): Check if the price is recurring or one-time, set `mode` accordingly
2. **BLOCKER — Build Stripe webhook** (2-3 hrs): Handle `checkout.session.completed` to upgrade tiers for one-time purchases
3. **HIGH — Update `check-subscription`** to also verify one-time purchase history via Stripe Checkout Sessions API
4. **MEDIUM — Validate priceId** in create-checkout against known values
5. **MEDIUM — Sanitize avatar URLs** with URL validation
6. **LOW — Add FK constraints** with CASCADE delete for data hygiene

