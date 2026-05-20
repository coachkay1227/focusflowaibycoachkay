CREATE TABLE public.cohort_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  cohort_name text NOT NULL DEFAULT '8-Week Life Transformation',
  source text
);

ALTER TABLE public.cohort_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anonymous and authenticated) to insert registrations
CREATE POLICY "Anyone can register for cohort"
ON public.cohort_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated admin users to view all registrations
CREATE POLICY "Admins can view all cohort registrations"
ON public.cohort_registrations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));