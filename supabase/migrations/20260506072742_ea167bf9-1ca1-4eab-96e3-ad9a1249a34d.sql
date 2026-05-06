CREATE TABLE IF NOT EXISTS public.webhook_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  event_id text,
  event_type text,
  stage text NOT NULL,
  reason text NOT NULL,
  message text,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS webhook_failures_source_created_idx
  ON public.webhook_failures (source, created_at DESC);
CREATE INDEX IF NOT EXISTS webhook_failures_reason_created_idx
  ON public.webhook_failures (reason, created_at DESC);

ALTER TABLE public.webhook_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages webhook failures"
  ON public.webhook_failures
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.webhook_alert_state (
  source text PRIMARY KEY,
  last_alert_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_alert_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages webhook alert state"
  ON public.webhook_alert_state
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');