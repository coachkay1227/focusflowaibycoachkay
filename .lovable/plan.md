## Goal
Make the F.O.C.U.S. framework feel loud, coherent, and load-bearing across the entire site — and fix the small typographic break where "Community & Coaching" wraps to two lines on the homepage pillar card.

## What I found in the audit

**Strong, on-brand:**
- `src/data/programs.ts` has a clean canonical source: `FOCUS_PILLARS` (F/O/C/U/S) with full names, colors, and descriptions. Every program in the catalog carries `pillar` + `pillarFull`.
- `ProgramDetail.tsx` surfaces the pillar badge with the pillar color.
- Homepage "Your F.O.C.U.S. Journey" section presents all 5 pillars.

**Weak / inconsistent:**
1. **Tag wrap bug (visual):** The 5th pillar card tag "COMMUNITY & COACHING" wraps to two lines at lg breakpoint because the pill uses `px-3 py-1` + uppercase + letter-spacing. The other 4 tags are shorter and stay on one line.
2. **Modules page** (`/modules`) does not visually group, color, or label programs by pillar — programs render without the F.O.C.U.S. context that the homepage promises ("Every module… maps to one of five transformational pillars").
3. **Challenges / Mirror Challenge** pages don't reference a pillar at all.
4. **Assessment, Clarity Session, Starter Kit** result screens don't tell the user *which pillar* their result maps to — breaking the "this all adds up" feeling.
5. **Pillar tags on homepage** (`Core Inner Work`, `Vision & Direction`, etc.) don't appear anywhere else on the site — they're orphan vocabulary.
6. **Color system disconnect:** Pillar colors in `programs.ts` are hard-coded hex (`#C9973A`, `#4A7FC1`…) instead of HSL design tokens, so they can't be reused consistently in Tailwind.

## The plan

### Phase 1 — Fix the visible break (homepage tag wrap)
- `src/pages/Index.tsx` pillar cards: make tag pill `whitespace-nowrap`, drop horizontal padding to `px-2.5`, and shrink the 5th tag to "Community + Coaching" (single line, ampersand removed) so it sits on one line at every breakpoint. Verify at 1024 / 1280 / 1440 / 1641.

### Phase 2 — Make F.O.C.U.S. the spine, not decoration
- **Pillar tokens:** Move the 5 pillar colors into `src/index.css` as semantic tokens (`--pillar-f`, `--pillar-o`, `--pillar-c`, `--pillar-u`, `--pillar-s`) in HSL; update `FOCUS_PILLARS` in `programs.ts` to reference token names instead of raw hex. Add a single `PillarBadge` component in `src/components/PillarBadge.tsx` that everything reuses.
- **Modules page** (`/modules`): add a sticky pillar filter row (F · O · C · U · S, each in its pillar color) and group/sort programs by pillar with a pillar header per group. Each card shows the `PillarBadge`.
- **Challenges + Mirror Challenge**: surface "Part of the [Pillar Name] Pillar" badge in the header.
- **Assessment, Clarity Session, Starter Kit result screens**: add a "Maps to your [Pillar] Pillar" line under the result hero so every output ties back to the framework.

### Phase 3 — Make it loud + understood
- Add a small recurring footer band under hero sections on the 4 main funnel pages (Index, Modules, Assessment, Programs): a horizontal F · O · C · U · S strip with one-word labels. Reinforces the framework on every scroll.
- Update `public/llms.txt` "About" paragraph to name the 5 pillars explicitly so AI crawlers describe the framework correctly.
- Ensure the homepage subhead under "Your F.O.C.U.S. Journey" is mirrored verbatim wherever the framework appears (single source of copy in `programs.ts`).

### Phase 4 — Verify
- Walk the 3 main paths (`/clarity`, `/assessment`, `/starter-kit`) and confirm each result screen names the pillar.
- Walk `/modules` and `/challenges` and confirm pillar grouping/badge.
- Re-screenshot homepage pillar row at 4 widths to confirm no tag wraps.

## Out of scope
- No backend, RLS, or edge function changes.
- No new AI behavior — pillar mapping is deterministic from existing `programs.ts` data.
- No copy rewrites beyond the tag and pillar-mapping lines.

## Technical notes
- All color additions go in `index.css` as HSL tokens + `tailwind.config.ts` extension; no inline hex.
- `PillarBadge` accepts `pillar: FocusPillar` and renders letter + name + token-driven color.
- Modules page grouping happens client-side from the existing `programs` array — no schema changes.
