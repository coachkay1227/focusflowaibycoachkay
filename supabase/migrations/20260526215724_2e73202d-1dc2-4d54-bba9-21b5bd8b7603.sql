
-- 1. Add explicit service-role-only INSERT policy to autism_orders + book_orders
CREATE POLICY "Service role can insert autism orders"
  ON public.autism_orders FOR INSERT TO public
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update autism orders"
  ON public.autism_orders FOR UPDATE TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert book orders"
  ON public.book_orders FOR INSERT TO public
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update book orders"
  ON public.book_orders FOR UPDATE TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 2. Replace "Anyone can insert" with service-role-only on backend-fed tables
DROP POLICY IF EXISTS "Anyone can insert business audits" ON public.business_audits;
DROP POLICY IF EXISTS "Anyone can insert mac assessments" ON public.mac_assessments;
DROP POLICY IF EXISTS "Anyone can insert starter kit reports" ON public.starter_kit_reports;

CREATE POLICY "Service role can insert mac assessments"
  ON public.mac_assessments FOR INSERT TO public
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert starter kit reports"
  ON public.starter_kit_reports FOR INSERT TO public
  WITH CHECK (auth.role() = 'service_role');

-- 3. Tighten cohort_registrations - keep anon insert but validate email format
DROP POLICY IF EXISTS "Anyone can register for cohort" ON public.cohort_registrations;
CREATE POLICY "Anyone can register for cohort"
  ON public.cohort_registrations FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) BETWEEN 5 AND 320
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

-- 4. Tighten analytics_events - keep anon insert but require non-empty event
DROP POLICY IF EXISTS "anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "anyone can insert analytics events"
  ON public.analytics_events FOR INSERT TO anon, authenticated
  WITH CHECK (
    event IS NOT NULL
    AND length(event) BETWEEN 1 AND 100
  );
