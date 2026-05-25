
-- business_audits
CREATE TABLE public.business_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email text,
  guest_name text,
  stripe_session_id text UNIQUE,
  intake jsonb NOT NULL DEFAULT '{}'::jsonb,
  report jsonb,
  recommended_offer text,
  generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_business_audits_user ON public.business_audits(user_id);
CREATE INDEX idx_business_audits_session ON public.business_audits(stripe_session_id);

ALTER TABLE public.business_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert business audits"
  ON public.business_audits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can insert business audits"
  ON public.business_audits FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Owners can view own audits"
  ON public.business_audits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audits"
  ON public.business_audits FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can update audits"
  ON public.business_audits FOR UPDATE
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- audit_tokens
CREATE TABLE public.audit_tokens (
  token text PRIMARY KEY,
  audit_id uuid NOT NULL REFERENCES public.business_audits(id) ON DELETE CASCADE,
  email text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 days'),
  claimed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_tokens_audit ON public.audit_tokens(audit_id);

ALTER TABLE public.audit_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages audit tokens"
  ON public.audit_tokens
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- get_audit_by_token: returns audit row when token is valid + unexpired
CREATE OR REPLACE FUNCTION public.get_audit_by_token(p_token text)
RETURNS SETOF public.business_audits
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.*
  FROM public.business_audits a
  JOIN public.audit_tokens t ON t.audit_id = a.id
  WHERE t.token = p_token
    AND t.expires_at > now()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_audit_by_token(text) TO anon, authenticated;

-- claim_audit_token: link a guest audit to a logged-in user
CREATE OR REPLACE FUNCTION public.claim_audit_token(p_token text, p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id uuid;
BEGIN
  SELECT audit_id INTO v_audit_id
  FROM public.audit_tokens
  WHERE token = p_token AND expires_at > now()
  LIMIT 1;

  IF v_audit_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.audit_tokens
  SET claimed_by_user_id = p_user_id
  WHERE token = p_token;

  UPDATE public.business_audits
  SET user_id = p_user_id
  WHERE id = v_audit_id AND user_id IS NULL;

  RETURN v_audit_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_audit_token(text, uuid) TO authenticated;
