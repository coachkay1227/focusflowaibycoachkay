# Menu cleanup, user/admin consistency check, and what to skip

## What I verified before writing this

- Both menus (desktop and mobile) list "Rent-an-Agent" and "Autism Social Stories" as top-level items inside "Work With Me", alongside "AI Agents & Automation" and "Books & AI Kits".
- Every `/admin/*` route in `src/App.tsx` is wrapped in `ProtectedRoute requireAdmin`, and admin status comes only from the server `has_role` RPC against `user_roles`. No email allowlist, no tier escalation.
- Database side is already tight: admin-only tables (`admin_audit_log`, `analytics_events`, `app_settings`, `business_audits`, all order tables, newsletter, retries) grant read only to `has_role(uid,'admin')` or `service_role`. Inserts are limited to the row owner or service role. Nothing admin-scoped is readable by a normal signed-in user.
- Admin edge functions (`manage-users`, `admin-nurture`, `admin-webhook-health`, `list-payment-links-status`, `run-audit-fulfillment-test`, `draft-weekly-newsletter`, `fulfillment-recovery`) all re-check the caller's admin role server side. `preview-transactional-email` is key-gated. `robots.txt` disallows `/admin`.

So the "nothing a user can tap into" part is largely already true. I am not going to rebuild it.

## Change 1. Menu cleanup

Remove from both `DesktopNav` and `MobileNav`:
- "Rent-an-Agent" (it belongs under AI Agents & Automation)
- "Autism Social Stories" (it belongs under Books & AI Kits)

Keep the routes `/rent-an-agent` and `/autism-social-stories` live, keep them in the sitemap, and keep the in-page links that already point to them from `/agents`, `/agents/builds`, `/store`, FAQ, and the audit report. Nothing breaks, the menu just gets shorter.

Result: "Work With Me" goes from 9 items to 7.

## Change 2. Two real inconsistencies found in the menus

1. "Business Audit" points to `/advisory` in both menus. The audit funnel lives at its own intake page. That link should go to the audit entry point, not the advisory page.
2. Label drift: mobile says "Books: Autism Social Stories", desktop says "Autism Social Stories". Moot once the item is removed, but the same drift pattern exists in a couple of other labels, so both nav item lists will be lined up word for word.

## Change 3. Admin exposure. One small thing only

Rather than a security project, one targeted pass:
- Confirm no admin link or admin-only widget renders in the shell for a non-admin account (the account menu and the preview toggle read `isAdmin` already, this is a browser verification, not a rewrite).
- Confirm a signed-in non-admin hitting `/admin/users` directly is bounced to `/dashboard` and that the underlying data call returns nothing even if the page were forced open.

If both pass, admin lockdown is done and I will say so plainly instead of adding more guards.

## What I recommend skipping

- No new role checks, no new RLS policies, no extra middleware. The role table plus per-table policies plus per-function re-check is already three independent layers. Adding a fourth is churn.
- No new "admin" route group abstraction. Twenty-one routes each with the same wrapper is verbose but obvious, and obvious beats clever on an access-control boundary.
- No sitemap or prerender surgery for the two removed menu items. They stay public pages, reachable by link and search. Removing them from the menu is a navigation decision, not a de-indexing decision.
- No redirects needed, since no URLs change.

## Technical notes

Files touched: `src/components/DesktopNav.tsx`, `src/components/MobileNav.tsx`. Nothing else.
Verification: existing unit tests, the SEO and sitemap build checks, plus a browser pass on desktop and mobile menus and one non-admin access attempt on `/admin/users`.
