## Verification results

**Finding 1 — `audit_tokens` client-side SELECT:**
- Searched `src/` for `from('audit_tokens')` and `from("audit_tokens")` — **0 hits**.
- Only references are in edge functions (`generate-business-audit`, `stripe-webhook`) which use service_role.
- ✅ Intentional. No client-side query exists.

**Finding 2 — `starter_kit_reports` anon SELECT:**
- `src/pages/StarterKit.tsx` line 55–77: calls `supabase.functions.invoke("generate-starter-report")`, reads `data.report` directly from response, calls `setReport(data.report)`.
- No `supabase.from("starter_kit_reports").select(...)` anywhere in `src/`.
- ✅ Architecture A (response-based). No fix needed.

**Finding 3 — SECURITY DEFINER functions with anon EXECUTE:**

Inspected `pg_proc.proacl` for all 9 SECURITY DEFINER functions in `public`. The `=X/postgres` ACL entry means PUBLIC (which includes anon + authenticated) has EXECUTE.

| Function | PUBLIC EXECUTE? | Required by anon? | Action |
|---|---|---|---|
| `get_audit_by_token` | yes | yes (guest magic link) | **KEEP** |
| `claim_audit_token` | yes | no (requires `auth.uid()`) | **REVOKE from anon, PUBLIC** |
| `has_role` | no | — | none |
| `get_user_tier` | no | — | none |
| `handle_new_user` | no | — | none |
| `update_updated_at_column` | no | — | none |
| `enqueue_email` / `delete_email` / `read_email_batch` / `move_to_dlq` | no | — | none |

Only `claim_audit_token` needs remediation. The other helpers already have PUBLIC revoked (only `authenticated` / `service_role` retain EXECUTE).

## Plan

### Step 1 — Document Finding 1 + 2 as intentional
Add a comment block to the new migration explaining:
- `audit_tokens` has no client SELECT policy by design — all reads go through `get_audit_by_token` (SECURITY DEFINER) or service_role edge functions.
- `starter_kit_reports` has no anon SELECT policy by design — reports are returned in the `generate-starter-report` edge function response.

### Step 2 — Migration: revoke PUBLIC/anon EXECUTE on `claim_audit_token`
```sql
-- Revoke broad EXECUTE; keep authenticated + service_role.
REVOKE EXECUTE ON FUNCTION public.claim_audit_token(text, uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.claim_audit_token(text, uuid) TO authenticated, service_role;

-- Preserve get_audit_by_token anon access (no-op, just affirms intent in migration history).
GRANT  EXECUTE ON FUNCTION public.get_audit_by_token(text) TO anon, authenticated, service_role;
```

### Step 3 — Verify
- Re-query `pg_proc.proacl` after migration to confirm:
  - `claim_audit_token` ACL no longer contains `=X/postgres` or `anon=X/postgres`.
  - `get_audit_by_token` still lists `anon=X/postgres`.
- Run `supabase--linter` to confirm the `0028_anon_security_definer_function_executable` finding is resolved.

### Step 4 — Final markdown report
Per the user's template, with BEFORE/AFTER ACL diffs for `claim_audit_token`.

## What is NOT changing
- No RLS policy changes on any table.
- No edge function changes.
- No auth flow changes.
- `get_audit_by_token` anon EXECUTE preserved.
- `claim_audit_token` remains callable by authenticated users (save-to-account flow intact).
