## Stripe audit — findings

I reconciled every `price_*` / `prod_*` in code against the live Stripe account (`list_products` + `list_prices`).

**Catalog parity — clean ✅**
- `_shared/stripe-config.ts` (`PRODUCT_TIER_MAP`, `NO_TIER_PRODUCTS`, `PRICE_MODE_MAP`, `TRANSFORMATION_PROGRAM_MAP`)
- `src/lib/stripe-tiers.ts`, `src/lib/offer-catalog.ts`, `src/lib/build-studio-catalog.ts`
- `supabase/functions/_shared/autism-catalog.ts`
- `src/components/PricingSection.tsx` (6 transformation-path price IDs)

Every ID resolves to a live, active price with matching amount/interval. Call sites (`Advisory`, `RentAnAgent`, `CollectiveAIBuildStudio`, `ProgramDetail`, `PricingSection`, `AutismIntakeModal`, `IntakeFormModal`) all route through `create-checkout` / `create-autism-checkout` / `create-book-checkout`, which validate against the server-side allow-list.

**Webhook (`stripe-webhook`) — clean ✅**
- Signature verified, idempotency via `processed_stripe_events`.
- Book → Autism → Audit → tier branches in correct order with amount-mismatch protection.
- `PROTECTED_TIERS` preserves manual elevations on `subscription.deleted`; only `rent_agent` is allowed to auto-downgrade.
- `verify_jwt = false` set in `config.toml` for all public/checkout/webhook functions.

## Bugs to fix

### 1. `check-subscription` wrongly promotes Build-Studio care-plan buyers to `subscriber`
`Site Care`, `Collective Membership`, `Agent Care`, `Monthly Build Credits` are recurring **but** intentionally in `NO_TIER_PRODUCTS` (no access change). Current code:

```ts
const tier = PRODUCT_TIER_MAP[productId] || "subscriber"; // ← falls back to "subscriber"
await supabaseClient.from("user_access_levels").upsert({ id: user.id, tier });
```

A care-plan customer with no FocusFlow sub gets silently upgraded to `subscriber` (member features) on the next 5-min poll. **Fix:** if `NO_TIER_PRODUCTS.has(productId)`, skip the upsert and return `{ subscribed: true, tier: currentTier, product_id }` so the client knows they have an active Stripe sub without changing access.

### 2. `check-subscription` one-time reconciliation is fragile
- `.single()` on `user_access_levels` throws PGRST116 when the row is missing (rare but possible for legacy users created before the `handle_new_user` trigger). Switch to `.maybeSingle()`.
- `sessions.list({ limit: 10 })` then `.find(s => s.mode==="payment" && payment_status==="paid")` only inspects the first paid `payment` session it sees. If a user bought a transformation_90 then later bought an audit/book/autism (also `mode:"payment"`), the audit session is picked first, `PRODUCT_TIER_MAP` lookup misses, and the real transformation upgrade is dropped. Fix: iterate the paid sessions and pick the first whose product **is** in `PRODUCT_TIER_MAP`.

### 3. Soft hardening (small, no behavior change for happy path)
- `check-subscription` throws (→ 500 + error alert) when caller has no auth header. Return 401 JSON instead so the hook's 5-minute poll doesn't generate noise during logout.
- `create-checkout` `safePath` regex currently allows space — strip space from the allow-list to prevent malformed redirect URLs.

## Files to edit

- `supabase/functions/check-subscription/index.ts` — bug 1, bug 2, 401 instead of throw.
- `supabase/functions/create-checkout/index.ts` — tighten `safePath` regex.

No DB migrations, no new env vars, no client-side changes.

## Verification

1. `supabase--linter` to confirm no new advisories.
2. `supabase--test_edge_functions { functions: ["stripe-webhook"] }` (existing `index_test.ts` covers idempotency, book/autism/audit branches, tier upsert, and PROTECTED_TIERS).
3. Manual log check via `edge_function_logs` for `check-subscription` after deploy to confirm no `tier_synced_from_subscription` events fire for `NO_TIER` products.

Note: the user mentioned "publication IDs" — that's Beehiiv (`BEEHIIV_PUBLICATION_ID`) and unrelated to Stripe. It's still pending from the previous turn; flagging here but not part of this Stripe plan.
