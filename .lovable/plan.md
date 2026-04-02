

# Mobile Optimization & Animation Performance Audit

## Current State

The app is already well-structured for responsive design — most pages use `md:` breakpoints, `MobileNav` is present everywhere, and the day tracker touch targets were already fixed to `w-11 h-11` (44px). However, there are specific issues to address.

## Findings & Fixes

### 1. Community page still inlines mouse glow instead of using the shared hook
- `Community.tsx` lines 41-50 manually attach mousemove instead of calling `useMouseGlow(containerRef)`
- **Fix**: Replace inline listener with `useMouseGlow` import (3 lines replaces 9)

### 2. FloatingOrbs performance on mobile
- 4 orbs with `filter: blur(80px)` and continuous CSS animations on `willChange: "transform"` — this is GPU-heavy on low-end phones
- **Fix**: Reduce to 2 orbs on mobile using a CSS media query approach, and reduce blur to 40px on small screens via a `useIsMobile` conditional

### 3. Grain overlay is expensive on mobile
- The `grain-overlay::before` pseudo-element covers 200% viewport with a stepped animation — causes jank on phones
- **Fix**: Disable grain animation on mobile with `@media (max-width: 767px)` — keep static grain, remove the animation

### 4. Font sizes too small on some mobile views
- Clarity Session question text at `text-3xl` (30px) on mobile is fine, but the `font-mono-label` at `0.7rem` (11.2px) is below the 12px minimum for readability
- **Fix**: Bump `font-mono-label` to `0.75rem` (12px)

### 5. CoachChat input area needs safe-area padding on iOS
- The bottom input bar sits at the viewport bottom — on iPhones with home indicator, it gets covered
- **Fix**: Add `pb-safe` / `env(safe-area-inset-bottom)` padding to the chat input container

### 6. CTA buttons on ResultScreen stack poorly on small screens
- Three full-width buttons with `px-8 py-6` look oversized on 320px screens
- **Fix**: Reduce button padding on mobile: `px-6 py-4 sm:px-8 sm:py-6`

### 7. Homepage F.O.C.U.S. cards horizontal scroll on small screens
- 5-column grid collapses to 1-col on mobile (already correct via `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5`) — no issue here

### 8. `willChange` left permanently on AnimatedSection
- `willChange: "transform, opacity"` is set even after animation completes — wastes GPU memory
- **Fix**: Clear `willChange` after animation by setting it to `"auto"` once `visible` is true (after transition ends)

### 9. Nav buttons have no minimum touch target
- Desktop nav buttons in `Index.tsx` header are `text-sm` with no padding — fine since they're `hidden md:block`
- MobileNav buttons are `px-4 py-3` (48px height) — meets 44px minimum ✓

## Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `Community.tsx` | Use `useMouseGlow` hook | Code cleanup |
| `FloatingOrbs.tsx` | Accept `reduced` prop, render 2 orbs with less blur on mobile | Performance |
| `src/index.css` | Disable grain animation on mobile, bump mono-label size | Performance + accessibility |
| `AnimatedSection.tsx` | Clear `willChange` after animation | GPU memory |
| `CoachChat.tsx` | Add safe-area bottom padding | iOS usability |
| `ResultScreen.tsx` | Responsive button padding | Small screen layout |

## What stays untouched
- All existing animations, keyframes, and transitions
- FloatingOrbs on desktop (identical rendering)
- Color variables, design system, card styles
- All interactive UI/UX behavior
- No 3D or external animation libraries added (per constraint)

