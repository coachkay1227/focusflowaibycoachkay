## Security scan result: 0 critical, 8 warnings

The earlier critical fixes held. The remaining items are all `warn` level — none are exploitable today, but here is the plan to clear them so the scan goes green.

### 1. SECURITY DEFINER functions callable by anon/authenticated (5 findings)
Several `SECURITY DEFINER` functions in the `public` schema have default `EXECUTE` to `PUBLIC`. They're safe (each gates on `auth.uid()` or service role internally) but the linter flags broad EXECUTE grants.

Fix via new migration:
- `REVOKE EXECUTE ... FROM PUBLIC, anon` on each flagged function.
- `GRANT EXECUTE ... TO authenticated, service_role` only where the app actually calls them (e.g. `has_role`, `get_user_tier`).
- For ones only the backend should call, grant to `service_role` only.

### 2. `autism_orders` guest rows invisible to buyer (warn)
No exploit — guest rows are admin-only by design. Document via `security--update_memory` that guest order retrieval is intentionally admin/service-role only (no token link flow exists), then mark finding as acceptable.

### 3. `business_audits` guest rows (warn)
Same shape: confirmed token flow is the only guest retrieval path. Document in security memory and mark acceptable.

### 4. `content_settings` no service_role write policy (warn)
Add a policy:
```sql
CREATE POLICY "service_role manages content_settings"
  ON public.content_settings FOR ALL
  TO service_role USING (true) WITH CHECK (true);
```

### Verification
- Re-run `security--run_security_scan` — expect 0 critical, near-zero warns.
- Confirm no build errors (Vite already clean per dev log).
- Then publish.

### Files touched
- New migration: `supabase/migrations/<ts>_tighten_definer_grants_and_content_settings.sql`
- `security--update_memory` to note accepted guest-data warnings.

No frontend or edge function code changes required.