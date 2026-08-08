INSERT INTO public.app_settings (key, value)
VALUES ('leadgen.offer_url', '')
ON CONFLICT (key) DO NOTHING;

CREATE POLICY "Public can read leadgen app_settings"
ON public.app_settings
FOR SELECT
TO anon, authenticated
USING (key LIKE 'leadgen.%');