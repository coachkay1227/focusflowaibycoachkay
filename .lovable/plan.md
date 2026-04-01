

# Root Cause Analysis — 5 Critical Bugs

---

## Bug 1: Insight saves as `null` to DB

**Root cause confirmed.** In `ResultScreen.tsx` lines 82–100:

```text
Line 72: setInsight(data as InsightResult)   ← React state update queued
...
Line 82: const session: SessionRecord = { insight: null }   ← insight hardcoded null
...
Line 97-100: setTimeout(() => {
  session.insight = insight;    ← captures stale closure value (still null)
  saveSessionCloud(session);
}, 100);
```

`setInsight()` is async — React batches it. The `setTimeout` at 100ms reads the *closure-captured* `insight` variable, which is still `null` (the old state). The new state hasn't re-rendered yet, and even if it had, the closure captured the old value.

**Downstream impact:** `saveSessionCloud` writes `insight_truth: null, insight_pattern: null, insight_action: null` to `clarity_sessions`. When `pattern-detect` later reads these sessions, every insight is `null`, so the AI gets "No insight generated" for all sessions → garbage pattern analysis.

**Fix:** Don't use `setTimeout`. Use the `data` variable directly (which holds the AI response) instead of reading from React state:

```typescript
const insightData = data as InsightResult;
setInsight(insightData);
// ...
session.insight = insightData;  // use local variable, not state
saveSessionCloud(session);
```

---

## Bug 2: AI edge functions have zero auth

**Root cause confirmed.** All three functions (`clarity-insight`, `coach-chat`, `pattern-detect`) have `verify_jwt = false` in config.toml and perform **no in-code JWT validation**. They only check for `LOVABLE_API_KEY` (a server secret) — not the caller's identity.

Anyone who knows the Supabase project URL can call these endpoints with just the anon key and drain AI credits.

**Fix:** Add JWT validation at the top of each function using `getClaims()`:

```typescript
const authHeader = req.headers.get("Authorization");
if (!authHeader?.startsWith("Bearer ")) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
}
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
  global: { headers: { Authorization: authHeader } },
});
const { data, error } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
if (error || !data?.claims) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
}
```

The frontend already sends the auth header via `supabase.functions.invoke()` — no client changes needed.

---

## Bug 3: `check-subscription` resets manually-assigned tiers to `free`

**Root cause confirmed.** In `check-subscription/index.ts` lines 88–93:

```typescript
} else {
  // Reset to free if no active sub
  await supabaseClient
    .from("user_access_levels")
    .upsert({ id: user.id, tier: "free" }, { onConflict: "id" });
}
```

This runs every 60 seconds (from `useSubscription` polling). Any user who was manually granted `cohort`, `premium`, or `corporate` tier (e.g., admin grant, cohort code, corporate deal) but has no Stripe subscription gets silently downgraded to `free` on every poll.

**Fix:** The function should only **upgrade** tiers based on Stripe, never downgrade manually-set tiers. Two approaches:

- **Option A (simple):** Remove the "reset to free" block entirely. Only write tier when an active subscription IS found. Manual tier assignments persist untouched.
- **Option B (robust):** Add a `source` column to `user_access_levels` (e.g., `stripe`, `manual`, `cohort_code`). Only overwrite if source is `stripe`.

Recommend **Option A** for now — it's a one-line deletion that fixes the immediate problem.

---

## Bug 4: Enrollment upsert missing constraints — **FALSE ALARM**

**Actually not broken.** The migrations DO contain the unique constraints:

- `20260401062635`: `UNIQUE (user_id, module_id)` on `module_enrollments`
- `20260401062635`: `UNIQUE (user_id, challenge_type)` on `challenge_enrollments`
- `20260401062053`: `UNIQUE (user_id, challenge_type)` on `challenge_progress`

The `onConflict` values in `enrollment-store.ts` match these constraints exactly. **Upserts will work correctly.** No fix needed.

---

## Bug 5: Only 1 of 4 Stripe tiers exists

**Root cause confirmed.** `stripe-tiers.ts` only maps `subscriber`:

```typescript
export const STRIPE_TIERS: Partial<Record<AccessTier, TierConfig>> = {
  subscriber: { price_id: "price_1TH...", product_id: "prod_UF...", ... },
};
```

`cohort`, `premium`, `corporate` have no Stripe products/prices. The `ProgramDetail.tsx` CTA falls back to navigating to `/modules` when no tier config is found — a dead end.

**Fix:** Create Stripe products+prices for the remaining tiers (requires user pricing input), then add entries to `STRIPE_TIERS`. Also update `PRODUCT_TIER_MAP` in `check-subscription` to map those product IDs to tiers.

**Blocked on:** User needs to provide pricing for cohort, premium, and corporate tiers.

---

## Summary

| # | Bug | Real? | Fix Complexity |
|---|-----|-------|----------------|
| 1 | Insight saves null | **YES** — stale closure | Small — use local var instead of state |
| 2 | AI endpoints no auth | **YES** — open to internet | Medium — add getClaims() to 3 functions |
| 3 | Tier reset to free | **YES** — every 60s | Small — remove the reset-to-free block |
| 4 | Missing DB constraints | **NO** — constraints exist | None needed |
| 5 | Missing Stripe tiers | **YES** — 3 tiers unpurchasable | Needs user pricing input first |

### Recommended fix order
1. Bug 3 (tier reset) — highest damage, smallest fix
2. Bug 1 (insight null) — corrupts all downstream AI features
3. Bug 2 (auth on edge functions) — security/cost exposure
4. Bug 5 (Stripe tiers) — blocked on pricing decision

