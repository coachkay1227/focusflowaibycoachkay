## End-to-End Audit: "Find Your Path in 5 Minutes"

I walked all three paths as both a user and a developer, traced every question, every AI call, every result screen, and every conversion hand-off. Here's what I found and how to 100× this section.

---

### Path 1 — F.O.C.U.S. Clarity Check  (`/clarity`)
**Flow:** 6 questions (3 multiple-choice + 3 free-text) → email gate (anon) → `/result` → AI insight (`clarity-insight`) + track recommendation.

| Aspect | Finding |
|---|---|
| Time-to-complete | ~3–4 min ✓ honors the "5 min" promise |
| Question quality | Strong. Emotional state → challenge area → tried/blocking/desired feeling. The 3 free-text fields personalize the AI well. |
| **Anti-hallucination** | AI call uses structured tool-call JSON schema (`truth/pattern/action`). Static fallback in `clarity-engine.ts` if AI fails. ✓ |
| **Bug A (silent)** | `clarity-insight` requires a real user JWT (returns 401 for anon). **Every anonymous user silently falls back to the static template** — the AI report is only ever generated for logged-in users. Conflicts with the memory note that `clarity-insight` is the unauth exception. |
| **Bug B (broken promise)** | Email gate says *"I'll send you a copy you can come back to."* But the result email (`client-notify → clarity_complete`) only fires when `authSession.user.email` exists. Guests who hand over their email **never receive the report**. |

---

### Path 2 — Business Clarity Assessment  (`/assessment`)
**Flow:** 18 forced-choice questions (6 Mind · 6 Action · 6 Character) → 3-letter M.A.C. code → email gate (anon) → AI elaboration (`mac-elaborate`) → "30-Day Business Reset" application CTA.

| Aspect | Finding |
|---|---|
| Time-to-complete | ~6–8 min ⚠️ **violates the "5 min" promise**. The headline above the cards is the most-tested copy on the page; this single mismatch erodes trust. |
| Question quality | Well-mapped to dimensions; the per-pillar prompt variety is good. But 6 per pillar is over-sampling — the dominant archetype usually emerges by Q3. |
| **Anti-hallucination** | Good. Tool schema enforces 6 fields; M.A.C. code regex-validated server-side; AI can't invent a code. |
| Fallback | If AI fails, the page shows static `MIND_DESC/ACTION_DESC/CHAR_DESC` cards. ✓ |
| Conversion | Strong: result → application dialog for the 30-Day Business Reset. ✓ |

---

### Path 3 — AI Transformation Starter Kit  (`/starter-kit`)
**Flow (intended):** 4-field form (name/email/business type/bottleneck) → `generate-starter-report` → 3-section AI Quick Start Report → upsell to $47 AI Business Audit.

| Aspect | Finding |
|---|---|
| **Bug C (critical, kills the path)** | The homepage card links to `/programs/kpi-roi-tracker` — a *program detail page*, **not** the starter kit form. Users clicking "Download Free" land on a program page instead of the free AI report. This is almost certainly the biggest single conversion leak in the section. |
| Time-to-complete | ~2 min ✓ |
| Question quality | Tight. Business type + single bottleneck is enough signal for the AI. |
| **Anti-hallucination** | Tool-call schema enforces 3 sections. Prompt is grounded in F.O.C.U.S. framework. No static fallback — if AI fails, user sees a toast only. |
| Conversion | Strong upsell to AI Business Audit. ✓ |

---

### Cross-cutting findings
1. **"5 minutes" headline is mostly aspirational.** Path 2 takes 6–8. We either trim Path 2 or change the headline to *"Find Your Path in Minutes."*
2. **No `path_card_clicked` analytics event.** We track completions but not card-level clicks → can't compute funnel drop-off per path.
3. **No length constraints in AI tool schemas.** Prompts ask for "2–3 sentences" but nothing enforces it server-side. Adds variance and occasional rambling outputs.
4. **No "AI may be wrong" disclaimer on the reports.** Low-cost trust signal.
5. **Mobile**: cards stack cleanly but the headline `text-5xl` + "01 · CLARITY" mono labels feel light at 375px — minor.

---

### The Launch Plan

#### Phase 1 — Fix conversion-killing bugs (ship today)
1. **Fix Path 3 link** in `src/pages/Index.tsx` line 359: `/programs/kpi-roi-tracker` → `/starter-kit`. Update card desc to match the actual deliverable ("Answer 4 questions. Get your AI Quick Start Report in 30 seconds.").
2. **Fix Path 1 anon AI**: remove the `auth.getUser` hard-fail in `clarity-insight`. Resolve `userId` opportunistically (like `mac-elaborate` already does). Keep rate-limiting by IP. Update the security memory.
3. **Fix Path 1 guest email**: pass `guestEmail` to `client-notify` (or a dedicated `clarity-complete-guest` path) so anonymous completers actually receive their Clarity Code. Match the gate's promise.

#### Phase 2 — Honor the 5-minute promise (ship this week)
4. **Trim Assessment to 12 questions** (4 per pillar × M/A/C). Keep the strongest prompts in each set. Re-test that the dominant code is unchanged for representative answer sets.
5. **Add a real-time timer + question counter** on each path ("Question 3 of 6 · ~2 min left") — explicit time-remaining is the single highest-impact completion-rate lever for quizzes.

#### Phase 3 — Harden the AI (ship this week)
6. **Enforce length in tool schemas**: add `maxLength: 280` per field for short sections, `maxLength: 600` for elaborations. Eliminates rambling and forces the model to be specific.
7. **Add per-field grounding rules** to system prompts: *"Quote at least one phrase from the user's answers in the Truth/Pattern/Action. If the user gave thin answers, name that honestly instead of inventing detail."*
8. **Add a static fallback to `generate-starter-report` and `mac-elaborate`** mirroring the `clarity-engine` pattern, so an AI outage never blanks the result screen.
9. **Add a small "AI-generated · review with discernment" badge** on every report header.

#### Phase 4 — Measure & iterate (ship alongside Phase 1)
10. **Add `path_card_clicked` analytics** with the path id, plus `path_started` (first question shown) and `path_abandoned` (user navigated away mid-flow). With `*_completed` already firing, we'll have a full funnel per path within 48h of launch.
11. **Wire the three completion events into a single dashboard view** so we can see start → complete → CTA-click rate per path.

#### Phase 5 — Polish copy & visual hierarchy (ship this week)
12. Update the three card copy lines to set time expectations explicitly:
    - "F.O.C.U.S. Clarity Check — 6 questions · ~3 min"
    - "Business Clarity Assessment — 12 questions · ~5 min" (after Phase 2 trim)
    - "AI Starter Kit — 4 questions · ~2 min"
13. Add a one-line subhead under the H2: *"Three free tools. Pick the one that meets you where you are."*
14. Make the primary card (Clarity Check) visually heavier with a gold halo glow already used elsewhere on the page.

---

### Technical Notes
- All three edge functions use `generateReport` (Lovable AI Gateway, structured tool-call) — pattern is solid, just needs the length & grounding tightening above.
- `clarity-insight` currently has `verify_jwt = false` in `config.toml` but enforces auth in code — this contradiction is the source of Bug A. The fix is in the function body, not the config.
- Static fallbacks live in `src/lib/clarity-engine.ts` (Path 1) and `src/pages/Assessment.tsx` (Path 2 MIND/ACTION/CHAR_DESC). Path 3 needs a parallel set under `src/lib/starter-kit-fallback.ts`.
- No database schema changes required for any phase.

---

### Recommended Order to Implement
Approve this plan and I'll start with **Phase 1 (Bugs A, B, C)** — these are pure code fixes, each ~10 lines, and unblock the section's conversion immediately. Then Phase 4 analytics (1 hour) so we can measure the impact of Phases 2/3/5 as they ship.