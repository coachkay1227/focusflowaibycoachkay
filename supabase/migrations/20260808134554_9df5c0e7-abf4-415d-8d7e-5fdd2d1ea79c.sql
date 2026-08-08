CREATE OR REPLACE FUNCTION public.is_privileged_caller()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.role() = 'service_role'
      OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'));
$$;

REVOKE ALL ON FUNCTION public.is_privileged_caller() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_privileged_caller() TO anon, authenticated, service_role;