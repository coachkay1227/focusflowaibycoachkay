-- =========================================================
-- 1. one_time_orders (advisory + build_studio one-time purchases)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.one_time_orders (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text        UNIQUE NOT NULL,
  user_id           uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email       text,
  guest_name        text,
  product_id        text        NOT NULL,
  product_name      text        NOT NULL,
  price_cents       integer     NOT NULL DEFAULT 0,
  product_type      text        NOT NULL DEFAULT 'build_studio'
                                CHECK (product_type IN ('build_studio', 'advisory')),
  order_type        text        NOT NULL DEFAULT 'one_time'
                                CHECK (order_type IN ('one_time', 'subscription')),
  status            text        NOT NULL DEFAULT 'confirmed'
                                CHECK (status IN ('confirmed', 'in_progress', 'delivered', 'cancelled')),
  intake            jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.one_time_orders TO authenticated;
GRANT ALL ON public.one_time_orders TO service_role;

ALTER TABLE public.one_time_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "one_time_orders_owner_select"
  ON public.one_time_orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "one_time_orders_owner_insert"
  ON public.one_time_orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "one_time_orders_owner_update"
  ON public.one_time_orders FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS one_time_orders_user_id_idx
  ON public.one_time_orders (user_id);
CREATE INDEX IF NOT EXISTS one_time_orders_created_at_idx
  ON public.one_time_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS one_time_orders_product_type_idx
  ON public.one_time_orders (product_type);

CREATE TRIGGER one_time_orders_set_updated_at
  BEFORE UPDATE ON public.one_time_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 2. agent_orders (Rent-an-Agent purchases)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.agent_orders (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email         text,
  agent_type          text        NOT NULL CHECK (agent_type IN ('gpt', 'claude', 'ghl')),
  agent_tier          text        NOT NULL CHECK (agent_tier IN ('single', 'bundle', 'agency')),
  agent_count         integer     NOT NULL DEFAULT 1,
  ownership_pref      text        CHECK (ownership_pref IN ('own', 'hosted')),
  knowledge_base      text        CHECK (knowledge_base IN ('none', 'basic', 'full')),
  stripe_session_id   text,
  status              text        NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'intake_submitted', 'in_progress', 'delivered', 'cancelled')),
  intake              jsonb,
  quoted_price_cents  integer,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_orders TO authenticated;
GRANT ALL ON public.agent_orders TO service_role;

ALTER TABLE public.agent_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_orders_owner_select"
  ON public.agent_orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "agent_orders_owner_insert"
  ON public.agent_orders FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "agent_orders_owner_update"
  ON public.agent_orders FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS agent_orders_user_id_idx
  ON public.agent_orders (user_id);
CREATE INDEX IF NOT EXISTS agent_orders_created_at_idx
  ON public.agent_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS agent_orders_status_idx
  ON public.agent_orders (status);

CREATE TRIGGER agent_orders_set_updated_at
  BEFORE UPDATE ON public.agent_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 3. Prune admin role to designated primary admin only.
-- Removes any stray admin rows that don't belong to
-- Hello@coachkayelevates.org. Safe to re-run.
-- =========================================================
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id NOT IN (
    SELECT id FROM auth.users
    WHERE lower(email) = 'hello@coachkayelevates.org'
  );
