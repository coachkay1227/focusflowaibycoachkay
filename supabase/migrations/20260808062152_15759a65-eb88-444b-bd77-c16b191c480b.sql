CREATE TABLE public.ai_call_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name text NOT NULL,
  identity_key text NOT NULL,
  authenticated boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.ai_call_events TO service_role;

ALTER TABLE public.ai_call_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read ai call events"
ON public.ai_call_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX ai_call_events_lookup_idx
ON public.ai_call_events (function_name, identity_key, created_at DESC);

CREATE INDEX ai_call_events_created_at_idx
ON public.ai_call_events (created_at DESC);