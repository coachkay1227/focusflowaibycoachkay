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

## 3. Business Clarity Assessment (`/assessment`)

- **Product name:** Operator × Bottleneck Map. It is live in the public
  navigation; this is not a draft or hidden schema.
- **Input:** Six forced-choice questions. Three select one Mind, Action, and
  Character code; three select one of Clarity, Focus, Uplevel, or Ownership.
- **Processing:** `computeBusinessAssessment()` in
  `src/lib/business-assessment.ts`. The rule engine rejects missing or invalid
  answer values instead of fabricating a result.
- **Output:** A three-letter operator code, primary and secondary bottlenecks,
  one primary path, and two alternate paths.
- **Tie rule:** Bottlenecks are ranked by count. A tie resolves explicitly in
  F.O.C.U.S. order: Clarity, Focus, Uplevel, Ownership.
- **Path map:** Clarity → Free Clarity Check; Focus → 30-Day Business Reset;
  Uplevel → Advisory; Ownership → Rent-an-Agent.
- **AI elaboration:** The deterministic result is optionally expanded by the
  `mac-elaborate` edge function. AI changes the explanatory copy, never the
  code, bottleneck, or destination.
- **Coverage:** Unit tests enumerate all 4,096 valid answer combinations.

## 4. Agent Recommendation (`/agent-builder` → `/agent-result`)

- **Input:** Use-case, agent count, real-time requirements, available business
  documents, and ownership preference.
- **Processing:** Pure rule-based (`src/lib/agent-router.ts`). Real-time or
  phone work routes to GHL; strategic async work routes to Claude; other async
  work routes to GPT.
- **Determinism:** Fully deterministic.
- **Commercial rule:** Every build is scoped after intake and before payment.
  The result shows the same public starting bands as `/agents/builds`; it does
  not invent an exact browser-calculated price or call a paid dashboard free.
- **Foundation:** Every build includes the required $197 AI Brain. Existing
  documents strengthen that foundation; they are not presented as a surprise
  optional add-on.
- **Coverage:** Unit tests cover all 36 path × scale × ownership × document
  combinations plus route-precedence rules.
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
