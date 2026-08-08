-- Post-purchase nurture sequence for audit buyers.

ALTER TABLE public.business_audits
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS sms_consent_at timestamp with time zone;

CREATE TABLE public.nurture_touches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id uuid NOT NULL REFERENCES public.business_audits(id) ON DELETE CASCADE,
  email text NOT NULL,
  step integer NOT NULL,
  template_name text NOT NULL,
  scheduled_for timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  sent_at timestamp with time zone,
  last_error text,
  is_test boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT nurture_touches_step_valid CHECK (step IN (1, 3, 7)),
  CONSTRAINT nurture_touches_status_valid CHECK (status IN ('pending', 'sent', 'skipped', 'failed')),
  CONSTRAINT nurture_touches_unique_step UNIQUE (audit_id, step)
);

-- The worker runs as service_role; admins read through the dashboard.
-- No anon or authenticated grants: buyers never read this queue directly.
GRANT SELECT ON public.nurture_touches TO authenticated;
GRANT ALL ON public.nurture_touches TO service_role;

ALTER TABLE public.nurture_touches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view nurture touches"
  ON public.nurture_touches FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages nurture touches"
  ON public.nurture_touches FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER nurture_touches_set_updated_at
  BEFORE UPDATE ON public.nurture_touches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- The worker's hot path: find due, pending, non-test rows.
CREATE INDEX nurture_touches_due_idx
  ON public.nurture_touches (scheduled_for)
  WHERE status = 'pending' AND is_test = false;