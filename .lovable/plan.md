

# Fix Google Account Picker and Password Reset Flow

## Problems

1. **Google sign-in auto-selects account** — The `handleGoogleSignIn` in `Auth.tsx` does not pass `prompt: "select_account"`, so Google automatically signs in with the last-used account (your Gmail) instead of letting you pick `hello@coachkayelevates.org`.

2. **Password reset link expires instantly** — The auth logs confirm `"One-time token not found"` (403). This happens because the `redirectTo` URL in `AuthContext.tsx` uses `window.location.origin` which resolves to the **preview** domain (`*.lovableproject.com`), but the reset email link hits the **published** domain or vice versa. The token is consumed during the redirect, but the Supabase session isn't established on the page that loads. The `ResetPassword.tsx` page checks for `type=recovery` in the URL hash, but the Supabase auth flow may strip it during the PKCE redirect.

## Plan

### Step 1 — Fix Google account picker

In `src/pages/Auth.tsx`, update `handleGoogleSignIn` to pass `prompt: "select_account"`:

```typescript
const result = await lovable.auth.signInWithOAuth("google", {
  redirect_uri: window.location.origin,
  extraParams: {
    prompt: "select_account",
  },
});
```

### Step 2 — Fix password reset flow

In `src/pages/ResetPassword.tsx`, improve the recovery detection:

- Listen for the `PASSWORD_RECOVERY` auth event (already done but may race with page load)
- Also check for an active session with `getSession()` after the hash check, since Supabase may have already exchanged the token
- Remove the strict `valid` gate that blocks the form — if the user arrives at `/reset-password` with an active session, show the form

### Step 3 — Grant admin to Google account

Run a database migration to also assign `admin` role to `kizzy.alaoui@gmail.com` (ID: `c89185b2-c251-45c5-be16-e17e21e4241f`), and add the email to the fallback list in `use-roles.ts`.

### What This Fixes

- Google sign-in will show the account picker so you can choose which account to sign in with
- Password reset links will work — the form will appear when you click the email link
- Both your accounts will have admin access

