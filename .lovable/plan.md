## Phase 3.2.5 — Audit Routing for Full Catalog

Scope: update the AI Business Audit's smart routing engine to know the complete Coach Kay Elevates catalog. Three files only. No infra, no new routes, no schema changes.

**Files touched**
- `supabase/functions/generate-business-audit/index.ts`
- `src/pages/AuditReport.tsx`
- `src/pages/Dashboard.tsx`

**Files explicitly NOT touched**
AuthContext, useSubscription, useAccessLevel, create-checkout, create-book-checkout, stripe-webhook, clarity-insight, coach-chat, pattern-detect, ApplyNowDialog, IntakeFormModal, OrderSuccess, ReportView, Assessment.tsx, StarterKit.tsx, AuditIntake.tsx, AuditLanding.tsx, any program data.

**Terminology guard (carried into the new prompt)**
- FocusFlow AI = the paid platform (this codebase).
- Focus Flow Elevation Hub = free Skool community.
- Forward Focus Elevation = nonprofit lane, fiscally sponsored by COED Columbus (a 501c3). Forward Focus Elevation itself is NOT a 501c3.

---

### Step 1 — Replace `OFFER_SLUGS` enum in `generate-business-audit/index.ts`

Remove the 10 legacy slugs (`focusflow_30`, `focusflow_90`, `focusflow_6mo`, `rent_agent_starter`, `rent_agent_pro`, `advisory`, `build_studio_*`, `focus_flow_elevation_hub`) and replace with the full 28-slug catalog grouped by lane:

- Transformation (Door 1): `transform_30_personal`, `transform_30_business`, `transform_30_ai`, `transform_90_personal`, `transform_90_business`, `transform_90_ai`, `transform_6mo_partnership`
- Build For Me (Door 2): `rent_agent_starter`, `rent_agent_pro`, `rent_agent_dreamteam`, `rent_agent_enterprise`, `lead_engine_essentials`, `lead_engine_pro`, `lead_engine_growth`, `lead_engine_scale`, `lead_engine_enterprise`
- Advisory (Door 3): `advisory_strategy_intensive`, `advisory_executive`, `advisory_speaking`, `advisory_corporate`, `advisory_university`, `group_programs`
- Studio (Door 4): `studio_mini_story`, `studio_storybook_pro`, `studio_other`
- Build Studio (Phase 3.5, coming soon): `build_studio_landing`, `build_studio_site`, `build_studio_dashboard`
- Community / free: `focus_flow_elevation_hub`

Used as the `enum` for `next_best_move.offer_slug` in `TOOL_SCHEMA`.

Checkpoint: legacy `focusflow_*` slugs gone, full 28-slug list present. ✅ / ❌.

---

### Step 2 — Rewrite SYSTEM_PROMPT for full-catalog routing

Replace the inline PAID OFFERS list inside `SYSTEM_PROMPT` with the four-door catalog above (lane → slug → price → one-line "best for" each). Keep all existing brand/terminology guards verbatim (FocusFlow AI vs Focus Flow Elevation Hub vs Forward Focus Elevation; F.O.C.U.S. = Foundation/Opportunity/Create/Uplift/Support; "Where Focus Goes, Energy Flows").

Add explicit routing heuristics keyed on intake fields:
- `budget_appetite` (under $500 / $500–2K / $2K–5K / $5K+) gates lane.
- `preferred_path` ("teach me" → Transformation; "build it for me" → Build For Me; "train my team / B2B" → Advisory; "tell my story" → Studio).
- `biggest_bottleneck` + `whats_broken` narrow within lane (e.g. "no leads" → Lead Engine tier matched to budget; "ops chaos" → Rent-an-Agent tier; "no clarity / brand" → Transformation 30-day; "scaling team" → 90-day or 6-Month Partnership).
- `stage` + `monthly_revenue` decide tier (idea/pre-rev → 30-day or community; $1–5K/mo → 30 AI / Rent Starter; $5–25K/mo → 90-day / Rent Pro / Lead Pro; $25K+/mo → 6-Month Partnership / Lead Growth+ / Advisory).
- `industry` + mission/justice/reentry/nonprofit signals OR explicit low budget with strong mission alignment → `focus_flow_elevation_hub` (framed as free community pathway through Forward Focus Elevation, NOT as a paid offer, NOT as a 501c3).
- Corporate / EAP / workforce / team training signals → `advisory_corporate` or `advisory_executive`; speaking/keynote signals → `advisory_speaking`; university/curriculum → `advisory_university`.
- Book / storytelling / authority-building signals → Studio lane, tier by budget.
- Build Studio tiers stay routable but must be flagged "Opening soon — Phase 3.5" inside `why_this_one` when chosen.

Hero callout: `transform_30_ai` ($997) is the flagship — prefer it when the operator has any AI gap AND budget ≥ $500 AND no stronger lane signal.

Pick exactly ONE `next_best_move`. Keep `all_pathways_note` honest (mention 1–2 adjacent doors so the reader sees the full ecosystem).

Checkpoint: prompt mentions every slug at least once, terminology guards intact, no 501c3 misclaim. ✅ / ❌.

---

### Step 3 — Update `ctaRoute()` in `src/pages/AuditReport.tsx`

Extend the switch so every new slug routes to a real surface that exists today:

- `transform_30_personal`, `transform_30_business`, `transform_30_ai`, `transform_90_personal`, `transform_90_business`, `transform_90_ai`, `transform_6mo_partnership` → `/store` (transformation lane lives in the store; specific program pages can be wired in a later phase).
- `rent_agent_*`, `lead_engine_*` → `/rent-an-agent`.
- `advisory_strategy_intensive`, `advisory_executive`, `advisory_speaking`, `advisory_corporate`, `advisory_university`, `group_programs` → `/advisory`.
- `studio_mini_story`, `studio_storybook_pro`, `studio_other` → `/store` (Studio category).
- `build_studio_landing|site|dashboard` → unchanged (`opening_soon: true`, "Opening soon — get notified" — Phase 3.5).
- `focus_flow_elevation_hub` → unchanged (external Skool URL).
- `default` → `/store`.

No UI/copy changes elsewhere in `AuditReport.tsx`.

Checkpoint: every Step 1 slug has an explicit `case`. ✅ / ❌.

---

### Step 4 — Update `AUDIT_OFFER_NAMES` in `src/pages/Dashboard.tsx`

Replace the legacy 9-entry map with the full 28-entry display-name map matching Step 1 slugs (e.g. `transform_30_ai: "30-Day AI Reset"`, `rent_agent_dreamteam: "Rent-an-Agent Dream Team"`, `lead_engine_essentials: "Lead Engine Essentials"`, `advisory_strategy_intensive: "AI Strategy Intensive"`, `studio_mini_story: "Mini-Story Starter"`, etc.). `focus_flow_elevation_hub: "Focus Flow Elevation Hub"`.

Dashboard's existing `AUDIT_OFFER_NAMES[a.recommended_offer] ?? "—"` lookup stays unchanged; only the map content grows.

Checkpoint: every Step 1 slug has a friendly name. ✅ / ❌.

---

### Step 5 — Verification & report

- Re-grep for legacy `focusflow_30|focusflow_90|focusflow_6mo` across the three files → expect 0 hits.
- Re-grep for each new slug across the three files → expect ≥ 1 hit in `generate-business-audit/index.ts` (enum + prompt) AND ≥ 1 hit in `AuditReport.tsx` (route) AND ≥ 1 hit in `Dashboard.tsx` (name).
- Deploy `generate-business-audit` edge function.
- Optional smoke call via `curl_edge_functions` with a synthetic intake hitting each lane (Transformation / Build For Me / Advisory / Studio / Community) — confirm returned `next_best_move.offer_slug` is in the new enum.

Final deliverable: one consolidated markdown report with before/after diffs for each of the three files and the 5 checkpoint results.

---

### Sequencing rule
Steps run in order 1 → 2 → 3 → 4 → 5. Any ❌ stops the chain.
