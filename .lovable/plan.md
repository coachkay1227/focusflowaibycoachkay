# Truth page accuracy pass + tool picks update

Two tracks in this plan. Track A is small and surgical. Track B is a content review with a new fact-grounded section. Both touch only `src/pages/TruthAboutAI.tsx` and `src/data/tool-picks.ts`.

---

## Track A — Tool picks update

File: `src/data/tool-picks.ts` only.

### Changes

1. **Remove** Stripe (not an AI tool — it's payment infra; doesn't belong in a "tool picks" list on the Truth page).
2. **Replace** Descript → **Manus** (general AI agent for research, writing, browser tasks).
3. **Add** **Genspark** (multi-agent search + AI sheets / slides).
4. **Add** **Gemini** (Google's reasoning model — long context, multimodal).
5. **Reorder** to match your spec, with the build tool kept at the front and community at the back so categories still flow:

   1. **Lovable** — Build
   2. **Claude** — AI
   3. **Manus** — AI
   4. **Genspark** — AI
   5. **Notion** — Productivity
   6. **ChatGPT** — AI
   7. **Gemini** — AI
   8. **ElevenLabs** — AI
   9. **Skool** — Community

   9 items don't divide evenly into the current `lg:grid-cols-4`. I'll switch the tool-picks grid (line 488) to `lg:grid-cols-3` so it renders as a clean 3×3 grid on desktop with no orphan row. Mobile/tablet stay at 1/2 columns.

### New copy for each new card (concrete, honest, in your voice)

- **Manus** — "General-purpose AI agent for deep research and multi-step browser work. When I need a task *done* — not just an answer — Manus is the one I trust."
- **Genspark** — "Multi-agent search plus AI sheets and slides. Where I go when the question needs ten sources cross-checked before I answer a client."
- **Gemini** — "Google's long-context model. Best when I'm feeding it an entire document, transcript, or codebase and asking it to reason across the whole thing."

Affiliate flags: all three new tools start as `affiliate: false` — flip them later if and when you sign up for the programs.

---

## Track B — Truth page accuracy + environmental section

### B1. Accuracy pass on existing copy

Quick line-level audit of the existing sections (`MYTHS`, `STRENGTHS`, `WEAKNESSES`, `FEARS`, `RED_FLAGS`, `SKILLS`, `TRUST_PILLARS`). Findings I'd act on:

- One TRUST_PILLAR ("No screenshot flexing") references "my Stripe dashboard." Since Stripe is being pulled from the tool picks, the line still reads fine — Stripe is just an example of a screenshot people brag with. **Keep as-is**, no contradiction.
- `MYTHS`, `WEAKNESSES`, `FEARS` content is all evergreen and accurate. No edits.
- `STRENGTHS` is accurate but slightly underplays code/agent capability — minor copy polish only ("Coding assistance" → "Coding assistance and agent-based task automation"). Optional.

No structural changes to existing sections. The Pause hub isn't touched (it lives at `/pause-hub` and has separate content).

### B2. New section: "The environmental question — what's actually true"

Slot it between the existing "What people are getting wrong about AI" (MYTHS, line 290) and "What AI is actually good at" (STRENGTHS, line 311). This positions it as part of the myth-busting register, where it belongs.

Goal: separate **scaremongering myth** from **legitimate local concern**, with cited numbers. Same card style as MYTHS so visual rhythm stays consistent.

#### Content (every number cited inline; sources linked in footnotes)

**Eyebrow:** "The environmental question"
**Title:** "Yes, AI uses energy and water. Here's what's actually true — and what's not."

**Intro paragraph:** "You've seen the headlines. 'Every ChatGPT query drinks a bottle of water.' 'AI is boiling the planet.' Some of that is real. Most of it is wildly out of context. Here's the honest math."

**Six fact cards** (same layout grid as MYTHS — `md:grid-cols-2 lg:grid-cols-3`), each tagged `Myth` / `Nuanced` / `True`:

| Tag | Claim | Honest answer |
|---|---|---|
| **Myth** | "Every ChatGPT query uses a 500ml bottle of water." | The viral figure comes from a 2023 paper that aggregated **training + on-site cooling + power-plant water** per *session*, not per query. Per-query on-site water is closer to **~5 ml** — about a teaspoon. Less than a single Google image search and a rounding error next to one almond (3 L). [Goedecke 2024; Ritchie 2025] |
| **True** | "Global data-centre electricity use is rising fast." | Yes. The IEA's 2025 report puts data-centre demand at ~1.5% of global electricity today, projected to ~3% by 2030. **Tracking firms count ~4,500 new data-centre projects** in the pipeline before 2029. AI is the main accelerant — but only ~10–20% of total data-centre load right now. [IEA 2025; IIR 2026] |
| **Nuanced** | "AI is destroying the climate." | Individual chatbot use is climate-negligible — your daily ChatGPT use is dwarfed by one beef burger, one short drive, one transatlantic flight. **Training** large frontier models is genuinely energy-intensive (one GPT-class run ≈ thousands of homes-years). The honest concern is grid pressure and source mix, not your prompts. |
| **True** | "Some local communities are getting hit hard." | Real and underreported. Data-centre clusters in **Northern Virginia, Arizona, and parts of Ireland** are straining local water tables and grid capacity. This is a **siting and policy problem**, not an "AI is evil" problem. Pressure your utility commissioner, not your chatbot. |
| **Myth** | "If I stop using AI, I'll save the planet." | You won't. A year of moderate ChatGPT use ≈ the carbon footprint of a single 1-hour drive. Skipping AI to save the planet is like skipping toast to fund a mortgage. Direct your effort at flying, driving, heating, and meat — that's where the leverage is. [Ritchie 2025; Masley 2025] |
| **Nuanced** | "The tech companies are going green." | Hyperscalers (Google, Microsoft, Amazon) are **the largest corporate buyers of renewable energy on earth**, and they're funding new nuclear (Three Mile Island restart, SMRs). Also true: their **absolute emissions are rising** because demand is outpacing renewable build-out. Both things at once. |

**Closing line under the grid:**
"Use AI when it helps you. Vote and pressure your utility on where the power comes from. Those are different problems — and pretending they're the same is its own kind of dishonesty."

**Footnotes block** (small, muted, below the cards) with 4 inline-numbered citations:
1. IEA — *Energy and AI* / 2025 data-centre update
2. Hannah Ritchie — "How much electricity does AI consume? [2025]"
3. Sean Goedecke — "Talking to ChatGPT costs 5ml of water, not 500ml"
4. Industrial Info Resources — 4,500 data-centre projects in pipeline (2026)

Sources will render as anchor links opening in a new tab. No claim on the page that I can't link back to a primary or near-primary source.

### B3. Update FAQ JSON-LD

The existing `FAQ_LD` schema (line 176) only includes the `FEARS` array. I'll **append the six new environmental cards as additional FAQ entries** so Google sees the page answering "does ChatGPT use a lot of water" / "is AI bad for the environment" — meaningful long-tail SEO win on this exact wave of search intent.

---

## Implementation files (build mode)

- `src/data/tool-picks.ts` — replace `TOOL_PICKS` array per Track A.
- `src/pages/TruthAboutAI.tsx`:
  - Tool picks grid (line 488): `lg:grid-cols-4` → `lg:grid-cols-3`.
  - New `ENVIRONMENT` constant + new `<Section>` block between MYTHS and STRENGTHS.
  - Extend `FAQ_LD.mainEntity` to include environmental entries.
  - Add 4 footnote anchors under the new section.

## What I will NOT touch

- Pause Hub (`/pause-hub`) — separate page, separate purpose.
- Hero, opener, MYTHS copy, FEARS copy, RED_FLAGS, SKILLS, TRUST_PILLARS, the F.O.C.U.S. bridge, the three paths section, or the closing CTA.

## Open questions

1. **Genspark / Manus / Gemini affiliate flags** — all start as `false`. Want me to mark any of them `true` now if you already have a referral set up?
2. **Manus URL** — `https://manus.im` is the official site. Genspark is `https://www.genspark.ai`. Gemini is `https://gemini.google.com`. Approve or correct.
3. **Environmental section tone** — I drafted it sharp and a little contrarian ("skipping AI to save the planet is like skipping toast to fund a mortgage"). Soften that line, keep it, or push harder?
