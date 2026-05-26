
DROP POLICY IF EXISTS "anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "anyone can insert analytics events"
  ON public.analytics_events FOR INSERT TO anon, authenticated
  WITH CHECK (
    event IS NOT NULL
    AND length(event) BETWEEN 1 AND 100
    AND (user_id IS NULL OR user_id = auth.uid())
  );
