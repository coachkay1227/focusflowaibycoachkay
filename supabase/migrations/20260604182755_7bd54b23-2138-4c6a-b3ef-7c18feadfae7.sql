
-- 1. Tighten EXECUTE on SECURITY DEFINER functions in public schema.
-- has_role and get_user_tier: legitimately called by signed-in users; revoke anon.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_user_tier(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_tier(uuid) TO authenticated, service_role;

-- claim_audit_token: only authenticated users claim their own audit.
REVOKE EXECUTE ON FUNCTION public.claim_audit_token(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_audit_token(text, uuid) TO authenticated, service_role;

-- get_audit_by_token: token-gated guest retrieval path — must remain callable by anon.
REVOKE EXECUTE ON FUNCTION public.get_audit_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_audit_by_token(text) TO anon, authenticated, service_role;

-- handle_new_user and update_updated_at_column: trigger-only, no API callers.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 2. content_settings: allow service_role full management for backend updates.
DROP POLICY IF EXISTS "service_role manages content_settings" ON public.content_settings;
CREATE POLICY "service_role manages content_settings"
  ON public.content_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.content_settings TO service_role;
