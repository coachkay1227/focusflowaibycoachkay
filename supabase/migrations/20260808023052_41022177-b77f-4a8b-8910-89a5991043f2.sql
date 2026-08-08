ALTER TABLE public.business_audits
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending_payment';

UPDATE public.business_audits
  SET status = 'paid'
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS business_audits_status_created_idx
  ON public.business_audits (status, created_at DESC);