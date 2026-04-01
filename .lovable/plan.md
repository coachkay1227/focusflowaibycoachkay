

# Create `useAccessLevel` Hook

## Overview
Create a custom React hook that reads the current user's access tier and returns a typed value. Since access tiers represent authorization levels (not just preferences), we should store them in a dedicated table following security best practices — not in `user_metadata` which is client-editable.

## Approach
Store access levels in a new `user_access_levels` table (not in `user_metadata`, which users can modify themselves — a security risk). The hook reads from this table, falling back to `"free"` for unauthenticated or unassigned users.

## Database Change

New table `user_access_levels`:
```sql
create type public.access_tier as enum ('free', 'subscriber', 'cohort', 'premium', 'corporate');

create table public.user_access_levels (
  id uuid primary key references auth.users(id) on delete cascade,
  tier access_tier not null default 'free',
  created_at timestamptz default now()
);

alter table public.user_access_levels enable row level security;

create policy "Users can read own access level"
  on public.user_access_levels for select
  to authenticated
  using (auth.uid() = id);
```

A security-definer function for server-side tier checks:
```sql
create or replace function public.get_user_tier(_user_id uuid)
returns access_tier
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    (select tier from public.user_access_levels where id = _user_id),
    'free'::access_tier
  )
$$;
```

## Hook File

**Create `src/hooks/use-access-level.ts`**

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
// ... useState, useEffect

export type AccessTier = "free" | "subscriber" | "cohort" | "premium" | "corporate";

export function useAccessLevel(): { tier: AccessTier; loading: boolean } {
  // If no user → return "free" immediately
  // Otherwise query user_access_levels table
  // Cache result for session duration
  // Default to "free" on error or missing row
}
```

## Files

| Action | File |
|--------|------|
| Migration | New table `user_access_levels` + enum + RLS + helper function |
| Create | `src/hooks/use-access-level.ts` |

## Notes
- Storing tiers server-side prevents privilege escalation (users cannot edit their own tier via `user_metadata`)
- The `get_user_tier` function uses `security definer` so it can be called in RLS policies for other tables
- Default row creation can be added to the existing `handle_new_user` trigger if desired

