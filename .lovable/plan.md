# End-to-end reality check, run in phases

84 routes, 42 edge functions, 38 tables. A single pass would either be shallow or unreadable. So this runs as six audit phases, one per money or trust journey, each ending in a written verdict you can act on. No code changes in any phase. Fixes come after you approve a phase's findings.

## Method used in every phase

For each journey: click path in the UI, handler, edge function, auth check, database write, external service call, returned result, persisted row, and the confirmation the user actually sees. Every item gets one label: working, working with gaps, broken, duplicated, mocked, UI only, missing, unknown. Live data and a real browser pass back every claim. Anything I cannot prove gets labeled unknown rather than guessed.

## Phase order

```text
Phase A  $47 AI Business Audit          landing to report to nurture
Phase B  Checkout and fulfillment core  create-checkout, stripe-webhook, verify-checkout-session
Phase C  Inquiry and application paths  advisory, agents, build studio, task force
Phase D  Email delivery and recovery    send, log, retry, dead letter
Phase E  Access and identity            signup, roles, tiers, admin bypass, gated content
Phase F  Assessments and AI surfaces     starter kit, clarity, MAC, coach chat, rate limits
```

Each phase delivers a short findings table plus a fix list ranked by revenue impact. You approve or skip fixes before anything is written.

## What the live data already shows, before the audit starts

These are facts from your database right now, and they shape where the phases dig.

- 7 business audits total. 4 paid, 3 stuck at `pending_payment`. That is the only revenue path with real rows.
- `one_time_orders`, `agent_orders`, and `build_inquiries` are all empty. Advisory, agent, and build studio purchases have never completed once in production. Phase B and C treat those as unproven, not working.
- `task_force_invitations` is empty. That form has never received a submission.
- Every user sits on the `free` tier. Only 2 role rows exist. No paid entitlement has ever been granted through the app.
- 3 `stripe-webhook` failures, all at the signature stage, all on Aug 8. Phase B confirms whether that was test noise or a live signing mismatch.
- 197 analytics events, and not one checkout start among them. Either the tracking call never fires or nobody reaches checkout. Phase B separates those two.
- Email log: 48 sent, 34 suppressed, 3 dead lettered from April. The suppressed block is heavily starter kit and test addresses. Phase D confirms the suppression guard catches test traffic and not real buyers.

## Phase A scope, running first

Trace `/audit` to `/audit/intake` to Stripe to `stripe-webhook` to `business_audits` to `generate-business-audit` to `/audit/report`, plus the audit token claim path and the day 1/3/7 nurture sequence. Specific questions answered: why 3 rows sit at `pending_payment`, whether the report renders for a guest holding only a token, whether nurture enqueues exactly once, and whether the report ready email matches a real generated report.

## Technical notes

- Reads only: `psql` selects, the database linter, edge function logs, and Playwright against localhost. No migrations, no deploys, no state changes.
- Where a test purchase is needed to prove a path, I use the existing $0 test coupon route from earlier phases, and I tell you before running it.
- Output per phase lands in `docs/qa/` so findings persist instead of scrolling away.