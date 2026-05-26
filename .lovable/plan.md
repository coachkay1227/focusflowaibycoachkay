# Full site audit + admin-access fix + premium nav remediation

## Part A — Root cause: why every /admin route bounces to /dashboard

Confirmed in code, not guessed.

**File:** `src/hooks/use-roles.ts`

```ts
const [isAdmin, setIsAdmin] = useState(false);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!user) {
    setIsAdmin(false);
    setLoading(false);   // ← sets loading=false before checkRole ever runs
    return;
  }
  const checkRole = async () => { ... };  // ← never sets loading=true
  checkRole();
}, [user]);
```

Render sequence on `/admin`:
1. First render: `authLoading=true`, `rolesLoading=true` → ProtectedRoute shows "Loading…".
2. AuthContext resolves: `user` is initially undefined while session hydrates → useRoles useEffect fires the `!user` branch and sets `rolesLoading=false`, `isAdmin=false`.
3. AuthContext finishes hydrating session, `user` becomes the real user → useEffect re-runs and starts `checkRole()` **but does not set `loading=true`**.
4. ProtectedRoute now sees `!authLoading && !rolesLoading && requireAdmin && !isAdmin` → fires `navigate("/dashboard")` **before** `checkRole()` resolves.

Both verified admin accounts in DB (`hello@coachkayelevates.org`, `kizzy.alaoui@gmail.com`) have `role='admin'` in `user_roles`, and the fallback email list also includes them — so RBAC is correct; the bug is the client race.

**Fix:**
- In `use-roles.ts`, set `setLoading(true)` at the **start** of `checkRole()`, and only set `setLoading(false)` after the async work completes. Don't toggle `loading=false` in the `!user` branch until `authLoading` is also resolved (accept a `{ authLoading }` from AuthContext, or read `user === undefined` vs `null`).
- Simplify all 5 admin pages: delete their duplicate `useEffect` that redirects on `!isAdmin` — `ProtectedRoute requireAdmin` already does that. The duplicate is what causes the visible bounce even after we fix the hook.
- Add a quiet console.warn in dev when ProtectedRoute redirects an admin so future regressions surface in logs.

## Part B — Page-by-page audit (every route in `src/App.tsx`)

Legend: **OK** = working & needed · **FIX** = working but has issues · **GAP** = broken or unfinished · **KEEP-HIDDEN** = needed but should not be in public nav · **PRUNE** = candidate for removal.

### Public marketing
| Route | Status | Notes |
|---|---|---|
| `/` | OK | Homepage, primary CTAs land correctly |
| `/coach-kay` (`/about` redirect) | OK | Just rebuilt with nav + brand cards |
| `/community` | OK | Skool link works |
| `/modules` | OK | Lists programs |
| `/programs/:slug` | OK | Detail pages |
| `/store` | OK | Book studio |
| `/rent-an-agent` | FIX | Verify CTA buttons go somewhere real |
| `/advisory` | FIX | Same — confirm Calendly/booking link |
| `/starter-kit` (+ `/ai-starter-kit` redirect) | OK | Free AI doorway |
| `/kiosk` | KEEP-HIDDEN | In-person mode, correctly noIndex |
| `/sitemap` | OK | Public HTML sitemap |

### Clarity / Assessment funnel
| Route | Status | Notes |
|---|---|---|
| `/clarity`, `/clarity/:moduleId` | OK | Engine + AI insight |
| `/result` | OK | Now has mirror card + share |
| `/assessment` | FIX | Confirm it isn't duplicate of `/clarity`; if it's the M.A.C. assessment, link from a CTA somewhere |
| `/mirror-challenge`, `/challenges`, `/challenges/:type` | OK | Auth-gated where needed |

### Auth / account
| Route | Status | Notes |
|---|---|---|
| `/auth` | OK | Email/password + Google + sessionStorage returnTo |
| `/reset-password` | OK | Present, required |
| `/onboarding` | FIX | Verify it's reachable post-signup and skippable |
| `/dashboard` | OK | Now has `YourProgramPanel` |
| `/profile` | OK | |
| `/coach` (auth-gated chat) | OK | |

### Audit lane (consulting)
| Route | Status | Notes |
|---|---|---|
| `/audit/landing` | OK | |
| `/audit/intake` | OK | |
| `/audit/intake/:id` | **GAP** | Renders 404 — App.tsx only registers `/audit/intake` (no `:id` variant). Current user is sitting on a 404 right now. **Fix:** add `<Route path="/audit/intake/:id" element={...} />` so resuming an intake works. |
| `/audit/report/:id` | OK | |

### Commerce / fulfillment
| Route | Status | Notes |
|---|---|---|
| `/order-success` | OK | Stripe success landing |

### Legal
| Route | Status | Notes |
|---|---|---|
| `/privacy`, `/terms`, `/disclaimer`, `/refund-policy` | OK | Just shipped |
| `/unsubscribe`, `/email-unsubscribe` | FIX | Two routes for same job — keep `/email-unsubscribe` (token flow) and redirect `/unsubscribe` to it, or vice versa |

### Admin (all gated by `requireAdmin`)
| Route | Status | Notes |
|---|---|---|
| `/admin` (Dashboard) | GAP | Blocked by race bug; after fix, verify `manage-users` edge fn returns stats |
| `/admin/users` | GAP | Same; verify tier-change writes via service role |
| `/admin/analytics` | GAP | Same; verify Recharts renders with real `analytics_events` |
| `/admin/content` | GAP | Same; verify enable/feature toggles persist to `content_settings` |
| `/admin/orders` | GAP | Same; verify CSV export + Stripe links |
| `/email-preview` | GAP | Admin-only; verify it loads each template |

### Misc
| Route | Status | Notes |
|---|---|---|
| `*` (NotFound) | OK | |

## Part C — Navigation & button integrity

Source of truth is `DesktopNav.tsx` + `MobileNav.tsx`. Mismatches to fix:

1. **DesktopNav hides itself on `PRIVATE_ROUTES`** including `/dashboard`, `/profile`, `/admin`, `/community`, `/modules`, `/clarity`, `/coach`, etc. Result: once you click into anything substantive you lose the global nav. The home-page hero nav is bespoke and not reused. **Fix:** stop hiding DesktopNav on logged-in routes; only hide on `/kiosk` and `/auth`. This single change makes every page feel like one app.
2. `MobileNav` is rendered only by pages that opt in (`Index`, `Community`, the new `CoachKay`). Many pages have no hamburger. **Fix:** mount `MobileNav` globally in `App.tsx` next to the `DesktopNav`, with the same hide rules.
3. **Admin nav surface:** add the existing `AdminNav` component as a sub-header rendered inside `ProtectedRoute requireAdmin` so all 6 admin pages share one bar (currently each page imports it manually — fine, but verify each link present: Dashboard, Users, Analytics, Content, Orders, Email Preview).
4. **Dead nav targets:** `DesktopNav` includes "Studio" → `/store` ✓, "Rent-an-Agent" → `/rent-an-agent` ✓, "Advisory" → `/advisory` ✓ — all routes exist. No dead links from nav.
5. **Footer:** already covered legal + sitemap; add admin shortcut to footer only if `isAdmin` (small, muted, bottom-right).

## Part D — Endpoint / integration sanity

Sweep we'll run after the routing fix:

- Open every page in the browser tool (desktop + mobile), record any console error or 404 network call, and fix in place.
- Confirm `manage-users`, `clarity-insight`, `create-checkout`, `stripe-webhook`, `send-transactional-email` edge functions still respond.
- Confirm admin RPC `has_role` returns true for both admin accounts (already verified via DB query, but recheck after deploy).

## Part E — Execution order (small, ordered, low-blast-radius)

1. **Hook fix** — `use-roles.ts`: introduce proper loading state, accept `authLoading` from `useAuth`, only resolve `isAdmin` after both auth and role check finish.
2. **Strip duplicate redirects** in the 5 admin pages.
3. **Add missing route** `/audit/intake/:id` (current user is staring at a 404 from this exact gap).
4. **Promote nav to App-level** — render `DesktopNav` + `MobileNav` in `App.tsx`, narrow the hide list to `["/kiosk", "/auth", "/reset-password"]`.
5. **Consolidate unsubscribe** — pick one canonical route, `<Navigate>` the other.
6. **Verify** — open `/admin`, `/admin/users`, `/admin/analytics`, `/admin/content`, `/admin/orders`, `/email-preview`, `/audit/intake/abc123` with the logged-in admin account in the browser tool. Capture screenshots, fix anything broken on contact.

## Open questions before I touch code

1. The user account currently signed into the preview — which email is it? If it's `hello@coachkayelevates.org` or `kizzy.alaoui@gmail.com`, the fix above is sufficient. If it's a different email, I'll also need to add that to the admin role (one-line migration).
2. For `/unsubscribe` vs `/email-unsubscribe`: keep the token-based one (`/email-unsubscribe`) and 301 the bare `/unsubscribe` to it — OK?
3. `/assessment` (the M.A.C. assessment): leave it as a standalone offering or merge into `/clarity`?
