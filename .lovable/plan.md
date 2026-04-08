

# Fix Mobile Nav Overlay — Background Content Bleeding Through

## Problem

The mobile nav uses a slide-in panel (`w-72`) from the right with a semi-transparent overlay (`bg-black/80`) covering the rest. The hero text ("See clearly. Move with purpose.") bleeds through both the overlay AND the panel background, making nav links hard to read.

Root cause: `bg-card` (the panel background) is likely using a semi-transparent color variable.

## Fix

Make the slide-in panel full-width on mobile and use a solid background:

### File: `src/components/MobileNav.tsx`

**Change 1** — Panel width and background (line 46):
- `w-72 bg-card` → `w-full bg-[hsl(220,25%,8%)]` (solid dark background matching the app theme)
- This ensures zero bleed-through since the panel covers the entire viewport

**Change 2** — Overlay can stay as-is or be simplified since the panel is now full-width

This is a single-line CSS class change. No logic changes needed.

