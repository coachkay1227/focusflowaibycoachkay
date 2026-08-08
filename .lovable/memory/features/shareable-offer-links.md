---
name: Shareable offer links and QR codes
description: Permanent slug registry behind /admin/qr-codes, the single /start-a-build inquiry, and Build Studio deep links
type: feature
---
- `src/lib/shareable-offers.ts` is the single registry of every printable offer link. Build Studio entries are derived from `build-studio-catalog.ts` so an offer cannot go missing.
- Slugs are PERMANENT once a QR code is printed. Never rename a slug; add a new one instead.
- `/admin/qr-codes` generates real scannable PNG/SVG codes (the `qrcode` library) with optional `utm_source`/`utm_medium=qr`/`utm_campaign` tags so a workshop scan is attributable.
- `/start-a-build` is the ONE inquiry form for every non-checkout offer. Dropdown-guided, prefills from `?offer=<key>`, writes to `build_inquiries` then notifies via the `apply-now` edge function. Do not add more inquiry dialogs.
- Build Studio honors `?offer=<key>`: opens that tier and scrolls to the grid.
