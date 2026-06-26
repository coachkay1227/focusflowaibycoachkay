
# FocusFlow Coach Kay Elevate AI — Production Audit & Non-Destructive Repair Plan

> Scope: READ-ONLY audit. No code, DB, RLS, Stripe, edge functions, env, or email config touched. Findings below are derived from source inspection plus recent change history; items marked **UNVERIFIED** require live runtime confirmation before any repair work.

---

## 1. Executive Summary

FocusFlow is a multi-surface platform: free clarity tools (Clarity Session, Starter Kit, Truth About AI, Pause Hub), gated programs (Reset/Transformation/Cohort/Premium), services (Rent‑an‑Agent, Advisory, Build Studio, Autism Social Stories, Book), assessments (Clarity, Business Audit, Agent Builder, MAC), and an admin suite (users, orders, audits, enrollments, newsletter, content, voice bible, booking links).

Backend: Lovable Cloud (Supabase) with ~30 tables, ~25 edge functions, Stripe subscriptions + one‑time orders, Resend for transactional email, Beehiiv/GHL for marketing, pg_cron for newsletter drafts.

**Current posture:** functionally rich but historically fragile. Recent hardening pass closed many issues (admin role table, JWT bypass removal, generic error responses, admin bypass via `AccessGate`, dynamic booking URLs, voice unification). Several **structural risks remain unverified end‑to‑end**: checkout→entitlement chain, tier matching across all transformation paths, assessment scoring documentation, and admin visibility into failed deliveries.

**Recommendation (preliminary, pending Phase 0 verification):** *Remain live with one‑time digital products and free flows; pause active paid marketing of subscription transformation tiers until offer→delivery matrix is green and a webhook replay test is documented.*

---

## 2. Application Summary (Phase 1)

**Purpose:** AI‑powered clarity + coaching platform that converts free assessments into paid programs and 1:1/agent services.

**Audiences:** founders/operators (primary), neurodivergent families (autism stories), corporate (cohort/corporate tier), book readers.

**Surfaces:**
- Public/free: `/`, `/clarity`, `/starter-kit`, `/truth`, `/pause-hub`, `/ai-tools`, `/blog`, `/coach-kay`, `/faq`, `/modules`, `/store`, `/rent-an-agent`, `/advisory`, `/build-studio`, `/collective`, `/autism-social-stories`, `/audit` landing, legal pages.
- Auth: `/dashboard`, `/profile`, `/coach`, `/mirror-challenge`, `/challenges/:type`.
- Gated by tier: program detail pages, premium modules, cohort content (via `AccessGate` + `useAccessLevel`).
- Admin: `/admin`, `/admin/users|analytics|content|orders|autism-orders|build-inquiries|build-orders|audits|enrollments|newsletter|newsletter-draft/:id|scam-alerts|voice-bible|booking-links`.

**Catalogs:** `src/data/programs.ts`, `src/lib/stripe-tiers.ts`, `src/lib/offer-catalog.ts`, `src/lib/build-studio-catalog.ts`, `src/data/autismCatalog.ts`, `src/lib/book-store.ts`.

---

## 3. Architecture Map (Phase 2 condensed)

```text
Browser ──► React/Vite SPA ──► Supabase JS (anon key)
                │                  │
                │                  ├─► Postgres (RLS) — 30 tables
                │                  ├─► Auth (email+OAuth)
                │                  └─► Edge Functions (25)
                │                          │
                ├─► Stripe Checkout ◄──────┤ create-checkout / create-*-checkout
                │                          │
                └─► Resend / Beehiiv / GHL ◄ send-transactional-email,
                                            newsletter-subscribe, ghl-webhook
                ▲
Stripe ─ webhook ─► stripe-webhook ─► user_access_levels / one_time_orders / agent_orders
```

Entitlement source of truth: `user_access_levels.tier` (subscriptions) + `one_time_orders` / `agent_orders` / `autism_orders` / `book_orders` (one‑offs). Admin: `user_roles` table via `has_role` RPC.

---

## 4. Offer → Delivery Matrix (Phase 4) — UNVERIFIED CELLS FLAGGED

| Offer | Checkout fn | Webhook handling | Entitlement record | Confirmation email | Redirect | Admin visibility | Status |
|---|---|---|---|---|---|---|---|
| 30‑Day Reset (subscription) | create-checkout | stripe-webhook → user_access_levels=reset_30 | user_access_levels | program-welcome | /dashboard?welcome=program | AdminUsers | **UNVERIFIED end‑to‑end** |
| 90‑Day Transformation | create-checkout | → transformation_90 | user_access_levels | program-welcome | /dashboard | AdminUsers | **UNVERIFIED** |
| Cohort | create-checkout | → cohort | user_access_levels | program-welcome | /dashboard | AdminEnrollments | **UNVERIFIED — cohort code path noted in roadmap memory** |
| Premium | create-checkout | → premium | user_access_levels | program-welcome | /dashboard | AdminUsers | **UNVERIFIED** |
| Rent‑an‑Agent (Starter/Pro/Dream) | create-checkout | → rent_agent + agent_orders insert | agent_orders | agent-order-confirmation | /dashboard | AdminOrders | **UNVERIFIED — agent_orders schema present, write path needs replay test** |
| Strategy Intensive $497 (Advisory) | create-checkout (one_time) | → one_time_orders | one_time_orders | advisory-purchase-confirmation | /advisory/success | AdminOrders | **UNVERIFIED — template recently added, not load‑tested** |
| Build Studio packages | create-checkout (one_time) | → one_time_orders | one_time_orders | build-order-confirmation | /dashboard | AdminBuildOrders | **UNVERIFIED — intake forms flagged historically as missing on some packages** |
| Autism Social Stories | create-autism-checkout | (no webhook — verify-autism-order) | autism_orders | autism-order-confirmation | /order-success | AdminAutismOrders | **UNVERIFIED — relies on redirect verify, not webhook truth** |
| Book | create-book-checkout | verify-book-order | book_orders | book-order-confirmation | /order-success | AdminOrders | **UNVERIFIED — redirect‑based truth** |
| Business Audit | generate-business-audit + audit_tokens | n/a (free or one_time) | business_audits | audit-ready | /audit/report?token | AdminAudits | likely OK; token TTL needs check |
| Starter Kit | generate-starter-report | n/a | starter_kit_reports | starter-kit-ready | /starter-kit/result | AdminContent | likely OK |

**Top structural risks in this matrix:**
1. `create-autism-checkout` and `create-book-checkout` use **verify‑on‑redirect**, not webhook truth → a customer who closes the tab before redirect may pay without an order row. **Critical to verify.**
2. `create-checkout` (subscriptions) — must confirm `client_reference_id`/`metadata.supabase_user_id` is set on every path so the webhook can resolve the user. Historic gap noted in prior audits.
3. Tier rank in `src/lib/tier-constants.ts` ranks `corporate` (7) above `rent_agent` (6) — verify no transformation path silently downgrades a corporate user.
4. No `processed_stripe_events` dedupe check confirmed for one‑time/agent paths — need to verify webhook idempotency for those branches (table exists; usage path UNVERIFIED).

---

## 5. Assessment Completeness Matrix (Phase 5)

| Assessment | Route | Data source | Scoring | Result UI | Storage | Status |
|---|---|---|---|---|---|---|
| Clarity Session (single Q + AI) | /clarity | `clarity-insight` edge fn (Gemini) | AI‑generated, not numeric | /result | `clarity_sessions` | Working; **transformation logic = AI free‑text, not auditable** |
| Mirror Challenge | /mirror-challenge, /challenges/:type | local + `challenge_progress` | streak‑based | inline | `challenge_enrollments`,`challenge_progress` | Working; gated |
| Generic Assessment | /assessment | `src/pages/Assessment.tsx` | hard‑coded | /result | none guaranteed | **UNVERIFIED — confirm whether persisted** |
| Business Audit | /audit, /audit/intake, /audit/report | `generate-business-audit` | AI + structured | /audit/report | `business_audits` + `audit_tokens` | Working; token TTL/claim flow OK in RPC |
| Starter Kit | /starter-kit | `generate-starter-report` | AI structured | inline | `starter_kit_reports` | Working |
| Agent Builder (MAC) | /agent-builder → /agent-intake → /agent-result | `mac-elaborate`, `mac_assessments` | AI elaboration | /agent-result | `mac_assessments` + later `agent_orders` | **UNVERIFIED handoff to checkout** |
| Coach Chat | /coach | `coach-chat` | n/a (chat) | inline | none persisted | Working |

**Documented logic gap:** Clarity, Business Audit, Starter Kit, MAC are AI‑generated. There is **no deterministic scoring rubric file** for any of them — transformation/recommendation logic is the LLM prompt. This is allowable but must be explicitly stated to users and admins (Phase 7 safety).

---

## 6. Admin Access Report (Phase 3)

**Current model (good):**
- `has_role(_user_id, 'admin')` SECURITY DEFINER RPC reading `public.user_roles` (separate from profiles). ✔
- `useRoles` hook is the *only* admin signal client‑side; no email allowlist, no tier escalation. ✔ (recent fix)
- `ProtectedRoute requireAdmin` guards every `/admin/*` route. ✔
- `AccessGate` honors `isAdmin && !userView` to bypass tier checks. ✔
- "Admin View" toggle is session‑only (localStorage write removed). ✔
- CI script `scripts/check-role-invariants.ts` asserts no corporate admins. ✔

**Remaining gaps / unverifieds:**
- A1. **No admin audit log table.** Admin actions (view toggle, user edits, order edits) are not recorded.
- A2. **Edge functions trust caller JWT only.** `manage-users`, `update-autism-order`, `client-notify`, `send-transactional-email` need a server‑side `has_role` recheck on every privileged branch (UNVERIFIED for all).
- A3. **Owner free access to paid surfaces — backend enforcement UNVERIFIED.** `AccessGate` bypasses client‑side, but if any paid feature calls an edge function that re‑checks `user_access_levels.tier`, admin will be blocked. Need a `has_role OR tier>=X` server pattern.
- A4. **No "demo/test order" mechanism** that produces an entitlement without polluting `one_time_orders` revenue reports. Recommend an `is_test boolean default false` column + admin‑only insert path.
- A5. **Single human admin (kizzy.alaoui@gmail.com).** No break‑glass second admin documented.

### Admin Access Verification Matrix (excerpt)

| Function | Frontend guard | Backend guard | RLS | Test needed | Repair |
|---|---|---|---|---|---|
| /admin/* routes | ProtectedRoute requireAdmin | none (page renders, data calls protected) | per‑table policies | direct URL as non‑admin | OK |
| manage-users edge fn | n/a | **UNVERIFIED has_role check** | service_role inside fn | call without admin JWT | confirm + add if missing |
| View any user's assessment | AccessGate bypass | RLS on clarity_sessions/business_audits | **UNVERIFIED admin SELECT policy** | admin list other user rows | add admin SELECT policy if missing |
| Free access to paid program content | AccessGate adminBypass=true | depends on each module data fetch | varies | admin opens premium module | add `has_role` to gated queries |
| Newsletter draft/send | requireAdmin | draft fn has admin INSERT policy (recent) | OK | admin sends to self | OK |

---

## 7. Data & Security Report (Phase 11)

Confirmed‑good (recent fixes): role separation, JWT‑bypass removed in webhook/email fns, generic error responses, `app_settings` scoped to `booking.*` for anon, `one_time_orders` service_role insert/update, newsletter admin policies, Recharts/Supabase deps upgraded, security memory active.

**Open / UNVERIFIED:**
- S1. `analytics_events` — confirm no PII (assessment answers) is logged.
- S2. `email_send_log`, `suppressed_emails` — confirm admin‑only SELECT and no anon read.
- S3. `processed_stripe_events` — confirm INSERT happens before side‑effects in *every* webhook branch (idempotency).
- S4. `audit_tokens` — TTL + single‑use claim verified in RPC; confirm token entropy ≥128 bits at generation site.
- S5. `cohort_registrations` — verify users cannot enumerate other registrants.
- S6. Webhook signature verification — confirm `STRIPE_WEBHOOK_SECRET` checked before any DB write in `stripe-webhook`.
- S7. Storage buckets — none exist (per project info). If files are referenced from `business_audits` outputs, confirm they are returned inline (no signed URLs needed).

---

## 8. Top 5 Damage Risks

1. **Silent payment‑without‑delivery** on autism/book paths (redirect‑verified, not webhook‑verified). Customer impact + chargeback risk.
2. **Subscription webhook → wrong/no user** if `metadata.supabase_user_id` is unset on any `create-checkout` branch. Causes entitlement gap, support load.
3. **Admin can't actually preview a paid program** if a server‑side fetch enforces tier without `has_role` fallback. Blocks demoing/teaching.
4. **No idempotency on one‑time/agent webhook branches** — duplicate Stripe events could create duplicate orders/entitlements.
5. **AI‑only assessment logic without disclaimer/version pin** — reputational + scope‑of‑practice risk on Clarity/MAC/Business Audit results.

---

## 9. Prioritized Non‑Destructive Repair Backlog

### Phase 0 — Emergency verification (READ‑ONLY, no code)
- V1. Run live Stripe replay on each offer in sandbox; capture event → row created → entitlement → email sent. Document gaps.
- V2. Direct‑URL test of every `/admin/*` route as non‑admin; expect redirect.
- V3. Log inspection: `stripe-webhook`, `create-checkout`, `manage-users` last 30 days for unhandled errors.
- V4. Confirm `kizzy.alaoui@gmail.com` row exists in `user_roles` with role='admin'.

### Phase 1 — Admin durability (additive)
- R1. Add `admin_audit_log` table (admin_id, action, target, payload, created_at) + insert helper.
- R2. Add server `has_role` recheck inside `manage-users`, `update-autism-order`, `client-notify` privileged branches.
- R3. Add `is_test boolean default false` to `one_time_orders`, `agent_orders`, `autism_orders`, `book_orders`; exclude from revenue queries; allow admin‑only insert path for demos.
- R4. Add second break‑glass admin (decision: who).

### Phase 2 — Payment/Entitlement/Delivery hardening
- R5. Ensure `create-checkout` ALWAYS sets `metadata.supabase_user_id` + `client_reference_id`; reject if missing for authenticated paths.
- R6. Move autism + book confirmation truth from `verify-*-order` to a Stripe webhook branch; keep verify as a UX fallback.
- R7. Enforce `processed_stripe_events` insert‑first idempotency in EVERY webhook branch (subs, one‑time, agent, autism, book).
- R8. Add admin "Resend confirmation" + "Re-grant entitlement" actions in `AdminOrders` (writes to audit log).

### Phase 3 — Assessment restoration & documentation
- R9. Inventory every assessment with a status column in `AdminContent`; surface missing/hidden.
- R10. Write a `docs/ASSESSMENT_LOGIC.md` per assessment (inputs → prompt → output contract). Pin AI model versions there.
- R11. Add explicit "AI‑generated, not a diagnosis" footer on Clarity/Business Audit/MAC result pages (verify wording with voice bible).

### Phase 4 — Scoring/transformation validation
- R12. For each AI assessment add a JSON‑schema validator on edge fn output + fallback message; reject malformed.
- R13. Add boundary‑case unit tests (mocked LLM) for prompt/format stability.

### Phase 5 — Admin dashboard completeness
- R14. Add "Failed deliveries" tile pulling from `webhook_failures`, `email_send_log` failures, and orders with no entitlement within N minutes.
- R15. Add "Stripe ↔ DB reconciliation" button (last 7 days) on `AdminOrders`.

### Phase 6 — Security & data hardening
- R16. Audit RLS for `analytics_events`, `email_send_log`, `suppressed_emails`, `cohort_registrations`; add missing admin‑only SELECT.
- R17. Confirm webhook signature check ordering; add explicit deny on missing signature.

### Phase 7 — UX/SEO/analytics/compliance
- R18. Post‑purchase "What now?" page for every offer (replace any generic dashboard redirect).
- R19. Track `purchase_completed`, `entitlement_granted`, `assessment_completed` in `analytics_events` with no PII.
- R20. Cookie/consent banner review; confirm disclaimers on assessments + refund policy linked from every checkout CTA.

Each repair item lists: problem, root cause hypothesis (UNVERIFIED until Phase 0), proposed change, rollback (drop column / revert fn), test, and definition of done in the follow‑up implementation plan.

---

## 10. Final Answers

1. **Can a customer pay and reliably receive what they bought?** UNVERIFIED for autism + book (redirect‑verified) and for any subscription path missing `supabase_user_id`. Likely yes for advisory + agent + program after recent fixes, but no replay evidence on record.
2. **Can Coach Kay access every paid surface without paying?** Frontend yes (`AccessGate` bypass). Backend UNVERIFIED — depends on whether gated queries call edge functions that recheck tier without `has_role` fallback.
3. **Is admin protected at backend?** Partially: route‑level via RPC; per‑function recheck UNVERIFIED on at least 3 edge fns.
4. **All assessments present?** Active set matches catalog; AdminContent does not yet surface hidden/orphan state.
5. **Scoring logic documented & testable?** No — AI prompts are the logic; no `ASSESSMENT_LOGIC.md` exists.
6. **Transformation logic reproducible?** Not deterministically (LLM). Reproducibility requires model+prompt pin + JSON schema validation.
7. **Can users see others' assessments?** Not via standard RLS pattern; needs explicit verification per table (see S‑items).
8. **Can users self‑grant paid access?** No (recent RLS hardening + role separation). Verified at policy level.
9. **Are webhooks the source of truth?** For subscriptions yes; for autism + book NO (redirect‑verified). Critical fix item.
10. **Does admin see all failures needing attention?** No — `webhook_failures` and `email_send_log` failures are not surfaced on `/admin`.
11. **Top 5 damage risks:** see §8.
12. **Safest first repair:** R7 — enforce `processed_stripe_events` idempotency on every webhook branch. It is additive, reversible, and protects against double‑grants without changing any user‑visible behavior.

---

## 11. Launch Recommendation

**Remain live with current free flows and one‑time digital products. Pause active paid marketing of subscription tiers and physical/book + autism story funnels** until Phase 0 verification (V1–V4) and Phase 2 items R5–R7 are complete. Admin testing remains fully unblocked.

---

## Decisions needed before implementation

- Approve Phase 0 verification scope (will require live Stripe sandbox events + log access).
- Confirm a second break‑glass admin email.
- Confirm we treat AI outputs as the documented "transformation logic" (vs. building deterministic scoring).
- Approve adding `is_test` columns to order tables for owner‑mode demos.

On approval I will execute Phase 0 verification, then return with a Phase 1 implementation patch set (smallest reversible diffs, per repair item).
