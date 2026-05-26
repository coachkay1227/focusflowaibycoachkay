# Rebuild `/assessment` as an Operator × Bottleneck Map

Scope: **only** `src/pages/Assessment.tsx` and its edge function `supabase/functions/mac-elaborate/index.ts`. Nothing else touched. No nav, no routes, no shared components beyond what the page already imports.

## The new model

**6 questions, zero repetition.** Each question is a real business scenario with 4 forced-choice answers. No question repeats its options.

### Axis 1 — Operator Type (3 questions, one per M/A/C)
Reveals **how you operate**. Single-shot per dimension — no voting, no padding.

- **Mind scenario:** "You have 90 minutes before a client call you haven't prepped. What do you actually do?" → 4 options each map to one of A/V/S/E.
- **Action scenario:** "A launch you've been planning for 6 weeks just had its hero asset fall through 48 hours out. Your move?" → maps to B/M/R/C.
- **Character scenario:** "Your most loyal client just told you they're going with a cheaper competitor. The first thing that happens in you is…" → maps to N/T/G/P.

Each option is written as a *behavior*, not a label. The archetype is inferred — the user never picks "I'm an Analyst."

### Axis 2 — Current Bottleneck (3 questions, F.O.C.U.S.-aligned)
Reveals **where you're stuck right now**. The 4 buckets map directly to your brand pillars:

| Bucket | F.O.C.U.S. pillar | Plain English |
|---|---|---|
| **CLARITY** | C | I don't know what to build / sell / say next |
| **FOCUS** | F | I know what to do, I can't get it done |
| **UPLEVEL** | U | The work is good — no one is seeing it |
| **OWNERSHIP** | O | Money, systems, and time are leaking |

Three questions each surface one bottleneck signal:
1. "When you sit down to work this week, the friction shows up as…" (4 options, one per bucket)
2. "If a $10K month landed tomorrow, the part that would break first is…" (4 options, one per bucket)
3. "The thing you keep avoiding in your business is…" (4 options, one per bucket)

Scoring: tally bucket votes. Highest = primary bottleneck, second-highest = secondary.

### The Output (the "I never thought of that" moment)

A single result screen with three layers:

1. **The combo line** (top, large, gold): *"You're an Empath-Connector stuck at UPLEVEL."*
2. **The named pattern** (the insight) — AI-generated via `mac-elaborate` using the new prompt:
   > "Empath-Connectors at Uplevel almost always have the best relationships and the smallest reach. You're building real intimacy with the wrong-size audience. The fix isn't more content — it's borrowing trust from rooms you're already invited into."
   Two sentences max. Names a pattern they didn't articulate themselves.
3. **The decisive next move** — ONE recommended Coach Kay path (chosen by a deterministic combo→path map), with 2 alternates shown smaller below it.

Default routing map (combo → primary path):
- Stuck at **CLARITY** → **Clarity Check** (free) → upsell to **Reset 30**
- Stuck at **FOCUS** → **Reset 30** (cohort)
- Stuck at **UPLEVEL** → **Uplevel 60** (1:1 life coaching)
- Stuck at **OWNERSHIP** → **Rent-an-Agent** + **Advisory**

The 2 alternates are always shown so the user feels routed, not boxed in.

## Implementation steps

1. **Rewrite `Assessment.tsx` question model**
   - Replace `buildQuestions()` with a hand-authored 6-question array. Each question carries its own `options` (no shared `MIND_OPTIONS` arrays).
   - Add a `Bucket = "C" | "F" | "U" | "O"` type alongside the existing `Dimension`.
   - Each option carries either `{ archetype: "V" }` (operator questions) or `{ bucket: "U" }` (bottleneck questions).
2. **Rewrite scoring**
   - `tallies()` returns `{ archetypes: {M, A, C}, buckets: {C, F, U, O} }`. Same `topCode` helper, two passes.
   - `result` becomes `{ mind, action, character, primaryBucket, secondaryBucket, code, primaryPath, alternatePaths[] }`.
   - Add a small `combo_to_path.ts` map (kept inline in the page — not a new file in `lib/` to honor scope) for the routing table above.
3. **Update `mac-elaborate` edge function prompt**
   - Pass `primaryBucket` + `secondaryBucket` into the body.
   - Update the system prompt so Gemini returns two new fields: `pattern_line` (the "named pattern" sentence) and `combo_reason` (one sentence connecting the operator type to the bottleneck). Keep existing fields for backward compatibility — never break shape.
4. **Update result UI**
   - Combo line (large gold) → AI pattern line (cream, two sentences) → one big "Next move" card → two small alternate cards.
   - Remove the existing strength/growth-edge block (it's the personality-card pattern we're moving away from); reuse the cards/animation classes already in the file. No new components.
5. **Progress UI**
   - 6 steps instead of 12. Update the "MIN LEFT" estimate (≈25 sec/question stays correct → ~3 min instead of ~5).
   - Section labels become `OPERATOR · 01/03`, `OPERATOR · 02/03`, `OPERATOR · 03/03`, then `BOTTLENECK · 01/03`, etc.
6. **Keep untouched**
   - Email gate, `mac-elaborate` invocation flow, admin preview shortcut, SEO head, analytics event firing, ReportView import (it'll just receive the new insight shape; the existing fields stay populated for safety).

## What I'm intentionally NOT changing (per "stay within scope")

- No nav, no routes, no homepage, no other pages.
- No `ReportView`, `PillarStrip`, `PillarBadge`, `ApplyNowDialog` internals — only how Assessment passes data into them.
- No DB schema changes. The new fields ride inside `mac_assessments.ai_insight` (jsonb) — no migration needed.
- No copy changes anywhere else on the site referring to "12 questions" — I will grep, but if found they'd be the only other surface and I'll flag rather than silently edit.

## Open question (one)

The decisive single recommendation: I'm defaulting to **one primary + two alternates** because that's the more decisive UX and you can still see options. If you'd rather have **only one** recommendation (fully decisive, no alternates), say so before I build and I'll drop the alternates row.
