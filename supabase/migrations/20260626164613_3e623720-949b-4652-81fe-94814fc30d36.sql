
-- app_settings: restrict public SELECT to booking.* keys only
DROP POLICY IF EXISTS "Anyone can read app_settings" ON public.app_settings;

CREATE POLICY "Public can read booking app_settings"
  ON public.app_settings FOR SELECT
  TO anon, authenticated
  USING (key LIKE 'booking.%');

CREATE POLICY "Admins can read all app_settings"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role full read app_settings"
  ON public.app_settings FOR SELECT
  TO service_role
  USING (true);

-- one_time_orders: allow service_role to insert guest/backend orders
CREATE POLICY "one_time_orders_service_insert"
  ON public.one_time_orders FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "one_time_orders_service_update"
  ON public.one_time_orders FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
