## Problem

The Meta Pixel block in `index.html` (lines ~47-64) is malformed and will not load correctly:

1. The closing `</script` tag is missing its `>` — it reads `</script` followed by a newline, which breaks parsing of everything after it.
2. The `<noscript>` fallback is mangled: `</noscript>noscript>` (stray trailing `noscript>`).
3. Per project rules, `<noscript>` containing an `<img>` is not valid inside `<head>` — only metadata tags are allowed there. The pixel `<noscript><img>` fallback must live in `<body>`, not `<head>`.
4. Indentation is inconsistent with the surrounding block.

Because of #1, the browser likely never executes `fbq('init', ...)` / `fbq('track', 'PageView')`, so the pixel is not actually firing despite being "present".

## Fix

Edit `index.html` only:

1. In `<head>`, replace the broken Meta Pixel block with a clean version:
   - Properly closed `<script>...</script>` containing the standard `fbq` loader, `fbq('init', '627115437126553')`, and `fbq('track', 'PageView')`.
   - Remove the `<noscript>` from `<head>` entirely.
2. In `<body>` (right after the opening `<body>` tag, alongside the existing skip link), add the Meta Pixel `<noscript><img .../></noscript>` fallback using pixel ID `627115437126553`.
3. Keep the surrounding GA block, fonts preconnect, OG/Twitter meta, and JSON-LD schemas unchanged.

## Verification

After the edit:
- Reload the preview and confirm no HTML parse errors in console.
- Check the Network tab for a request to `https://connect.facebook.net/en_US/fbevents.js` (script load) and a request to `https://www.facebook.com/tr?id=627115437126553&ev=PageView...` (PageView beacon).
- Confirm `window.fbq` is defined in the console.

No other files change.
