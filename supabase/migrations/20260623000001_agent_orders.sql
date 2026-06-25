CREATE TABLE IF NOT EXISTS agent_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email TEXT,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('gpt', 'claude', 'ghl')),
  agent_tier TEXT NOT NULL CHECK (agent_tier IN ('single', 'bundle', 'agency')),
  agent_count INTEGER NOT NULL DEFAULT 1,
  ownership_pref TEXT CHECK (ownership_pref IN ('own', 'hosted')),
  knowledge_base TEXT CHECK (knowledge_base IN ('none', 'basic', 'full')),
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'intake_submitted', 'in_progress', 'delivered', 'cancelled')),
  intake JSONB,
  quoted_price_cents INTEGER,
  notes TEXT
);

ALTER TABLE agent_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agent orders"
  ON agent_orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON agent_orders FOR ALL TO service_role
  USING (true);
