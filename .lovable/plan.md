# Simplification Review + Verification Pass

No code edits. Two parts: (1) honest "where we're overbuilt" review, (2) live tests against the running app + database.

---

## Part 1 — Where we can simplify

Reading what we've built across email engine, voice bible, access control, and the audit fixes, here's where the system is heavier than it needs to be:

### 1. Voice Bible has two source files
`supabase/functions/_shared/coach-voice.ts` and `src/lib/coach-voice.ts` are near-duplicates. Today they drift the moment one is edited. **Simpler:** keep the canonical copy in `supabase/functions/_shared/coach-voice.ts` and have the frontend import a small JSON-only subset (banned words, signoff string) via a generated file or a thin re-export. Voice rules for the AI live server-side only — the client never needs the full system prompt.

### 2. Admin detection runs three checks
`use-roles.ts` checks `has_role` RPC, then a hardcoded `ADMIN_EMAILS` array, then `get_user_tier === "corporate"`, then sets `false`. The corporate branch is exactly the bug we're testing (corporate should NOT be admin). **Simpler:** `has_role` only. The bootstrap email list can stay as a one-time seed via SQL, not a client fallback. Removing the corporate branch is a one-line fix.

### 3. AdminViewContext writes to both sessionStorage AND localStorage
The context has dead code: it reads sessionStorage first, then unreachable localStorage fallback, and writes to both on toggle. **Simpler:** pick one (sessionStorage, per the requirement that it resets on tab close) and delete the rest.

### 4. Five separate "order" tables
`autism_orders`, `book_orders`, `build_inquiries`, plus the new `one_time_orders` — same shape, different names. **Simpler over time:** one `orders` table with a `product_type` enum. Not urgent, but every new product currently means a new table + new admin page + new webhook branch.

### 5. Per-flow admin pages
`/admin/build-orders`, `/admin/audits`, `/admin/enrollments`, `/admin/autism-orders`, `/admin/orders`, `/admin/build-inquiries`. Six pages, near-identical table layouts. **Simpler:** one `/admin/orders` page with a product-type filter.

### 6. Checkout success path encoding
`create-checkout` does double path-validation (two `safePath` definitions in the file — one is dead code from a merge). **Simpler:** keep one validator, delete the other.

### 7. Email templates: 18 files, mostly the same shell
Every template re-declares header/footer/container styles. **Simpler:** a `<BaseEmail>` wrapper that owns the chrome; templates only supply body slots. Cuts each template by ~40 lines and guarantees voice consistency.

### 8. `useRoles` and `useAccessLevel` fire on every protected route
No caching, no React Query. Each mount = 1–2 RPC calls. **Simpler:** wrap both in React Query with `staleTime: 5min`. Single source of truth, no flicker on navigation.

I'd recommend doing #2, #3, #6 immediately (low-risk one-liners that also fix real bugs), defer #1, #7, #8 to a focused refactor pass, and treat #4, #5 as a roadmap item — not worth disrupting now.

---

## Part 2 — Verification tests to run

All tests run via Playwright against `localhost:8080` + direct DB queries via `psql`. Screenshots saved to `/tmp/browser/audit/screenshots/`. No code changes.

### Test A — Customer billing portal with mismatched emails
1. Read `customer-portal/index.ts` to confirm the metadata fallback is wired.
2. Query Stripe (`stripe--search_stripe_resources`) for a customer whose `email` differs from any auth user, but whose `metadata.supabase_user_id` matches a real auth user.
3. Sign that user in via injected session, click "Manage Billing" on `/dashboard`, follow the portal redirect, confirm the returned portal session belongs to the correct customer (compare `customerId` in edge function logs vs. expected).
4. Confirm session ownership: hit `customer-portal` with a different auth token and verify it returns a different customer or 404 — never the first user's portal.

### Test B — Strategy Intensive ($497) confirmation email
1. Find the Strategy Intensive price ID in `stripe-config.ts` / `offer-catalog.ts`.
2. Trigger the checkout flow end-to-end with a Stripe test card.
3. After webhook fires, query `email_send_log` for the recipient + template, confirm `status='sent'` and the body contains the booking link (Calendly / scheduling URL from the template).
4. Render the template via `/admin/emails/preview/strategy-intensive-confirmation` to visually confirm the booking CTA.

### Test C — Build Studio + Advisory orders land in `one_time_orders`
1. Inspect `one_time_orders` schema via `supabase--read_query`.
2. Place a test Build Studio checkout and a test Advisory checkout.
3. After webhook, query `SELECT product_type, stripe_session_id, amount, user_email FROM one_time_orders ORDER BY created_at DESC LIMIT 5` and confirm both rows exist with correct `product_type`.
4. Visit `/admin/build-orders` as admin and screenshot the new rows.

### Test D — Access control matrix
Four sub-cases, each with a screenshot:
1. **Admin sees everything without payment:** sign in as `hello@coachkayelevates.org`, visit a `requiredTier="premium"` gated page (e.g. `/coach-chat`), confirm content renders, no `AccessGate` overlay.
2. **Corporate is NOT admin:** create/find a user with `user_access_levels.tier='corporate'` and no `user_roles` row. Sign in, visit `/admin/dashboard`, confirm redirect to `/dashboard` and no admin nav links visible.
3. **Admin-view toggle:** as admin, toggle "User View", confirm:
   - Amber banner appears at top with "USER VIEW ACTIVE" + Exit button.
   - Gated content now shows the lock overlay.
   - Close tab, reopen, banner is gone (sessionStorage cleared).
4. **Toggle storage:** verify `sessionStorage['admin-user-view']` is set on toggle and that `localStorage['admin-user-view']` is NOT (the dead localStorage write from #3 above will show up here).

### Output
A single markdown report at `/tmp/browser/audit/report.md` with: ✅/❌ per test, evidence (screenshot paths, SQL row dumps, log excerpts), and any bugs found tied back to specific files/lines.

---

## What I will NOT do this round
- No code edits, migrations, or template changes.
- No Stripe live-mode charges — test mode only.
- No new admin pages or schema changes.

After you approve, I'll switch to build mode and run the tests in order, pausing only if a test reveals a blocker that needs a code fix decision.
