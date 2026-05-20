## Reset

Pausing the 14-SKU repackaging build. Focus = conversion audit of the live homepage + apply your 5 fixes. No code changes until you approve below.

---

## Part 1 — System trace (what's actually happening today)

### Current hero — `src/pages/Index.tsx` lines 193–297

| Layer | What's shipped | Disconnect |
|---|---|---|
| Eyebrow | "Clarity Code by Coach Kay" | Brand label, zero promise |
| **H1** | "See clearly. Move with purpose." | Vague poetry — no audience, no pain, no outcome, no timeframe |
| Subtitle | "A guided clarity experience across Personal, Business, and AI transformation…" | Three audiences = nobody feels addressed |
| **CTAs above fold** | (1) "Start Your Clarity Check" → `/clarity` (2) "How It Works" scroll | Two competing CTAs |
| **Desktop nav** | Dashboard, Pathways, Work With Me, Challenges, AI Coach, About, Community, Start Session, Sign In | **9 exits before the headline is read** |
| Tertiary | "Meet Coach Kay — Your Clarity Guide" link | A 3rd CTA |
| **Proof** | None above fold | Zero trust signal |
| **Risk reversal** | Nowhere on page | #1 objection ("what if it doesn't work?") unaddressed |
| **Friction** | `/clarity` runs 6 Q's, never captures email | High intent required; no email → no remarketing |

### Bug found in the trace (not the user's request, but blocking polish)
Console at `/programs`: *"Encountered two children with the same key."* Source: `src/components/MobileNav.tsx` lines 10–11 — two items use `path="/programs"` ("Pathways" and "Work With Me"), and React keys are `item.path`. Cheap fix when we touch nav (key on `label`, or merge into one item).

### The disconnect (root cause)
The homepage is built like a **brand site** (cinematic, atmospheric, multi-pillar). The 5 fixes are **direct-response** patterns (one promise, one button, one proof, no escape). The two are opposites. To apply the fixes we need to convert the hero from "experience" to "offer" — without nuking the brand vibe below the fold.

---

## Part 2 — The 5 fixes mapped to code

### Fix 1 — Headline swap
Replace `<h1>` at lines 219–234. Formula: **For [audience] struggling with [pain], get [outcome] in [timeframe].**

Inputs I need from you:
- **Audience** — Overwhelmed coaches? Solopreneur founders? High-achieving women?
- **Pain** — Scattered focus? Decision fatigue? No clear next step?
- **Outcome** — Deep focus blocks? One clear move? Unstuck in minutes?
- **Timeframe** — Today? Under 10 minutes? This week?

If you say "just pick" I'll ship:
> **For overwhelmed coaches and founders: get your next clear move in under 10 minutes — no planner, no overwhelm.**

### Fix 2 — One CTA above the fold
- Remove "How It Works" button (lines 266–276)
- Remove "Meet Coach Kay" tertiary link (lines 280–297) → move below fold
- Strip desktop nav above the hero: hide Pathways / Work With Me / Challenges / AI Coach / About / Community on first viewport. Keep only logo + Sign In + the single CTA. (Mobile nav stays as-is via burger menu.)
- Rename the CTA from "Start Your Clarity Check" → **"Get My Clarity Code →"** (lines 258–265)

### Fix 3 — Instant proof under CTA
New 1-line strip inserted between CTA (line 277) and the "Meet Coach Kay" block. Pick one:
- (a) **Counter**: "Used by 143 founders to break decision loops" — *need real number; what should I use? "early beta users"?*
- (b) **Quote**: "[short testimonial] — [Name, role]" — *do you have a real one?*
- (c) **Honest default**: "Trusted by early-access founders and coaches rebuilding their focus." (vague but not fake)

### Fix 4 — Kill friction
Today `/clarity` = 6 questions → AI insight → result, with **no email ever captured**. Two routes:
- **A — Email-gate the result (recommended)**: user finishes the 6 Q's → "Enter name + email to unlock your Clarity Code" → save to `cohort_registrations` (table + RLS already allow anon insert ✅) → show result.
- **B — Email-first modal**: capture before Q1. Higher capture, lower completion.

A wins because the magic happens first, ask comes when value is felt.
Files: `src/pages/ClaritySession.tsx` + `src/pages/ResultScreen.tsx`. No backend migration needed.

### Fix 5 — Risk reversal
You don't sell anything on the homepage today (the offer is a free clarity check), so a money-back guarantee doesn't fit at the hero. Use **friction-reversal** instead, right under the proof line:
> ⚡ *Takes 90 seconds. No signup. No card. Just clarity.*

The 7-day "Unstuck Guarantee" gets reserved for the paid pricing pages when repackaging resumes.

---

## Part 3 — Scope

**Files touched (max 3):**
- `src/pages/Index.tsx` — hero rewrite (Fixes 1, 2, 3, 5) + cheap MobileNav duplicate-key fix
- `src/pages/ClaritySession.tsx` — email gate before result (Fix 4)
- `src/pages/ResultScreen.tsx` — insert into `cohort_registrations` (Fix 4)

**Not touched:** Stripe, Supabase migrations, design tokens, the rest of the homepage below the hero, MobileNav layout (only the duplicate path).

---

## Decisions I need before building

1. **Headline inputs** — give me audience / pain / outcome / timeframe, or say "just pick" and I ship the default above.
2. **Proof line** — (a) real number, (b) real quote, or (c) honest default?
3. **Friction fix** — confirm A (email-gate the result) over B (email-first modal)?
4. **Desktop nav above hero** — full hide until scroll, or keep just logo + Sign In + the single CTA?

Answer those 4 and I ship the hero + clarity flow in one pass.
