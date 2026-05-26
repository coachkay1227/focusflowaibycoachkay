-- Security hardening for SECURITY DEFINER function execute grants.
--
-- Context (verified before this migration):
--   * audit_tokens has no client-side SELECT policy by design. All reads go
--     through public.get_audit_by_token (SECURITY DEFINER) for guests, or
--     through edge functions running as service_role. No src/ code queries
--     audit_tokens directly.
--   * starter_kit_reports has no anon SELECT policy by design. The
--     generate-starter-report edge function returns the full report object
--     in its response; src/pages/StarterKit.tsx renders from that response
--     and never re-fetches via supabase.from('starter_kit_reports').
--
-- Linter finding 0028_anon_security_definer_function_executable: only
-- claim_audit_token still had PUBLIC EXECUTE. It requires auth.uid() to do
-- anything useful, so anon never needs it. get_audit_by_token MUST remain
-- callable by anon for the guest magic-link flow.

REVOKE EXECUTE ON FUNCTION public.claim_audit_token(text, uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.claim_audit_token(text, uuid) TO authenticated, service_role;

-- Affirm intent for get_audit_by_token (no behavior change).
GRANT  EXECUTE ON FUNCTION public.get_audit_by_token(text) TO anon, authenticated, service_role;