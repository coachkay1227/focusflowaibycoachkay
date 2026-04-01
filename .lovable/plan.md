

# Full Enrollment System: Onboarding + Module & Challenge Enrollment + Progress Tracking

## Overview
Build a complete enrollment system with three parts: (1) post-signup onboarding flow, (2) module enrollment with completion tracking, (3) challenge enrollment with progress persistence. Add a user dashboard to view all enrollments and progress.

## Database Changes

### 1. `module_enrollments` table
```sql
create table public.module_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  module_id text not null,
  status text not null default 'enrolled', -- enrolled, in_progress, completed
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  sessions_count integer default 0,
  unique (user_id, module_id)
);
-- RLS: users can CRUD own enrollments
```

### 2. `challenge_enrollments` table
```sql
create table public.challenge_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  challenge_type text not null,
  status text not null default 'enrolled', -- enrolled, in_progress, completed
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  unique (user_id, challenge_type)
);
-- RLS: users can CRUD own enrollments
```

### 3. `user_preferences` table (for onboarding data)
```sql
create table public.user_preferences (
  id uuid primary key references auth.users(id) on delete cascade,
  onboarding_completed boolean default false,
  primary_goal text,        -- e.g. 'clarity', 'emotional-health', 'focus', 'purpose'
  coaching_style text,      -- e.g. 'supportive', 'direct', 'reflective'
  selected_modules text[],  -- modules chosen during onboarding
  created_at timestamptz default now()
);
-- RLS: users can read/update/insert own preferences
```

## Frontend Changes

### 4. Onboarding Flow (`src/pages/Onboarding.tsx`)
- Shown after first sign-up (when `user_preferences.onboarding_completed = false`)
- 3-step cinematic flow:
  - **Step 1**: "What brought you here?" — select primary goal (Clarity, Emotional Health, Focus, Purpose/Meaning)
  - **Step 2**: "How do you like to be coached?" — select style (Supportive, Direct, Reflective, Strategic)
  - **Step 3**: "Pick your starting modules" — multi-select from the 5 coaching modules
- On completion: saves preferences, auto-enrolls in selected modules, redirects to dashboard
- Matches existing cinematic dark navy/gold design with floating orbs

### 5. User Dashboard (`src/pages/Dashboard.tsx`)
- New route: `/dashboard`
- Sections:
  - **My Modules**: enrolled modules with status badges (enrolled/in-progress/completed), session count, "Continue" or "Start" button
  - **My Challenges**: enrolled challenges with progress bar, current day indicator
  - **Recent Sessions**: last 3-5 clarity sessions with brief insight preview
- Soft prompt to enroll in more modules/challenges if lists are short

### 6. Enrollment actions on Modules page
- Update `src/pages/Modules.tsx`: add "Enroll" button for authenticated users (replaces direct "Start session" for unenrolled modules)
- Show enrollment status badge on each module card
- Enrolled modules show "Continue" instead of "Enroll"
- Anonymous users still get "Start session" (no enrollment needed)

### 7. Enrollment actions on Challenges page
- Update `src/pages/Challenges.tsx`: add "Enroll" button for authenticated users
- Show enrollment status on each challenge card
- Track when challenge status changes to in_progress (first entry) and completed

### 8. Auto-update enrollment status
- When a user completes a clarity session for a module, update `module_enrollments.status` to `in_progress` and increment `sessions_count`
- When a user completes a challenge (all days), update `challenge_enrollments.status` to `completed`
- Update `session-store.ts` with enrollment helper functions

### 9. Navigation updates
- After sign-up, redirect to `/onboarding` instead of `/`
- Add "Dashboard" link to nav bar for authenticated users
- Update `Auth.tsx` to check onboarding status on sign-in and redirect accordingly

### 10. Routing
- Add `/onboarding` route
- Add `/dashboard` route

## Files to Create/Modify

| Action | File |
|--------|------|
| Create | `src/pages/Onboarding.tsx` |
| Create | `src/pages/Dashboard.tsx` |
| Create | `src/lib/enrollment-store.ts` |
| Update | `src/pages/Modules.tsx` |
| Update | `src/pages/Challenges.tsx` |
| Update | `src/pages/MirrorChallenge.tsx` (update enrollment on progress) |
| Update | `src/pages/ResultScreen.tsx` (update enrollment on session complete) |
| Update | `src/pages/Auth.tsx` (redirect to onboarding) |
| Update | `src/pages/Index.tsx` (add Dashboard nav link) |
| Update | `src/App.tsx` (new routes) |
| Migration | New tables: `module_enrollments`, `challenge_enrollments`, `user_preferences` |

## Technical Notes
- All enrollment data is cloud-only (requires authentication)
- Anonymous users continue using the app without enrollment — soft prompts encourage sign-in
- Onboarding is skippable but encouraged
- Dashboard becomes the authenticated user's home base

