-- Content visibility settings for admin panel
-- Allows Coach Kay to toggle modules/programs on/off without code changes

CREATE TABLE IF NOT EXISTS public.content_settings (
  id text PRIMARY KEY,
  enabled boolean DEFAULT true NOT NULL,
  featured boolean DEFAULT false NOT NULL,
  custom_tagline text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.content_settings ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read (for content gating on client side)
CREATE POLICY "Authenticated users can read content settings"
  ON public.content_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can write (admin edge function)
CREATE POLICY "Service role can manage content settings"
  ON public.content_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
