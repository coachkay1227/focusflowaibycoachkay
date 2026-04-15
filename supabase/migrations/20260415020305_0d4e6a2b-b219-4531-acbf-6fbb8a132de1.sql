
CREATE TABLE public.content_settings (
  id TEXT NOT NULL PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  custom_tagline TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_settings ENABLE ROW LEVEL SECURITY;

-- Only service role (edge functions) manages this table; no direct user access
CREATE POLICY "No direct user access to content_settings"
  ON public.content_settings
  FOR ALL
  TO authenticated
  USING (false);
