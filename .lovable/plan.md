

# Fix All Build Errors

There are **4 categories** of build errors to fix. No testing can happen until these are resolved.

---

## 1. Edge Function Import — `npm:@supabase/supabase-js@2.57.2`

**Problem**: All 6 edge functions use `npm:@supabase/supabase-js@2.57.2` which Deno can't resolve without `nodeModulesDir` config.

**Fix**: Change all 6 files to use the ESM import instead:
```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
```

**Files**: `check-subscription`, `coach-chat`, `create-checkout`, `customer-portal`, `pattern-detect`, `stripe-webhook`

---

## 2. Type Casting in `enrollment-store.ts`

**Problem**: Supabase returns `status` as `string`, but our interfaces expect `"enrolled" | "in_progress" | "completed"`.

**Fix**: Cast `row.status` in both `getModuleEnrollments` (line 42) and `getChallengeEnrollments` (line 129):
```typescript
status: row.status as ModuleEnrollment["status"],
```

---

## 3. Type Issues in `session-store.ts`

**Problem**: Multiple type mismatches between `Json`, `Record<string, unknown>`, and `ClarityAnswers`.

**Fix**:
- Line 87-88: Pass insert as a single object (not array), cast `answers` to `Json`
- Line 110-120: Remove custom `ClaritySessionRow` interface, use Supabase's inferred type, cast `answers` as `ClarityAnswers`
- Lines 178, 185: Cast `entries` and `challengeData.entries` properly to `Json`

---

## 4. Frontend Component Errors

### `Profile.tsx` (line 34-36)
**Problem**: `loadProfile` used before declaration — `useCallback` is defined after the `useEffect` that references it.

**Fix**: Move the `useEffect` below the `useCallback` declarations, or wrap `loadProfile` call differently.

### `AdminContent.tsx` (lines 195, 199, 224)
**Problem**: Accessing `.sessions` and `.week` on `CoachingModule` (which doesn't have them), and `.modules` on `Program` (which doesn't have it).

**Fix**: 
- `mod.sessions.length` → `mod.questions.length` (modules have `questions`, not `sessions`)
- `mod.week` → remove or replace with `mod.duration`
- `program.modules` → `program.tags` or remove (Program interface has no `modules` field)

---

## Summary

| File | Error | Fix |
|------|-------|-----|
| 6 edge functions | `npm:` import | Switch to `https://esm.sh/` |
| `enrollment-store.ts` | status type | Cast to union type |
| `session-store.ts` | Json vs Record types | Proper type casting |
| `Profile.tsx` | Variable used before declaration | Reorder hooks |
| `AdminContent.tsx` | Non-existent properties | Use correct property names |

After these fixes, the build will pass and we can verify the mobile nav, coach chat, and animations.

