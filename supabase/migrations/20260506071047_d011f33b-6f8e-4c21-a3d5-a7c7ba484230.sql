CREATE POLICY "No direct inserts on user_roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "No direct updates on user_roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No direct deletes on user_roles" ON public.user_roles
  FOR DELETE TO authenticated USING (false);