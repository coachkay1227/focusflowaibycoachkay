## What I'm seeing

Your Google sign-in on the live site actually **succeeds** — the auth logs show three successful Google logins in the last 60 seconds (200 OK, user `Kay Alaoui`). So the credentials are fine and the backend is minting sessions.

The problem is what happens **after** Google returns:

1. In `Auth.tsx`, the Google button calls `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin, ... })`.
2. `window.location.origin` is just `https://coachkayai.life` (no path), so Google bounces the user back to `/`, not `/auth`.
3. The "you're signed in, now go to /dashboard" logic lives inside `Auth.tsx`'s `useEffect`. If the user lands on `/` after OAuth, that effect never runs.
4. On top of that, the return trip depends on `lovableAuth` processing the tokens in the URL and calling `supabase.auth.setSession(...)`. If that runs on a page other than `/auth`, the user can also end up looking "signed out" until they hard-refresh.
5. Email/password flow: same redirect logic sits inside `Auth.tsx`, so if `getUserPreferences()` throws or hangs (e.g. RLS blocks the read for a brand-new user before the profile row exists), the redirect never happens and the button just shows "Please wait…".

## Fix plan (single narrow change, no other scope)

**File: `src/pages/Auth.tsx`**

1. Change the OAuth redirect target so the callback lands back on the auth page where the post-login handler exists:
   - `redirect_uri: \`${window.location.origin}/auth\``
2. Make the post-login redirect resilient — never leave the user stranded on the auth page if the preferences lookup fails:
   - Wrap `getUserPreferences()` in `try/catch`.
   - On error OR null result, still navigate (to `/onboarding` if no prefs row, else `/dashboard` or the stored `returnTo`).
   - Add a hard fallback: if `user` is set for >1.5s and we're still on `/auth`, force-navigate to `/dashboard`.

**File: `src/App.tsx` (only if needed)**

3. Confirm `/auth` is a public route and that `AuthProvider` wraps the router (it already does — no change expected, just verifying during implementation).

That's it. No other files touched. No new deps. Should restore both Google and email/password sign-in end-to-end.

## Out of scope (intentionally)

- Any other audit / admin / email work.
- Touching `AuthContext`, `use-roles`, or the Supabase client config.
- Any UI redesign of the auth page.
