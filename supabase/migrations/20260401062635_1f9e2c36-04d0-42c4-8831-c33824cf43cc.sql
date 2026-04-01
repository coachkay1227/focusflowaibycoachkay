
-- module_enrollments table
CREATE TABLE public.module_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id text NOT NULL,
  status text NOT NULL DEFAULT 'enrolled',
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  sessions_count integer DEFAULT 0,
  UNIQUE (user_id, module_id)
);
ALTER TABLE public.module_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own module enrollments" ON public.module_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own module enrollments" ON public.module_enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own module enrollments" ON public.module_enrollments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own module enrollments" ON public.module_enrollments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- challenge_enrollments table
CREATE TABLE public.challenge_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_type text NOT NULL,
  status text NOT NULL DEFAULT 'enrolled',
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (user_id, challenge_type)
);
ALTER TABLE public.challenge_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own challenge enrollments" ON public.challenge_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own challenge enrollments" ON public.challenge_enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenge enrollments" ON public.challenge_enrollments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own challenge enrollments" ON public.challenge_enrollments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_preferences table
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed boolean DEFAULT false,
  primary_goal text,
  coaching_style text,
  selected_modules text[],
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own preferences" ON public.user_preferences FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE TO authenticated USING (auth.uid() = id);
