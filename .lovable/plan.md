# Simplification review, then a phased execution plan

Seven audits are done. Full findings are preserved at `/tmp/audit-findings-tests-1-7.md` and will be written into `docs/qa/` as the first documentation step of Phase 0.

## First: where the plan was overbuilt

Reading all seven audits together, most of what they surfaced collapses into **one root cause repeated in six places**, not thirty separate problems.

**The one root cause: fire-and-forget work in a worker that dies at response time.** Every email that "never sends" (`purchase-next-steps`, assessment results, starter kit), every null Clarity insight, and the false-success responses are the same bug: a promise created and not awaited, or a row written before the async result exists. Six symptoms, one fix pattern. Earlier plans treated them as six separate features.

**Three things I am cutting outright:**

1. **The new delivery-tracking table and second recovery function.** Already simplified once. Cutting further: `email_send_log` plus `audit_tokens` plus `business_audits.report` already answer every stage question. No migration, one function, one shared panel.
2. **The AI evaluation-set harness.** Real, but it is a quality tool, not a launch blocker. It ships after money and delivery are proven, and when it does, it is 3 golden inputs in a vitest file, not a framework.
3. **A fifth admin screen.** `/admin/orders`, `/admin/audits`, `/admin/nurture`, `/admin/nurture-queue` already exist. Everything new goes into `/admin/orders` as a filter and two row actions.

**One thing I am adding, because it is cheap and prevents everything above from recurring:** CI already runs on every PR and does not run the test suite. Adding one step turns a red suite from invisible into blocking. That is a two-line change with the highest leverage in this entire plan.

**The ordering rule I am applying:** fix what silently loses a paying customer, then what costs money, then what protects the fixes, then quality. Nothing else.

---

## Phase 0 — Green baseline (no product change)

Purpose: you cannot trust any later verification while the suite is red.

1. Fix the 2 stale assertions in `src/pages/Start.test.tsx` (they assert bare booking URLs; `buildBookingUrl` correctly appends order proof). Compare parsed query params, not whole strings. **Test files only. No source change.**
2. Add `bun run test` as a step in `.github/workflows/seo-regressions.yml`.
3. Write the seven audits into `docs/qa/audit-tests-1-7.md`.

**Your gate:** I show you `66 passed, 0 failed` and the workflow diff. Nothing ships until that is real.
**Rollback:** revert one commit. Zero user-facing surface.

---

## Phase 1 — Stop losing paying customers (the un-awaited sends)

The highest-impact phase. A buyer pays and receives nothing.

Files: `supabase/functions/stripe-webhook/index.ts`, `supabase/functions/mac-elaborate/index.ts`, `supabase/functions/generate-starter-report/index.ts`, `supabase/functions/clarity-insight/index.ts`.

1. `await` every send and every generation whose result gets stored. Where the work is genuinely slow, use the platform's background-task primitive explicitly rather than a bare un-awaited promise.
2. Stop returning 200 when the insert failed (`mac-elaborate`, starter kit). Return the real error; let the UI say so.
3. Write the Clarity insight in the same statement that has the AI result, never before it.
4. Fix nurture enrollment to cover the update path, not only insert, so buyers who filled intake before paying get enrolled.
5. Stop the admin audit trail asserting an email was sent when no `email_send_log` row exists. The log is the source of truth, not the intent.

**Your gate, and this is the part that matters:** we run one real `FFTEST100` audit purchase end to end. I show you, from the backend: the Stripe session, the `business_audits` row with a non-null report, the `audit_tokens` row, the `email_send_log` row with a provider message id, the three `nurture_touches` rows, and the email in your inbox. A rendered success screen proves nothing and I will not offer it as evidence.
**Race condition guard:** each fix is idempotent on the session id, so a duplicate webhook cannot double-send.
**Rollback:** per-function revert; each function is independent.

---

## Phase 2 — Close the cost and access holes

1. Rate-limit the four unauthenticated AI generators (`mac-elaborate`, `generate-starter-report`, `clarity-insight`, `generate-business-audit` guest path): per-IP and per-email ceiling, counted from rows that already exist. No new table.
2. Enforce tier server-side in the paid AI functions. Today `AccessGate` blurs in the browser and the function does not check. That is the one real security gap across all seven audits.
3. Remove the unverified volume claims from the recommendation strings ("helped hundreds"). Voice-bible hard wall: no invented statistics.

**Your gate:** I hit each generator past its ceiling and show the refusal; I call a paid function as a free-tier user and show the 403; I grep the strings clean.
**Rollback:** each item is a separate commit.

---

## Phase 3 — Delivery visibility and recovery (the simplified version)

1. `verify-checkout-session` returns a `stages` object: payment, order, access link, report, email. Every value read from a real row.
2. One new function `fulfillment-recovery`, two modes: `cs_` session id is the buyer's proof, admin JWT plus `has_role` accepts a record id. Resends go to the address on the order, never a typed-in one. Capped at 3 per order per hour, counted from `email_send_log`.
3. One shared `DeliveryStatusPanel`, used by `OrderSuccess.tsx` and `AuditReport.tsx`.
4. `/admin/orders` gets a "needs attention" filter, stage badges, and two row actions. Both write `admin_audit_log`.

**Your gate:** on a real settled session, I break one stage deliberately, show the panel reporting it honestly, click recover, and show the new backend rows.
**No migration. No new page.**

---

## Phase 4 — Lock it in

1. One Playwright journey spec for the audit path that ends on a **backend assertion** (row exists, log row exists), not a visible element. Runs against a dedicated test identity with `is_test = true` on every row it writes.
2. Pin `playwright.config.ts` with `baseURL` and `webServer` so local and CI agree.
3. One vitest authorization matrix over the route table plus one anon-vs-owner read.
4. Then, and only then, the 3-input AI evaluation set with voice hard-wall assertions.

**Your gate:** CI red when I deliberately break a fix, green when I restore it. That is the only proof a regression test works.

---

## The five failure modes I am designing against

| Risk | Prevention | Detection |
|---|---|---|
| Random edits / scope creep | One phase, one gate, nothing outside the named files | You approve each phase's file list before I start it |
| Symptom patches | Phase 1 fixes the pattern in all six places at once, not the loudest one | The `FFTEST100` run exercises all six |
| Race conditions | Every write idempotent on session id; no new background workers | Duplicate-webhook replay in the Phase 1 gate |
| Swallowed errors | Phase 1 item 2 removes the false 200s; errors surface to the UI | The gate includes a forced insert failure |
| Fake certainty | No phase closes on a screenshot or a toast | Every gate names the exact backend row I must show you |

## Environment drift

Two configuration items are yours, not mine, and I will hand you a one-page checklist rather than guess: the `verify_jwt` values for the 15 functions that rely on the deploy default, and the CI secrets if you ever want the credential-gated E2E to run rather than skip.

## What I need from you now

Approve, and I start at Phase 0. Each phase ends with me showing backend evidence and waiting for your go before the next one. If a gate fails, we stop there and fix it, we do not move forward with a phase half-proven.
