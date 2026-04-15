

# Performance Optimization Plan

## Root Cause Analysis

The Lighthouse report flags 4 issues. Here's the exact root cause of each:

### 1. Render-blocking requests (280ms savings)
**Root cause**: Line 33 of `index.html` loads Google Fonts via a synchronous `<link rel="stylesheet">`. This blocks first paint until the entire font CSS (and then the font files) download. The chain is: HTML → font CSS → 4 WOFF2 files.

**Fix**: Switch to non-blocking font loading using `media="print" onload="this.media='all'"` pattern, or use `rel="preload"` for the font CSS.

### 2. Max Potential First Input Delay (280ms)
**Root cause**: The main JS bundle (`index-DZ4_UYaP.js`, 255KB) executes as a single long task. This is the *same* bundle that contains all eagerly-imported pages: `Index`, `Community`, `Auth`, `ResetPassword`, `Onboarding`, `EmailPreview`, `Sitemap`, `NotFound`, `Unsubscribe`, `EmailUnsubscribe`, `Kiosk`, `ChatWidget`, `AccessGate`, `DesktopNav`. These are all statically imported in `App.tsx` (lines 11-25), so they ship in the initial bundle even though most users only visit `/`.

**Fix**: Lazy-load all pages except `Index`. Move `ChatWidget`, `DesktopNav`, and `AdminViewToggle` to lazy imports with idle loading.

### 3. Unused JavaScript (144 KiB savings)
**Root cause**: Same as #2 — 58% of `index-DZ4_UYaP.js` is unused on initial load because pages like `Auth`, `Community`, `Kiosk`, `Onboarding`, etc. are eagerly bundled but not rendered on `/`.

**Fix**: Same lazy-loading fix resolves this.

### 4. Cache lifetimes (355 KiB savings)
**Root cause**: `vercel.json` has no `Cache-Control` headers for static assets. Vite outputs hashed filenames (`index-DZ4_UYaP.js`) which are safe to cache indefinitely, but without explicit headers Vercel serves them with `cache-control: no-cache` or short TTLs.

**Fix**: Add immutable cache headers for `/_assets/*` in `vercel.json`.

---

## Implementation

### Step 1: Non-blocking Google Fonts in `index.html`
Replace the synchronous font `<link>` with the print-swap pattern:
```html
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=..."
      media="print" onload="this.media='all'" />
<noscript>
  <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=..." />
</noscript>
```

### Step 2: Lazy-load remaining eager pages in `App.tsx`
Convert these static imports to `lazy()`:
- `Community`, `Auth`, `ResetPassword`, `Onboarding`, `EmailPreview`, `Sitemap`, `NotFound`, `Unsubscribe`, `EmailUnsubscribe`, `Kiosk`

Keep `Index` eager (it's the landing page). Wrap `ChatWidget` and `DesktopNav` in a deferred load (e.g., `requestIdleCallback` or `lazy`).

### Step 3: Cache headers in `vercel.json`
Add a rule for hashed assets:
```json
{
  "source": "/assets/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
  ]
}
```

### What this does NOT change
- No design or branding changes
- No new dependencies
- No database or edge function changes

