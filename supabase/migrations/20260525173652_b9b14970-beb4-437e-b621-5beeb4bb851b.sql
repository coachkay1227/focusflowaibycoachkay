
-- Restrict has_role: require caller is acting on their own user_id (or is service_role).
-- This keeps RLS policies (which pass auth.uid()) working while preventing
-- authenticated users from probing other users' roles via RPC.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (_user_id = auth.uid() OR auth.role() = 'service_role')
  )
$function$;

-- Restrict get_user_tier the same way
CREATE OR REPLACE FUNCTION public.get_user_tier(_user_id uuid)
RETURNS access_tier
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT tier FROM public.user_access_levels
      WHERE id = _user_id
        AND (_user_id = auth.uid() OR auth.role() = 'service_role')),
    'free'::access_tier
  )
$function$;

-- Revoke broad execute, grant to roles that actually need it
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_tier(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_tier(uuid) TO authenticated, service_role;
