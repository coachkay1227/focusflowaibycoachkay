

# Security Scan Fixes

Two warnings found — both are quick fixes.

---

## Fix 1: Enable Leaked Password Protection

This is a configuration change, not a code change. You need to:
1. Open Lovable Cloud → Users → Auth Settings
2. Under Email settings, toggle on **Password HIBP Check**

This prevents users from signing up with passwords found in known data breaches.

## Fix 2: Add DELETE Policy to `clarity_sessions`

**What:** Users currently cannot delete their own clarity session records. For data privacy (GDPR right to erasure), they should be able to.

**Change:** A single database migration adding a DELETE RLS policy:

```sql
CREATE POLICY "Users can delete own sessions"
ON public.clarity_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

No code changes needed — the policy alone enables deletion. A "delete session" UI can be added later if desired.

---

## Summary

| Finding | Severity | Fix Type | Effort |
|---------|----------|----------|--------|
| Leaked password protection disabled | WARN | Config toggle | 30 sec |
| No DELETE on clarity_sessions | WARN | DB migration | 1 min |

No critical or high-severity issues. RLS, auth, and edge function security are all solid.

