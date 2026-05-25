CREATE TABLE public.mac_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  guest_email text NULL,
  guest_name text NULL,
  answers jsonb NOT NULL,
  code text NOT NULL,
  ai_insight jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mac_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert mac assessments"
  ON public.mac_assessments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own mac assessments"
  ON public.mac_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all mac assessments"
  ON public.mac_assessments
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_mac_assessments_user ON public.mac_assessments(user_id);
CREATE INDEX idx_mac_assessments_created ON public.mac_assessments(created_at DESC);

-- Starter Kit reports storage
CREATE TABLE public.starter_kit_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  email text NOT NULL,
  name text NULL,
  business_type text NOT NULL,
  bottleneck text NOT NULL,
  report jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.starter_kit_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert starter kit reports"
  ON public.starter_kit_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own starter kit reports"
  ON public.starter_kit_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all starter kit reports"
  ON public.starter_kit_reports
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_starter_kit_reports_user ON public.starter_kit_reports(user_id);
CREATE INDEX idx_starter_kit_reports_created ON public.starter_kit_reports(created_at DESC);