

# Audit and Fix Admin Access

## Current State

- **Admin user exists**: `hello@coachkayelevates.org` (ID: `72cabdb4-3825-4a97-a649-902853f83228`)
- **Missing from DB**: `app_role` enum, `user_roles` table, `has_role()` function — none exist yet
- **Current admin check** (`use-roles.ts`): Tries `has_role` RPC (fails silently), then checks `get_user_tier` for "corporate" (fails), then falls back to hardcoded email list — **admin access works via fallback only**
- **Routes**: All four admin routes (`/admin`, `/admin/users`, `/admin/analytics`, `/admin/content`) are properly wrapped in `<ProtectedRoute requireAdmin>`

## Plan

### Step 1 — Create RBAC infrastructure (database migration)

Run a single migration that creates:

```sql
-- 1. Enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. RLS: admins can read all, users can read own
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 4. Security-definer function (no RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Grant admin role to Coach Kay
INSERT INTO public.user_roles (user_id, role)
VALUES ('72cabdb4-3825-4a97-a649-902853f83228', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 2 — Clean up `use-roles.ts`

Remove the `as any` cast on the `has_role` RPC call now that the function exists. Keep the email fallback as a safety net but log a warning when it's used.

### Step 3 — Manual testing checklist

After migration, sign in as `hello@coachkayelevates.org` and verify:
1. `/admin` — dashboard loads
2. `/admin/users` — user list populates
3. `/admin/analytics` — charts render
4. `/admin/content` — modules/programs listed

## Technical Notes

- The `has_role` function uses `SECURITY DEFINER` to bypass RLS on the `user_roles` table, preventing recursive policy checks.
- No code changes needed for admin pages themselves — they already use `useRoles()` which calls `has_role`.
- The `manage-users` edge function runs with the service role key and is unaffected by client-side RLS.

