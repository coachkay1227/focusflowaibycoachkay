# Business Audit — Root Cause & Fix

**Date:** 2026-06-29 · **Status:** FIXED, verified by build + tests + live Stripe read

## The reported error

Clicking "Continue to Payment · $47" on `/audit/intake` showed an error toast and
never reached Stripe. **No customer could buy the AI Business Audit through the
intake form.**

## Root cause

`src/pages/AuditIntake.tsx` submits `priceId: "price_1Tb41PBReje0oFcLMlvzjQQa"`
to the `create-checkout` edge function. That function rejects any priceId not
registered in `PRICE_MODE_MAP` (`supabase/functions/_shared/stripe-config.ts`):

```ts
const mode = PRICE_MODE_MAP[priceId];
if (!mode) throw new Error(`Invalid priceId: ${priceId}. Not a recognized product price.`);
```

The audit price was referenced **only** in AuditIntake.tsx and was never added
to the map. Every submission failed with "Invalid priceId" before checkout.

## Fix (commit 7b08880)

1. Registered the price: `"price_1Tb41PBReje0oFcLMlvzjQQa": "payment"` in PRICE_MODE_MAP.
2. Added `src/lib/catalog-price-sync.test.ts` — scans all frontend source for
   `price_...` IDs and fails if any is missing from PRICE_MODE_MAP. This class
   of drift now breaks the test suite instead of breaking customers.

## Verified against live Stripe (read-only API)

- `price_1Tb41PBReje0oFcLMlvzjQQa`: **active**, $47.00, one-time,
  product `prod_U91GXGNgo01tYp` — exactly the product ID the stripe-webhook
  audit fulfillment branch keys off. Payment → webhook → `business_audits` row +
  magic-link token + confirmation email chain is intact.

## Second defect found & fixed (commit 178b1f4): magic-link dead end

The post-payment intake attachment relied entirely on `sessionStorage`. A buyer
who opened the emailed magic link on a different device (or cleared their
browser) hit "Audit not yet generated" with a button that sent them to the
**paid** intake page — asking them to pay again.

Fix:
- `complete-audit-intake` now also accepts `audit_id` + magic-link `token`
  (validated against `audit_tokens` incl. expiry) as an alternative to the
  Stripe `session_id`.
- `/audit/intake/:id?token=aud_...` is now **attach mode**: skips payment,
  attaches the intake to the already-paid audit, kicks off generation.
- `/audit/report/:id` no-report fallback now distinguishes "generating —
  refresh" (intake exists) from "complete your intake" (links to attach mode),
  and re-kicks generation once via the token when intake exists but the report
  is missing.

## Files changed

| File | Change |
|---|---|
| `supabase/functions/_shared/stripe-config.ts` | +1 PRICE_MODE_MAP entry |
| `src/lib/catalog-price-sync.test.ts` | new regression test (3 tests) |
| `supabase/functions/complete-audit-intake/index.ts` | token-based lookup path |
| `src/pages/AuditIntake.tsx` | attach mode |
| `src/pages/AuditReport.tsx` | smarter fallback + generation re-kick |
| `supabase/config.toml` | explicit verify_jwt for complete-audit-intake, create-checkout |

## Rollback

`git revert 178b1f4 7b08880`. Note: reverting 7b08880 re-breaks all audit
purchases; the price map entry is load-bearing.

## Remaining limitation

Edge functions deploy via Supabase/Lovable — the updated
`complete-audit-intake` function must be deployed for attach mode to work in
production (the PRICE_MODE_MAP fix ships with `create-checkout`'s shared config
on its next deploy). Until deployed, the previous behavior applies.
