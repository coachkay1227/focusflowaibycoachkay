DROP POLICY IF EXISTS agent_orders_owner_insert ON public.agent_orders;
CREATE POLICY agent_orders_owner_insert ON public.agent_orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY agent_orders_service_insert ON public.agent_orders
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY one_time_orders_service_select ON public.one_time_orders
  FOR SELECT TO service_role
  USING (true);