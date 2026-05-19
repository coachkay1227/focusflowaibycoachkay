
## What I found by walking the code

I traced the journey the user described and identified concrete breakpoints. I have not yet exercised the live preview — that's a verification step at the end — but the code-level breaks below are unambiguous.

### Breakpoint 1 — Anon → `/clarity` is broken by route guard
- Homepage hero promises "5-minute guided session · No sign-up required" and CTA is `navigate("/clarity")`.
- In `src/App.tsx`, `/clarity` is wrapped in `<ProtectedRoute>`, so anon users are bounced to `/auth`. The "no sign-up required" promise is false today.
- Edge function `clarity-insight` is already designed for the unauth guest flow (per project memory), so the page itself is meant to be public.

### Breakpoint 2 — Sign-up never returns the user to the intended page
- `src/pages/Auth.tsx` requires email verification: after `signUp()` it shows "Check your email" and flips back to `signin` mode. The intended-destination state I added last turn lives in `location.state.from`, but it's lost the moment the user leaves the tab to confirm their email and comes back.
- Even when sign-in succeeds, the `useEffect` redirect goes to `/onboarding` first if `user_preferences.onboarding_completed` is false — which it is for every brand-new user. So the intended `from` (e.g. `/clarity`) is dropped on the floor.
- There is no visible success confirmation state after sign-up; just a toast and a mode flip.

### Breakpoint 3 — Challenge enrollment looks functional but has UX gaps
- `enrollInChallenge` in `src/lib/enrollment-store.ts` calls `supabase.from("challenge_enrollments").upsert(..., { onConflict: "user_id,challenge_type" })`. RLS allows it for authed users. After insert, `Challenges.tsx` refetches and updates state — this part works.
- Gaps:
  - No optimistic update; the user sees a brief "..." then a refetch round-trip before the badge appears.
  - The `onConflict: "user_id,challenge_type"` requires a unique constraint with that exact name. If the constraint is missing, the upsert silently inserts a duplicate row — `getChallengeEnrollments` then returns multiple rows for the same challenge and the badge logic gets confused. I'll verify the constraint exists; if not, add a migration.
  - Anon users clicking "Enroll" from `Challenges.tsx` are sent to `/auth` with no `from` state, so they never come back to `/challenges` after sign-in.

### Breakpoint 4 — Mobile header on the homepage
- `src/pages/Index.tsx` has an inline nav with all desktop links hidden behind `md:`, and `<MobileNav />` (slide-in sheet from `src/components/MobileNav.tsx`) for small screens.
- The mobile sheet has Dashboard / Modules / Challenges / Coach Kay / Community / About / Profile and a Sign In button — links look correct, but I want to verify on a real 375px viewport that:
  - The "Start Session" primary CTA is reachable on mobile (currently it's `hidden md:inline-flex`, so on mobile it lives only inside the slide-in sheet — which it actually does NOT, the sheet has no Start Session item).
  - There's no overlap between the watermark, FloatingOrbs, and the header.
  - All routes resolve.

## Plan

### A. Make `/clarity` a true public route
- Remove `<ProtectedRoute>` from the `/clarity` and `/clarity/:moduleId` routes in `src/App.tsx`. Keep `/result`, `/dashboard`, etc. protected.
- `ClaritySession.tsx` already runs without a user — it just collects answers and navigates to `/result` with state. Currently `/result` is protected; need to allow guests to see results too OR have `/result` save anon results to localStorage and prompt sign-up after the insight is shown.
- Decision needed (will ask): does the guest get to see the AI insight, or is sign-up required only at the "save your insight" step?

### B. Sign-up always returns to intent + success confirmation
- Persist intended-return path to `sessionStorage` (key `auth:returnTo`) in `ProtectedRoute` and on the homepage CTA when it routes to `/auth`. SessionStorage survives the email-verification round-trip in the same tab.
- After successful sign-in OR after onboarding completion, read `sessionStorage["auth:returnTo"]`, navigate there, and clear it. Falls back to `/dashboard`.
- Add a real success confirmation screen in `Auth.tsx` post-signup: replace the "switch to signin" behavior with a dedicated `"signup-success"` mode that shows "Check your inbox to confirm your email, then sign in" with a clear "Open my email" / "Sign in" CTA, and explains they'll be returned to where they started.
- Onboarding (`src/pages/Onboarding.tsx`) needs the same return-to-intent behavior at completion.

### C. Challenge enrollment fixes
- Verify the unique constraint `challenge_enrollments_user_id_challenge_type_key` exists. If not, add a migration to create it. Same check for `module_enrollments`.
- Add optimistic update in `Challenges.tsx`: insert a temporary `enrolled` badge in local state immediately, then reconcile with the refetch. Roll back on error.
- When an anon user clicks "Sign in to enroll" or "Enroll" while logged out, store `auth:returnTo = /challenges` in sessionStorage before navigating to `/auth`, plus the challenge type they wanted, so we can auto-enroll on return.
- Surface backend errors instead of swallowing them — the `// Error handled silently` comments hide real failures from the showcase user.

### D. Mobile header polish
- Add "Start Session" as the first item in `MobileNav.tsx` so the primary CTA is reachable on mobile without opening the sheet vs. swap the sheet trigger to expose it.
- Audit z-index on Index.tsx (`FloatingOrbs`, `mouse-glow`, watermark) against the mobile menu button to confirm no overlap at 375px.
- Run a viewport pass at 375x812 to confirm: header doesn't overflow, all sheet links route correctly, sheet closes on navigate.

### E. Verification pass (browser)
After the fixes, walk the actual flow in the live preview at 1280×720 and 375×812:
1. Anon home → click "Begin Your Clarity Check" → `/clarity` loads → answer Q1 → reach insight (decide guest vs sign-up wall here based on §A).
2. Anon home → click "Sign In" → sign-up tab → submit → success confirmation visible.
3. Authed user on `/challenges` → click Enroll on 7-day → badge flips to "Enrolled" without page reload → reload → badge persists.
4. Mobile (375px) → open hamburger → all links navigate and close the sheet → Start Session is reachable.

I'll fix any new issues found during the live walkthrough before declaring done, and I'll be explicit about anything I couldn't verify (e.g. real email-confirmation round trip) instead of overstating.

## Question before I implement

The only fork that affects scope materially is §A: should the **guest** clarity flow show the AI insight on `/result`, or should the insight be gated behind sign-up (collect answers as guest, then prompt sign-up to reveal)?

I'll ask once, then implement the rest in one pass.
