ALTER TABLE public.email_delivery_retries
  ADD COLUMN IF NOT EXISTS source_ref text;

COMMENT ON COLUMN public.email_delivery_retries.source_ref IS
  'Non-uuid source reference (e.g. a Stripe checkout session id) used to rebuild the email payload on retry.';

CREATE INDEX IF NOT EXISTS email_delivery_retries_source_ref_idx
  ON public.email_delivery_retries (source_ref);