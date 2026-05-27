# Path card CTAs → clean funnel into program detail + enrollment

## What's actually happening today

The three path cards on `/truth-about-ai` (lines 125-174 of `src/pages/TruthAboutAI.tsx`) already render through `OfferCard` with bottom-anchored CTAs and `items-stretch` parity. Geometry is fine.

The real funnel friction is in the **CTA copy and routing**, not the pixels. Each card's `primaryCta` label promises plurality (*"See personal paths"*) but routes to a single program detail page. That makes users expect an overview/landing and land on an enroll page — a small but real cognitive break right at the conversion moment.

### Current state

| Card | Primary CTA label | → Routes to | Lands on | Next step there |
|---|---|---|---|---|
| Personal | "See personal paths" | `/programs/30-day-personal-reset` | ProgramDetail | "Enroll Now" button (`ProgramDetail.tsx:319`) |
| Business | "See business paths" | `/programs/30-day-business-reset` | ProgramDetail | "Enroll Now" |
| Full Transformation | "See transformation paths" | `/programs/90-day-full-ai-transformation` | ProgramDetail | "Enroll Now" |

| Card | Secondary CTA label | → Routes to |
|---|---|---|
| Personal | "Talk to Kay first" | `/coach-kay` |
| Business | "Have us build it" | `/build-studio` |
| Full Transformation | "Apply for partnership" | `/programs/6-month-private-partnership` |

Routes are correct. Labels are not parallel and over-promise breadth on the primary, while the secondaries use three different verb shapes ("Talk to…", "Have us…", "Apply for…") which makes the row look uneven at a glance even when the geometry is perfect.

## The plan

### 1. Parallel, funnel-honest primary CTA copy
Rewrite each primary label to match what the user actually lands on — the specific program — and use a verb that mirrors the enrollment step on the destination page ("Enroll Now"):

| Card | New primary label | Route (unchanged) |
|---|---|---|
| Personal | "Start the 30-day Personal Reset" | `/programs/30-day-personal-reset` |
| Business | "Start the 30-day Business Reset" | `/programs/30-day-business-reset` |
| Full Transformation | "Start 90-day Full Transformation" | `/programs/90-day-full-ai-transformation` |

Three labels, same verb (*Start*), same structure (verb + duration + program name). Each lands on a ProgramDetail page whose primary action is "Enroll Now" — so the funnel reads: *Start →  Enroll → Dashboard*.

### 2. Parallel secondary CTA copy
Same trick on the secondaries — different destinations are fine, but the verb shape should be consistent:

| Card | Secondary label (was → is) | Route |
|---|---|---|
| Personal | "Talk to Kay first" → **"Talk to Kay first"** (keep — already conversational) | `/coach-kay` |
| Business | "Have us build it" → **"Have the Studio build it"** | `/build-studio` |
| Full Transformation | "Apply for partnership" → **"Apply for the Partnership"** | `/programs/6-month-private-partnership` |

Minor; keeps proper noun capitalization parallel.

### 3. OfferCard CTA spacing — tiny tightening (optional, ask before applying)
Inside `OfferCard.tsx` line 118 the dual-CTA stack uses `flex flex-col gap-2`. On dual-CTA cards (Personal, Business, Full Transformation all have two CTAs) the secondary button currently sits with `gap-2` (8px) under the primary, which reads slightly cramped against the larger button padding. Bumping to `gap-2.5` (10px) gives the pair a calmer rhythm without affecting single-CTA cards.

Risk: this change touches *every* OfferCard usage site-wide, not just the path cards. If you want the spacing change localized to the path cards only, I'll skip it — say the word.

### 4. Verify the funnel end-to-end after the copy change
Once the labels ship, walk one path in the preview (Personal):
- Click "Start the 30-day Personal Reset" → confirm ProgramDetail loads.
- Confirm "Enroll Now" is visible above the fold for a logged-in user.
- Click and confirm the success toast + dashboard redirect.

I'll do this with the browser tool right after the edits land.

## What I am NOT touching

- The `PATHS` *destinations* — they're correct.
- `ProgramDetail.tsx` enrollment logic — already working.
- `OfferCard` structural classes — locked by the regression tests added last turn.
- The Modules-page `PATHS` (different surface, different intent — that's a category nav, not a conversion card).

## Open question

Do you want CTA labels to include the **price** (e.g. *"Start the 30-day Personal Reset — $97"*) for stronger conversion signal, or keep price in the dedicated price zone above the CTA (current behavior, cleaner geometry)? Default is keep price separate.
