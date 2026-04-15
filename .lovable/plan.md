

# Track Layer: Life Phase Routing + Guided Recommendation Engine

## Summary
Add a lightweight "track resolver" system that inspects user signals from onboarding and clarity sessions, classifies users into a support path, and transforms the Result Screen into a guided recommendation engine. Minimal code changes, no deleted features, no new routes.

## Architecture

```text
User Signal (onboarding goal + clarity answers)
        │
        ▼
┌──────────────────────┐
│  src/lib/track-      │  Pure function, ~150 lines
│  resolver.ts         │  No API calls, no DB
│                      │
│  Input: answers +    │
│         goal/style   │
│                      │
│  Output:             │
│   - primaryTrack     │  "women-transition-support" | "mens-midlife-reset" | "life-reset-reinvention"
│   - likelyPhase      │  "burnout" | "identity-shift" | "reinvention" | "overwhelm" | "transition" | "seeking"
│   - phaseLabel       │  Human-readable: "You may be in a transition phase"
│   - phaseDescription │  2-3 sentence coaching-framed explanation
│   - recommendedModuleIds (top 3)
│   - recommendedChallengeType
│   - recommendedProgramSlugs (top 2)
│   - supportMessage   │  Coach Kay voice CTA copy
└──────────────────────┘
```

## Changes (7 files, 1 new)

### 1. NEW: `src/lib/track-resolver.ts` (~150 lines)
- Exports `resolveTrack(answers, preferences?)` pure function
- Uses keyword matching on clarity answers (emotionalState, challenge, holdingBack, triedSoFar text) to detect patterns: energy disruption, identity questioning, burnout, overwhelm, transition, reinvention
- Maps detected patterns to one of 3 tracks
- Returns phase label, description (compliance-safe coaching language only), and recommended module/challenge/program IDs
- Internally tags existing modules and programs by theme keywords (energy, identity, clarity, burnout, purpose, transition, etc.) — no changes to module/program data files

### 2. EDIT: `src/lib/modules.ts` — Add theme tags
- Add a `themes` string array to `CoachingModule` interface
- Add `themes` to each of the 4 existing modules (e.g., clarity-check: ["clarity", "awareness", "entry"], emotional-reset: ["energy", "emotional", "burnout", "transition"], etc.)
- Non-breaking addition, no existing fields changed

### 3. EDIT: `src/pages/Onboarding.tsx` — Add life-stage signal step
- Add a new Step 0 (before current Step 0) asking "What best describes where you are right now?" with 5 options:
  - "Navigating a major life transition"
  - "Recovering from burnout or exhaustion"
  - "Rebuilding after a setback"
  - "Searching for purpose or direction"
  - "Supporting someone I care about"
- This becomes Step 1 of 4. Progress bar adjusts from 3 to 4 steps.
- Selected value saved to preferences as `lifeStage`
- Existing goal, style, and module steps remain untouched

### 4. EDIT: `src/lib/enrollment-store.ts` — Save lifeStage
- Add `lifeStage?: string` to `saveUserPreferences` parameter type
- Include it in the upsert to `user_preferences`

### 5. DB MIGRATION: Add `life_stage` column to `user_preferences`
- `ALTER TABLE user_preferences ADD COLUMN life_stage text;`

### 6. EDIT: `src/pages/ResultScreen.tsx` — The biggest change
After the existing Truth/Pattern/Action sections and Pattern Evolution, add three new sections:

**a) "What Phase You May Be In"**
- Calls `resolveTrack(answers)` 
- Shows phase label + description in a styled card
- Compliance disclaimer: "This is a coaching reflection, not a diagnosis."

**b) "Your Recommended Path"**
- Shows 1 recommended module card, 1 recommended challenge, 1 recommended program
- Each with a CTA button (Start Module / Begin Challenge / Learn More)
- Uses existing `ProgramCard` component or simple inline cards

**c) Enhanced CTAs** (replaces current "What's your next move?" section)
- "Continue with Coach Kay" (existing)
- "Start Your Recommended Challenge" (new, from resolver)
- "Explore Your Path" → navigates to /modules with a query param to highlight recommended pillar
- "Book a Session with Coach Kay" (existing)

### 7. EDIT: `src/pages/Challenges.tsx` — Reframe header copy
- Change page title from current to "Guided Transformation Actions"
- Add subtitle: "Each challenge is a structured daily coaching experience designed to create lasting change."
- No structural changes, just copy improvements

## What This Does NOT Do
- Does not delete any routes, pages, features, or data
- Does not add new routes
- Does not touch pricing, Stripe, or payment flows
- Does not add medical/clinical language anywhere
- Does not rebuild the app — adds one utility file and extends 5 existing files
- Does not change module questions or program data structure
- Defers pricing grid alignment and email campaigns to future sessions

## Compliance
All phase labels and descriptions use coaching-safe language: "phase", "transition", "pattern", "support path", "reflection", "awareness". Never "diagnosis", "treatment", "symptoms", or medical framing.

