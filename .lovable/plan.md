## Step 4 — Align Dashboard offer-name labels to spec

### Status
`AUDIT_OFFER_NAMES` in `src/pages/Dashboard.tsx` already covers all 28 catalog slugs (set up in Phase 3.2.5). No legacy `focusflow_*` entries remain. Five labels need tiny copy adjustments to match the Step 4 spec exactly.

### Edits (5 single-line label changes in src/pages/Dashboard.tsx)

| Slug | Current | Spec |
|---|---|---|
| `group_programs` | "Group Programs / Collective AI Summit" | "Group Programs" |
| `studio_other` | "Studio — Custom Lane" | "Publishing Studio" |
| `build_studio_landing` | "Build Studio — Landing Page" | "Build Studio — Landing Page (Opening Soon)" |
| `build_studio_site` | "Build Studio — Business Site" | "Build Studio — Business Site (Opening Soon)" |
| `build_studio_dashboard` | "Build Studio — Dashboard" | "Build Studio — Dashboard (Opening Soon)" |
| `focus_flow_elevation_hub` | "Focus Flow Elevation Hub (Community)" | "Focus Flow Elevation Hub (Free)" |

All other 22 slugs already match spec verbatim — no change.

### Verification
- `grep "focusflow_30\|focusflow_90\|focusflow_6mo" src/pages/Dashboard.tsx` → 0 hits
- All 29 spec slugs present in the map
- Typecheck clean (string-literal edits only)

### Out of scope
No edge function, no AuditReport.tsx, no schema, no other files.
