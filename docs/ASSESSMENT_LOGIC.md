# Assessment Logic Reference

_Last updated: see git blame._

Source of truth for how each assessment in FocusFlow computes a result.
If you change scoring code, update this file in the same commit.

---

## 1. Clarity Session (`/clarity` → `/result`)

- **Input:** One open-ended user reflection plus optional follow-up prompts
  collected by `src/lib/clarity-engine.ts`.
- **Processing:** Sent to Lovable AI Gateway (Gemini 3 Flash Preview) with
  the canonical voice prompt from `supabase/functions/_shared/coach-voice.ts`.
- **Output:** `TrackResult` — track label, summary, 3 recommended programs.
- **Determinism:** Copy is not deterministic; track assignment via
  `resolveTrack` IS deterministic, so recommended programs are stable.
- **Storage:** `clarity_sessions`, scoped by `user_id` or anonymous
  localStorage for guests.
- **Disclaimer:** Reflective, not clinical. `<AIDisclaimer />`.

## 2. Business Audit (`/audit/intake` → `/audit/report/:token`)

- **Input:** Multi-section intake form (`AuditIntake.tsx`).
- **Processing:** Edge function `generate-audit-report` composes intake +
  voice prompt; model returns 8 structured sections (state of business,
  hidden leaks, quick wins, 30-day plan, 90-day plan, score, pathway recs,
  all-pathways note).
- **Storage:** JSON on `business_audits.report`.
- **Determinism:** Section structure enforced via schema; copy is not
  deterministic.
- **Access:** Magic-link token (`audit_tokens`, 90-day expiry) for guest
  buyers; bound to `user_id` once buyer signs in via `claim_audit_token`.
- **Disclaimer:** Informational, not financial / legal advice.

## 3. MAC Assessment (`mac_assessments`)

- **Status:** Schema present; submission UI not yet exposed in the active
  navigation. Treat as **draft** — do not market until result page ships
  and this section is updated with the scoring rubric.

## 4. Agent Recommendation (`/agent-builder` → `/agent-result`)

- **Input:** Use-case selection + optional knowledge-base sizing.
- **Processing:** Pure rule-based (`src/lib/agent-recommendation.ts`). No
  AI in the recommendation path — price calculation and path labelling only.
- **Determinism:** Fully deterministic.
- **Disclaimer:** Pricing-disclosure variant.

---

## Adding a new assessment

1. Define inputs and scoring in `src/lib/<name>-engine.ts`.
2. If AI-assisted, put the model call in an edge function using
   `composeSystemPrompt()` from `_shared/coach-voice.ts`.
3. Persist results under a dedicated table with RLS scoped to `user_id`.
4. Add an entry here: inputs, processing, output shape, determinism,
   storage, disclaimer variant.
5. Render `<AIDisclaimer />` (or the `clinical` variant) on the result page.