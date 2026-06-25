## Mobile Layout Audit & Fix Plan

From the screenshot two concrete issues are visible, plus a broader pattern to sweep.

### Issue 1 — Admin top nav wraps and clips (the source of your screenshot)
`src/components/admin/AdminNav.tsx` renders 14 nav items + "Back to App" inside a single flex row with no overflow handling. On mobile this:
- Wraps "Back to App" into 3 stacked lines
- Squishes Overview/Users together
- Clips the rest of the icons off the right edge (you can see the bar-chart icon getting cut)

**Fix:** Convert the bar to a horizontal scroll strip on small screens.
- Wrap items in `overflow-x-auto` with `flex-nowrap`, `whitespace-nowrap`, and `scrollbar-hide`
- Make "Back to App" a compact icon-only button under `sm` (label hidden, `aria-label` added) so it stops wrapping
- Add `shrink-0` to each link so they don't compress
- Keep desktop appearance identical

### Issue 2 — Floating "Admin View" toggle overlaps cards
`AdminViewToggle` in `src/components/AccessGate.tsx` is `fixed bottom-20 right-6` and sits directly on top of the "Total Sessions" card on mobile.

**Fix:**
- Make it icon-only on mobile (`<sm`: hide label, render a 40px round button) so it stops covering card content
- Ensure card containers carry `pb-24` (or equivalent safe-area padding) on mobile when the toggle is mounted, so the FAB never lands on top of card text

### Issue 3 — Broader sweep for the same pattern
Search and fix the same mobile bleed pattern across the app:
- Any horizontal nav/tab strip using `flex` without `overflow-x-auto` (admin pages, dashboard tabs, program detail tabs)
- Any `fixed` floating button without `safe-area` padding on its host page
- Any card header using `flex items-center justify-between` where the right-side icon button can collide with a long left-side label — add `min-w-0` + `truncate` on the label and `shrink-0` on the icon

Files I will audit and patch as needed:
- `src/components/admin/AdminNav.tsx`
- `src/components/AccessGate.tsx`
- Admin pages under `src/pages/admin/*` for page-level `pb-*` adjustment
- Any tab/nav strips found via grep for `flex items-center gap` + multiple `<Link>` children
- Dashboard / Program detail header rows

### Out of scope
- No visual redesign, no color/typography changes
- No behavior changes to the toggle itself (still toggles admin/user view, same destinations)
- Desktop layout remains pixel-identical

### Verification
- Playwright at 390×844 viewport: screenshot `/admin`, `/admin/users`, `/admin/analytics`, `/dashboard`, a program detail page
- Confirm: nav scrolls without clipping, "Admin View" FAB no longer overlaps card text, no horizontal page scroll introduced
