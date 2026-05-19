## Goal

Replace the MAC Type Assessment card's `/clarity` link with a dedicated `/assessment` route that houses a real MAC Type flow, distinct from the Clarity Check.

## Changes

### 1. New page: `src/pages/Assessment.tsx`
A multi-step questionnaire experience modeled on `ClaritySession.tsx` but standalone for the MAC Type Assessment:
- Reuses the visual shell: `FloatingOrbs`, `useMouseGlow`, `SEOHead`, `Progress`, gold/brand styling.
- Header label: "MAC TYPE ASSESSMENT" + heading "Discover Your Mind · Action · Character Type."
- Steps grouped into 3 dimensions (Mind, Action, Character), 6 questions each (18 total — kept slightly tighter than the 20 mentioned in copy to ship a clean v1; can expand later).
- Each question = options-based with 4 choices mapped to a dimension archetype (e.g. Mind: Analyst / Visionary / Strategist / Empath).
- Local state only — no Supabase or backend writes (matches the existing anon-first clarity flow).
- On completion, navigates to `/result` with a `state: { macAnswers, mode: "mac-type" }` payload, OR (simpler) renders an inline result panel on the same page showing the user's 3-letter MAC type (e.g. "V-S-E"), a short description per dimension, and CTAs to "Take the Clarity Check" and "Explore Pathways".
- Decision: render inline result on the same page (simpler, no need to fork ResultScreen logic which is keyed to ClarityAnswers).

### 2. New route in `src/App.tsx`
- Lazy-load `Assessment` and add `<Route path="/assessment" element={<Suspense fallback={<PageSkeleton />}><Assessment /></Suspense>} />`.

### 3. `src/pages/Index.tsx`
- In the "Start Here — Free" grid, change the MAC Type Assessment card's `to` from `/clarity` to `/assessment`.

### 4. SEO
- `SEOHead` on `/assessment` with title "MAC Type Assessment — FocusFlow AI" and a 1-line description.

## Non-goals
- No changes to auth, Supabase schema, RLS, edge functions, Stripe, or routing for other pages.
- No changes to the existing `/clarity` flow or `ClaritySession.tsx`.
- No `programs.ts` edits (the program catalog entry already exists).
- Not wiring `programs/mac-type-assessment` ProgramDetail to `/assessment` — only the Index card link is in scope per the request.

## Technical notes

```text
src/
  pages/
    Assessment.tsx        (new)
  App.tsx                 (+1 route, +1 lazy import)
  pages/Index.tsx         (1-line link change)
```

MAC scoring logic lives inline in `Assessment.tsx` as a small mapping; no shared lib needed for v1.
