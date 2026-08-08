CREATE TABLE public.task_force_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) <= 255),
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 2000),
  source text NOT NULL DEFAULT 'cbus-ai-task-force',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'invited', 'declined')),
  admin_notes text CHECK (admin_notes IS NULL OR char_length(admin_notes) <= 4000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.task_force_invitations TO authenticated;
GRANT ALL ON public.task_force_invitations TO service_role;

ALTER TABLE public.task_force_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view task force invitations"
ON public.task_force_invitations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update task force invitations"
ON public.task_force_invitations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER task_force_invitations_set_updated_at
BEFORE UPDATE ON public.task_force_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX task_force_invitations_created_at_idx
ON public.task_force_invitations (created_at DESC);

CREATE INDEX task_force_invitations_status_idx
ON public.task_force_invitations (status, created_at DESC);