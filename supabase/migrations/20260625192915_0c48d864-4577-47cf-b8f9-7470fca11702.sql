CREATE POLICY "agent_orders_admin_select"
  ON public.agent_orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "one_time_orders_admin_select"
  ON public.one_time_orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));