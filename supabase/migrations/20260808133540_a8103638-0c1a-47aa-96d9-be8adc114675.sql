CREATE TABLE public.email_delivery_retries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  source_id UUID,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 4,
  next_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  failure_class TEXT,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT email_delivery_retries_status_check
    CHECK (status IN ('pending', 'sent', 'exhausted', 'parked')),
  CONSTRAINT email_delivery_retries_attempts_check
    CHECK (attempts >= 0 AND attempts <= max_attempts)
);

GRANT SELECT, UPDATE ON public.email_delivery_retries TO authenticated;
GRANT ALL ON public.email_delivery_retries TO service_role;

ALTER TABLE public.email_delivery_retries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view delivery retries"
  ON public.email_delivery_retries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can adjust delivery retries"
  ON public.email_delivery_retries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages delivery retries"
  ON public.email_delivery_retries FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX email_delivery_retries_due_idx
  ON public.email_delivery_retries (next_attempt_at)
  WHERE status = 'pending';

CREATE INDEX email_delivery_retries_status_idx
  ON public.email_delivery_retries (status, created_at DESC);

CREATE TRIGGER email_delivery_retries_set_updated_at
  BEFORE UPDATE ON public.email_delivery_retries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();