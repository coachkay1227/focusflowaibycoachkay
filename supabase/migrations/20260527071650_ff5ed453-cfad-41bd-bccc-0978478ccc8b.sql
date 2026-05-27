
CREATE TABLE public.build_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  project_type TEXT NOT NULL,
  tier TEXT NOT NULL,
  budget_range TEXT,
  timeline TEXT,
  notes TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.build_inquiries TO anon, authenticated;
GRANT SELECT ON public.build_inquiries TO authenticated;
GRANT ALL ON public.build_inquiries TO service_role;

ALTER TABLE public.build_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a build inquiry"
ON public.build_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL AND length(name) BETWEEN 1 AND 200
  AND email IS NOT NULL AND length(email) BETWEEN 5 AND 320
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND project_type IS NOT NULL
  AND tier IS NOT NULL
);

CREATE POLICY "Admins can view all build inquiries"
ON public.build_inquiries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can update build inquiries"
ON public.build_inquiries
FOR UPDATE
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_build_inquiries_updated_at
BEFORE UPDATE ON public.build_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_build_inquiries_status ON public.build_inquiries(status);
CREATE INDEX idx_build_inquiries_created_at ON public.build_inquiries(created_at DESC);
