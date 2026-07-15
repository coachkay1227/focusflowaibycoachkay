## Goal
Extend the existing `scripts/check-payment-links.ts` guard so it emits a human-readable report of every stipend/audit/payment link and its resolved target, uploaded as a CI artifact for quick review.

## Approach (minimal, no new deps)

1. **Extend `scripts/check-payment-links.ts`**
   - While it scans `src/` and `supabase/functions/`, collect each hit into a structured record:
     - `file` + `line`
     - `type` (`priceId` | `stripe_url` | `audit_route` | `route_definition`)
     - `value` (e.g. `price_1AbC…`)
     - `resolvedTarget` — for `priceId`, look up `PRICE_MODE_MAP` to get `{ mode, product, successPath }`; for audit CTAs, the destination route; for routes, the component
     - `status` — `ok` | `missing_in_map` | `direct_stripe_url` | `bypasses_intake` | `route_missing`
   - Keep all existing failure rules unchanged.
   - After scanning, write two files to `reports/`:
     - `payment-links.json` (machine-readable)
     - `payment-links.md` (grouped table: Registered priceIds, Audit funnel entry points, Route map, Failures)
   - Exit non-zero only on real failures (same as today); the report is always written.

2. **Wire into CI (`.github/workflows/seo-regressions.yml`)**
   - Ensure `reports/` exists before the step.
   - After the check step runs (pass or fail), add:
     ```yaml
     - uses: actions/upload-artifact@v4
       if: always()
       with:
         name: payment-links-report
         path: reports/payment-links.*
     ```
   - No change to the `prebuild` hook — local `bun run build` still runs the guard and produces the same report locally under `reports/`.

3. **Gitignore**
   - Add `reports/` to `.gitignore` so generated artifacts don't get committed.

## Deliverables
- Updated `scripts/check-payment-links.ts` (report generation added, existing rules untouched)
- Updated `.github/workflows/seo-regressions.yml` (artifact upload)
- `.gitignore` entry for `reports/`

## Out of scope
- No runtime HTTP pinging of Stripe URLs (avoids network flake in CI and doesn't cost credits). Static resolution via `PRICE_MODE_MAP` is enough to tell you which price maps to which product/flow.
- No new tests or Playwright work.

## Review workflow after this ships
Open the failed/successful CI run → Artifacts → `payment-links-report` → read `payment-links.md` to see every price/link and where it goes.
