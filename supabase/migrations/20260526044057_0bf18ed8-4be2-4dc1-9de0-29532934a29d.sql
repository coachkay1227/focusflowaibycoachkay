CREATE TABLE public.autism_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  use_case text NOT NULL,
  child_first_name text,
  child_age text,
  child_interests text,
  scenario_focus text NOT NULL,
  special_requirements text,
  provider_name text,
  provider_email text,
  package_slug text NOT NULL,
  package_name text NOT NULL,
  package_price integer NOT NULL,
  addons jsonb NOT NULL DEFAULT '[]'::jsonb,
  addons_total integer NOT NULL DEFAULT 0,
  gift_wrap boolean NOT NULL DEFAULT false,
  gift_recipient text,
  gift_note text,
  order_total integer NOT NULL,
  stripe_session_id text,
  stripe_payment_intent_id text,
  status text NOT NULL DEFAULT 'pending_payment',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.autism_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own autism orders"
  ON public.autism_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all autism orders"
  ON public.autism_orders FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_autism_orders_updated_at
  BEFORE UPDATE ON public.autism_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_autism_orders_user_id ON public.autism_orders(user_id);
CREATE INDEX idx_autism_orders_stripe_session_id ON public.autism_orders(stripe_session_id);
CREATE INDEX idx_autism_orders_status ON public.autism_orders(status);

-- =============================================
-- RLS FIX: Enable Row Level Security on realtime.messages
-- Fixes: Any authenticated user can subscribe to any channel
-- =============================================
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DO $fixrls$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'realtime' AND tablename = 'messages' AND policyname = 'authenticated can read scam_alerts') THEN
    CREATE POLICY "authenticated can read scam_alerts"
    ON realtime.messages FOR SELECT TO authenticated
    USING (realtime.topic() = 'scam_alerts');
  END IF;
END $fixrls$;

DO $fixsvc$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'realtime' AND tablename = 'messages' AND policyname = 'service_role full access realtime') THEN
    CREATE POLICY "service_role full access realtime"
    ON realtime.messages FOR ALL TO service_role
    USING (true) WITH CHECK (true);
  END IF;
END $fixsvc$;