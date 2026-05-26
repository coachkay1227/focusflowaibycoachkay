## Step 3 — AuditReport.tsx routing map (hash-anchored)

### Scope
Single file: `src/pages/AuditReport.tsx` — rewrite the `ctaRoute(slug)` switch so each of the 28 catalog slugs deep-links to its specific anchor on the right page. No other file touched.

### Route audit (App.tsx)
Confirmed existing routes: `/store`, `/rent-an-agent`, `/advisory`, `/community`. **No `/transformations` route exists.** Per spec instruction ("if a transformations page doesn't exist, route to the closest existing page and flag"), Transformation slugs will fall back to `/store#…` (Store is where Transformation programs are listed today) and this gap is flagged below for Phase 4B.

No separate Lead Engine route exists either — it lives inside `/rent-an-agent`, so `lead_engine_*` slugs use `/rent-an-agent#lead-engine-*` as already planned in spec.

### New mapping in `ctaRoute(slug)`

| Slug | href |
|---|---|
| transform_30_personal | `/store#30-personal` ⚠ |
| transform_30_business | `/store#30-business` ⚠ |
| transform_30_ai | `/store#30-ai` ⚠ |
| transform_90_personal | `/store#90-personal` ⚠ |
| transform_90_business | `/store#90-business` ⚠ |
| transform_90_ai | `/store#90-ai` ⚠ |
| transform_6mo_partnership | `/store#6-month` ⚠ |
| rent_agent_starter | `/rent-an-agent#starter` |
| rent_agent_pro | `/rent-an-agent#pro` |
| rent_agent_dreamteam | `/rent-an-agent#dreamteam` |
| rent_agent_enterprise | `/rent-an-agent#enterprise` |
| lead_engine_essentials | `/rent-an-agent#lead-engine-essentials` |
| lead_engine_pro | `/rent-an-agent#lead-engine-pro` |
| lead_engine_growth | `/rent-an-agent#lead-engine-growth` |
| lead_engine_scale | `/rent-an-agent#lead-engine-scale` |
| lead_engine_enterprise | `/rent-an-agent#lead-engine-enterprise` |
| advisory_strategy_intensive | `/advisory#strategy-intensive` |
| advisory_executive | `/advisory#executive` |
| advisory_speaking | `/advisory#speaking` |
| advisory_corporate | `/advisory#corporate` |
| advisory_university | `/advisory#university` |
| group_programs | `/advisory#group-programs` |
| studio_mini_story | `/store#mini-story` |
| studio_storybook_pro | `/store#storybook-pro` |
| studio_other | `/store` |
| build_studio_landing / _site / _dashboard | `{ href: "#", opening_soon: true, label: "Opening soon — get notified" }` (unchanged — already triggers existing waitlist UI) |
| focus_flow_elevation_hub | `{ href: SKOOL_URL, external: true, label: "Forward Focus Elevation Community · Free Access" }` |

⚠ = falls back to `/store` because `/transformations` route doesn't exist yet — flagged below.

### Minor adjustments
- Extend the `ctaRoute` return shape to honor an optional `label` for the community CTA, and surface it in the button render path (CTA already reads `route.label` for Build Studio, so this is a no-op for the type).
- Keep Build Studio waitlist flow untouched (already implemented at lines 366–391).
- Keep `focus_flow_elevation_hub` external link logic untouched; just pass the new label.

### Verification (post-edit)
1. `grep` every slug from `OFFER_SLUGS` against `ctaRoute` — confirm every case is matched (no slug falls through to `default`).
2. Render-check: load `/audit/report/:id` with each slug stubbed; confirm no console errors and link `href` matches table.
3. Build Studio slugs render the existing inline waitlist (no broken link).
4. `focus_flow_elevation_hub` opens Skool URL in new tab with the new label.

### Phase 4B flag (out of scope here)
`/transformations` page does not exist. Seven Transformation slugs currently anchor into `/store` as a graceful fallback. Phase 4B should create `/transformations` with anchors `#30-personal`, `#30-business`, `#30-ai`, `#90-personal`, `#90-business`, `#90-ai`, `#6-month`, then a one-line swap in `ctaRoute` re-targets all seven.

### Out of scope
No edge function, no `Dashboard.tsx`, no new routes, no Store/RentAnAgent/Advisory page anchor IDs (those can be added page-side later — anchors that don't yet resolve just land at the top of the page, which is safe).
