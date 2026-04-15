

# Full-Site Audit: Issues Found & Fixes Needed

## Critical CSS/Layout Issues

### 1. Kiosk Page — Conflicting `relative` + `absolute` positioning
**File:** `src/pages/Kiosk.tsx`, lines 42 and 92
- The brand div (line 42) has `className="relative z-10 absolute top-8 left-8"` — `relative` and `absolute` conflict. The `relative` wins, so the brand is NOT pinned to the top-left; it's in normal document flow inside a flex-center container, causing overlap with the main content.
- Same issue on the credential line (line 92): `className="relative z-10 absolute bottom-8 text-center"` — not actually pinned to the bottom.
- **Fix:** Remove `relative` from both divs. Use only `absolute` (or `fixed`) so they pin correctly. The parent already has `relative`.

### 2. Coach Kay About Page — "Free Clarity Check" CTA links to `/kiosk` instead of `/clarity`
**File:** `src/pages/CoachKay.tsx`, lines 99 and 229
- Both CTA buttons navigate to `/kiosk` (the kiosk display screen with a QR code), not `/clarity` (the actual clarity session). A first-time visitor clicking "Free Clarity Check" lands on a display-only kiosk page.
- **Fix:** Change both `navigate("/kiosk")` to `navigate("/clarity")`.

### 3. Homepage Nav — "Coach Kay" link goes to `/coach` (Chat) instead of `/about`
**File:** `src/pages/Index.tsx`, lines 137-141
- The "Coach Kay" button in the homepage nav navigates to `/coach` (the Coach Chat page), not `/about` (the About/Bio page). This is confusing because there's a separate "About" link right next to it.
- **Fix:** Either rename the "Coach Kay" nav link to "Chat" (since it goes to the chat) or redirect it to `/about`. Since DesktopNav already has "Coach Kay" pointing to `/coach` and "About" pointing to `/about`, the homepage should match. Rename to "Chat" or "AI Coach" to differentiate.

### 4. Homepage Footer — "Coach Kay" link also goes to `/coach`
**File:** `src/pages/Index.tsx`, line 585-586
- Footer repeats the same mislabeled link. Should either say "Chat" or link to `/about`.
- **Fix:** Add an "About" link in the footer, and rename the existing link to "AI Coach" or "Chat".

### 5. Dashboard page — no top padding for DesktopNav
**File:** `src/pages/Dashboard.tsx`
- Dashboard has its own nav but the global `DesktopNav` also renders on `/dashboard`. The DesktopNav is `fixed top-0` with `h-14`, but Dashboard's content starts from the top without a `pt-14` spacer. This means the DesktopNav overlaps Dashboard's own nav bar.
- **Fix:** Since Dashboard renders its own nav, add `/dashboard` to the `PRIVATE_ROUTES` array in `DesktopNav.tsx` to hide the global nav on that page. Same check needed for other pages with custom headers.

### 6. Pages missing top padding under DesktopNav
Pages that render under the global DesktopNav (Modules, Challenges, Community, CoachChat, ProgramDetail, CoachKay, MirrorChallenge, Profile, ResultScreen) need `pt-14` on their main content wrapper so content doesn't hide behind the fixed 56px nav.
- **Affected pages with their own header bars** that will overlap: Modules, Challenges, Community, CoachChat, ResultScreen, MirrorChallenge. These all have `py-6` header sections that sit at `top: 0` and will be hidden behind the `DesktopNav`.
- **Fix:** Add these paths to `PRIVATE_ROUTES` in DesktopNav to suppress the global nav, since they all have their own back-button headers. OR add `pt-14` padding. The cleaner fix is to suppress the DesktopNav for pages that have custom navigation headers.

### 7. CoachKay About Page — no padding for DesktopNav
**File:** `src/pages/CoachKay.tsx`
- The About page does NOT have a back-button header; it relies on the global DesktopNav. But its hero section starts at `pt-24` which should be sufficient on desktop. However, on pages where DesktopNav shows, the nav overlaps the first 56px. `pt-24` = 96px, which clears the 56px nav. This is fine.

## Navigation & Routing Issues

### 8. DesktopNav suppresses on `/` but no other page has its own nav-hiding logic
- Pages like `/community`, `/coach`, `/challenges`, `/modules`, `/result` all have their own back-button headers PLUS the DesktopNav renders on top. This creates double navigation on desktop.
- **Fix:** Add these page-level routes to `PRIVATE_ROUTES` or create a list of routes that use custom headers to suppress DesktopNav.

### 9. QR Code links to wrong URL
**File:** `src/components/QRCodeDisplay.tsx`, line 130
- Default URL is `https://focusflowelevation-hub.com/clarity` — this appears to be a custom domain. Need to verify this is correct or update to the actual published URL.
- The QR code generator is a simplified implementation that produces a valid-looking pattern but may not be scannable.
- **Fix:** Update the default URL to the actual published site (`https://focusflowaibycoachkay.lovable.app/clarity`) or confirm the custom domain is set up.

## Functional Issues

### 10. MobileNav renders on homepage AND inside other pages
- The homepage (Index.tsx) includes `<MobileNav />` in its nav. Other pages (Community, Modules, Challenges, etc.) also include `<MobileNav />`. But MobileNav is NOT in the global DesktopNav component — it's only for mobile. This is fine since DesktopNav is `hidden md:flex` and MobileNav is `md:hidden`.

### 11. Profile page has `fixed` header but no DesktopNav suppression
**File:** `src/pages/Profile.tsx`, line 104
- Profile has its own fixed header at `top-0` which will collide with DesktopNav on desktop.
- **Fix:** Add `/profile` to the suppression list.

## Summary of Changes

| # | File | Fix |
|---|------|-----|
| 1 | `Kiosk.tsx` | Remove `relative` from brand and credential divs (keep `absolute`) |
| 2 | `CoachKay.tsx` | Change `navigate("/kiosk")` to `navigate("/clarity")` (2 places) |
| 3 | `Index.tsx` | Rename "Coach Kay" nav link to "AI Coach" or change target to `/about` |
| 4 | `Index.tsx` | Add "About" link in footer, rename "Coach Kay" to "AI Coach" |
| 5-8 | `DesktopNav.tsx` | Expand `PRIVATE_ROUTES` to include all pages with custom headers: `/dashboard`, `/community`, `/coach`, `/challenges`, `/modules`, `/result`, `/clarity`, `/mirror-challenge`, `/programs`, `/profile` |
| 9 | `QRCodeDisplay.tsx` | Update default URL to actual published site |

## Technical Details

- The `PRIVATE_ROUTES` expansion in DesktopNav is the cleanest fix. Pages with back-button headers already provide their own navigation, so doubling up with the fixed nav bar creates overlap. By suppressing DesktopNav on these pages, we eliminate the double-nav issue across the board.
- The Kiosk CSS fix is straightforward: `relative` cancels `absolute` positioning, so the brand and credential elements sit in flow instead of pinning to corners.
- The CoachKay `/kiosk` links are a clear routing bug — `/kiosk` is a display-only page for physical events, not a user-facing entry point.

