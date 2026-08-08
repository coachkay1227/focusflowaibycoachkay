INSERT INTO public.user_access_levels (id, tier)
SELECT u.id, 'free'::access_tier
FROM auth.users u
LEFT JOIN public.user_access_levels ual ON ual.id = u.id
WHERE ual.id IS NULL;