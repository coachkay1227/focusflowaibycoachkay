# Simplify the unshipped plan, then run the final backend audit

## Part 1: The pending plan is heavier than it needs to be

The only plan written and not yet built is the post-purchase delivery tracking, retry, and recovery plan. It works, but three pieces of it buy very little and cost real surface area.

Cut these:

1. **The new `fulfillment_recovery_log` table.** Its two jobs are the resend rate limit and the admin history. `email_send_log` already records every send with template, recipient, status, and timestamp, and `admin_audit_log` already records admin actions. Count recent rows in `email_send_log` for the rate limit and read `admin_audit_log` for the history. One less table, one less migration, one less set of policies.

2. **Two recovery functions.** `resend-fulfillment` (buyer) and `recover-fulfillment` (admin) do the same work with different callers. Make it one function with two modes: no token means the Stripe session id is the proof, an admin JWT means a record id is accepted. Same code path, half the deploy surface.

3. **The second admin screen.** `/admin/delivery-status` overlaps `/admin/nurture-queue`, `/admin/orders`, and `/admin/audits` heavily. Add a "needs attention" filter and the stage badges plus the two retry buttons to the existing `/admin/orders` screen instead of building a fifth place to look.

Keep as written: the buyer-facing stage checklist, the `stages` object returned from `verify-checkout-session`, on-demand retries only (no background worker), the email always going to the address on the order, and the shared status panel used by both the confirmation screen and the report page.

Net effect: no migration, one new edge function instead of two, one new component instead of a component plus a page. Same buyer outcome.

## Part 2: The final backend audit

Read-only first, fixes second, so nothing changes before you see the findings.

### Confirmed already

- The database linter reports 5 warnings, all the same class: `SECURITY DEFINER` functions that anon or signed-in users can still execute. One anon-callable, four signed-in-callable.
- There are 41 edge functions but only 26 have an explicit `verify_jwt` line in the function config. `admin-nurture`, `process-nurture-queue`, `log-order-next-step`, `manage-users`, and others rely on the deploy default.
- There are no storage buckets in this project, so the storage upload and download checks in your list do not apply. Nothing to test there.

### What the audit will check

**Connection and error handling.** Confirm the frontend client reads its URL and publishable key from the environment and that a failed backend call surfaces a message rather than a blank screen. Spot check the highest-traffic pages for unhandled promise rejections.

**Auth.** Sign in with email and password and with Google against the live preview, confirm the session lands on the dashboard, confirm admin sees everything without payment, and confirm a normal signed-in user does not.

**RLS and grants.** For all 32 public tables, verify RLS is on, every table has at least one policy, and the grants match what the policies allow. Two specific things to look at: tables marked as having only a single policy (`audit_tokens`, `processed_stripe_events`, `webhook_alert_state`, `webhook_failures`) and any table where anon holds a grant it does not need.

**SECURITY DEFINER exposure.** For each of the 6 database functions, decide who genuinely needs to call it from the API: `get_audit_by_token` and `claim_audit_token` are part of the public audit funnel and stay callable, `get_user_tier` and `has_role` are read by policies and server code and can have API execute revoked, `handle_new_user` and `update_updated_at_column` are triggers and should never be callable. That closes the 5 linter warnings without weakening the funnel.

**Edge function behavior.** Document each function's trigger, auth model, and side effects in one table, then flag any function whose declared `verify_jwt` disagrees with the guard actually written in its code. That mismatch is the real risk, not the count.

**Quotas and cost.** Review the slowest queries and the largest tables, confirm the nurture worker's batch size and cron cadence are not doing redundant work, and confirm no function is being invoked on a loop.

### Deliverable

One report at `docs/qa/final-backend-audit.md` with a status per item: verified, needs a fix, or not applicable. Anything needing a fix gets listed with the exact change, and nothing gets applied until you say go.

## Technical notes

- Audit steps use the linter, schema reads, direct read-only queries, function log reads, and a Playwright pass against the live preview for the auth flows.
- The only write in Part 2 is the report file. The `SECURITY DEFINER` grant changes and any RLS corrections are proposed in the report and applied as a separate migration after your approval.
- Part 1 changes nothing on its own. It rewrites the pending delivery-tracking plan so that when you approve the build, it is the smaller version.
