

# Admin Bypass for Content Gating + View Toggle

## Problem
As an admin, gated modules still show locked overlays because `AccessGate` only checks your `tier` (currently "free"), not your admin role. You need to see all content unrestricted while also being able to preview what regular users see.

## Plan

### Step 1 — Admin bypasses AccessGate
Update `src/components/AccessGate.tsx` to import `useRoles` and skip gating when `isAdmin` is true. One line change — admins see everything unlocked.

### Step 2 — Admin bypasses gating in Modules page
Update `src/pages/Modules.tsx` line 224: when `isAdmin` is true, set `needsGate = false` so all program cards render ungated.

### Step 3 — Add admin view toggle
Add a small floating toggle in `AccessGate` and `Modules` that only appears for admins — "Admin View" vs "User View". When toggled to "User View", the admin bypass is disabled and you see exactly what a free-tier user sees. This toggle state will be stored in a simple React context or localStorage so it persists across pages.

### Step 4 — Fix "View Plans" button
Update the `AccessGate` button that says "View Plans" — currently navigates to `/modules` which may be the same page. Change it to scroll to the pricing section on `/modules` using `navigate("/modules#plans")`.

### Files Changed
- `src/components/AccessGate.tsx` — add admin bypass + toggle
- `src/pages/Modules.tsx` — add admin bypass + import useRoles
- `src/contexts/AdminViewContext.tsx` — new, small context for the toggle state
- `src/App.tsx` — wrap with AdminViewContext provider

