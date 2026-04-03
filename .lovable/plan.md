

# Full System Audit: Auth, Supabase, Stripe, State, Redirects + Fixes

## Executive Summary

After examining every page, edge function, hook, and store file, the system is **largely sound**. There are **2 code fixes needed** (MobileNav overlay + console warning) and **1 potential issue** worth noting. Everything else is correctly wired.

---

## Flow-by-Flow Audit

### 1. Authentication Flow — PASS

| Step | Status | Detail |
|------|--------|--------|
| Sign up | OK | Email/password via `signUp`, Google OAuth via `lovable.auth.signInWithOAuth` |
| Email verification | OK | Auto-confirm is OFF; toast tells user to verify |
| Sign in | OK | `signInWithPassword`, redirects to onboarding or dashboard based on preferences |
| Session persistence | OK | `AuthContext` uses `onAuthStateChange` set up BEFORE `getSession()` — correct order |
| Password reset | OK | Sends reset link with `redirectTo: /reset-password`, dedicated `ResetPassword.tsx` page exists |
| Sign out | OK | Calls `supabase.auth.signOut()`, clears session |
| Protected routes | OK | Dashboard, Onboarding, Profile all check `user` and redirect to `/auth` |
| HIBP check | OK | Enabled by user in Cloud settings |

### 2. Supabase Data Flow — PASS

| Table | RLS | CRUD | Notes |
|-------|-----|------|-------|
| profiles | OK | Read/Insert/Update | Auto-created via `handle_new_user` trigger |
| user_access_levels | OK | Read only (client) | Mutations blocked; only service role updates |
| user_preferences | OK | Read/Insert/Update | Used by onboarding |
| clarity_sessions | OK | Read/Insert/Delete | No UPDATE — intentional (immutable sessions) |
| module_enrollments | OK | Full CRUD | Used by enrollment-store |
| challenge_enrollments | OK | Full CRUD | Used by challenge flow |
| challenge_progress | OK | Read/Insert/Update | No DELETE — acceptable |

### 3. Edge Functions — PASS (with notes)

| Function | Auth | Validation | Status |
|----------|------|------------|--------|
| clarity-insight | None (public) | Input sanitized, size-limited | OK — stateless AI, no DB |
| coach-chat | JWT via `getClaims` | Messages validated (count, size) | OK |
| pattern-detect | JWT via `getClaims` | Sessions array validated | OK |
| check-subscription | JWT via `getUser` | Protected tiers preserved | OK |
| create-checkout | JWT via `getUser` | priceId validated against allowlist | OK |
| customer-portal | JWT via `getUser` | N/A | OK |
| stripe-webhook | Signature or fallback | Checks payment_status + metadata | OK |
| weekly-insights | N/A | N/A | OK |

### 4. Stripe Integration — PASS

- `create-checkout` correctly sets `mode` based on price (subscription vs payment)
- `stripe-webhook` handles `checkout.session.completed` and upserts tier
- `check-subscription` checks active subs AND one-time checkout sessions
- Protected tiers (cohort, premium, corporate) are never overwritten by polling
- Product-to-tier mapping is consistent across all 3 files

### 5. State Management — PASS

- **Authenticated users**: All data goes through Supabase (sessions, enrollments, challenges)
- **Anonymous users**: localStorage fallback in `session-store.ts` and `enrollment-store.ts`
- `useAccessLevel` reads from `user_access_levels` table
- `useSubscription` polls `check-subscription` every 60s when session exists

### 6. Redirects — PASS

| From | Condition | To |
|------|-----------|-----|
| `/auth` | Already signed in, no onboarding | `/onboarding` |
| `/auth` | Already signed in, onboarding done | `/dashboard` |
| `/dashboard` | No user | `/auth` |
| `/onboarding` | No user | `/auth` |
| `/result` | No answers in state | `/clarity` |
| Checkout success | Via Stripe redirect | `/dashboard?checkout=success` |
| Checkout cancel | Via Stripe redirect | `/modules?checkout=cancelled` |

---

## Issues Found

### FIX 1: MobileNav overlay opacity (from screenshot)
- **File**: `src/components/MobileNav.tsx` line 39
- **Problem**: `bg-black/60` lets hero text bleed through on mobile
- **Fix**: Change to `bg-black/80`

### FIX 2: AnimatedSection console warning — "Function components cannot be given refs"
- **File**: `src/components/AnimatedSection.tsx`
- **Problem**: `AnimatedSection` is a function component that uses an internal `ref`, but `Index.tsx` renders it as a child inside elements that may pass refs. The console shows repeated warnings about this.
- **Fix**: Wrap `AnimatedSection` with `React.forwardRef` so refs pass through cleanly. This is cosmetic (no runtime crash) but creates console noise.

### NOTE: CoachChat sends messages even when unauthenticated (partial)
- The input is correctly disabled when `!user`, and the send button is disabled
- However, the initial auto-greeting (`sendMessage("I just completed...")`) fires without checking `user` — if someone navigates to `/coach` with context in `location.state` but no auth, it will fire and get a 401 from the edge function
- **Severity**: Low — the edge function returns 401 gracefully, and the toast shows an error. Not a crash, but worth guarding.
- **Fix**: Add `if (!user) return;` guard in the initial greeting `useEffect`

---

## Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `MobileNav.tsx` | `bg-black/60` → `bg-black/80` | Fixes mobile overlap |
| `AnimatedSection.tsx` | Wrap with `React.forwardRef` | Eliminates console warnings |
| `CoachChat.tsx` | Guard initial greeting with `user` check | Prevents unnecessary 401 |

No database migrations needed. No edge function changes needed. No Stripe changes needed.

