

# Add Google Auth + Password Reset + Cloud Data Persistence

## Overview
Add authentication (Google OAuth + email/password with password reset) so users can persist clarity sessions and challenge progress across devices. Migrate data storage from localStorage to the database.

## Database Changes

### 1. Profiles table
```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
```
Plus a trigger to auto-create profile on signup.

### 2. Sessions table (replaces localStorage sessions)
```sql
create table public.clarity_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  module_id text not null,
  answers jsonb not null,
  insight_truth text,
  insight_pattern text,
  insight_action text,
  created_at timestamptz default now()
);
alter table public.clarity_sessions enable row level security;
-- Users can only CRUD their own sessions
```

### 3. Challenge progress table (replaces localStorage challenges)
```sql
create table public.challenge_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  challenge_type text not null,
  entries jsonb default '{}'::jsonb,
  current_day integer default 1,
  started_at timestamptz default now(),
  unique (user_id, challenge_type)
);
alter table public.challenge_progress enable row level security;
```

## Frontend Changes

### 4. Auth context + provider
- Create `src/contexts/AuthContext.tsx` — wraps app with auth state, provides `user`, `signIn`, `signOut`, `signInWithGoogle`, `loading`
- Uses `supabase.auth.onAuthStateChange` listener
- Wrap `<App>` in `<AuthProvider>`

### 5. Auth page (`src/pages/Auth.tsx`)
- Single page with tabs: Sign In / Sign Up
- Email + password form fields
- "Sign in with Google" button (using `lovable.auth.signInWithOAuth("google")` via Lovable Cloud managed OAuth)
- "Forgot password?" link triggers `supabase.auth.resetPasswordForEmail()`
- Matches existing cinematic design (dark navy, gold accents, floating orbs)

### 6. Reset password page (`src/pages/ResetPassword.tsx`)
- Route: `/reset-password`
- Form to enter new password
- Calls `supabase.auth.updateUser({ password })`
- Checks for `type=recovery` in URL hash

### 7. Configure Social Auth
- Use the Configure Social Login tool to generate the lovable OAuth module for Google

### 8. Update session-store to use database
- Update `src/lib/session-store.ts` — add async functions that read/write to `clarity_sessions` and `challenge_progress` tables when user is authenticated, fall back to localStorage for anonymous users
- Update `ResultScreen.tsx`, `MirrorChallenge.tsx`, and pattern-detect calls to use async store

### 9. Update navigation
- Add user avatar / sign-in button to Index page header area
- Show sign-out option when authenticated
- Protect certain features (coach chat, challenges) with soft auth prompts — not hard gates, but encourage sign-in to save progress

### 10. Routing updates in App.tsx
- Add `/auth` route
- Add `/reset-password` route

## Technical Notes
- Google OAuth uses Lovable Cloud's managed credentials — no setup needed
- Email confirmation will remain enabled (users verify email before signing in)
- All existing localStorage data continues to work for anonymous users
- Authenticated users get cloud persistence automatically

