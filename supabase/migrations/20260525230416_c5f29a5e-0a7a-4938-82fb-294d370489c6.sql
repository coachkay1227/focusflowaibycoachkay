-- Harden claim_audit_token: enforce auth.uid() instead of trusting caller-supplied id.
CREATE OR REPLACE FUNCTION public.claim_audit_token(p_token text, p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id uuid;
  v_caller uuid;
BEGIN
  v_caller := auth.uid();
  IF v_caller IS NULL THEN
    RETURN NULL;
  END IF;
  -- p_user_id is accepted for backwards compatibility but ignored.
  -- The audit can only be linked to the authenticated caller.

  SELECT audit_id INTO v_audit_id
  FROM public.audit_tokens
  WHERE token = p_token AND expires_at > now()
  LIMIT 1;

  IF v_audit_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.audit_tokens
  SET claimed_by_user_id = v_caller
  WHERE token = p_token
    AND claimed_by_user_id IS NULL;

  UPDATE public.business_audits
  SET user_id = v_caller
  WHERE id = v_audit_id AND user_id IS NULL;

  RETURN v_audit_id;
END;
$$;