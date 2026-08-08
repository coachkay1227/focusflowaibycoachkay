ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS buyer_onboarding_completed_at timestamp with time zone;

COMMENT ON COLUMN public.user_preferences.buyer_onboarding_completed_at IS
  'Set when the buyer completed or dismissed the /start onboarding flow. NULL means it has not been seen yet.';