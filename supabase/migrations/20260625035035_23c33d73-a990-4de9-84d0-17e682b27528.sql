
-- 1. newsletter_issues table
CREATE TABLE public.newsletter_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_number integer NOT NULL,
  subject text NOT NULL,
  preview_text text,
  scam_alert_id uuid REFERENCES public.scam_alerts(id) ON DELETE SET NULL,
  scam_section text NOT NULL,
  truth_section text NOT NULL,
  play_section text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','sent','skipped')),
  approval_token_hash text,
  token_expires_at timestamptz,
  sent_at timestamptz,
  sent_count integer NOT NULL DEFAULT 0,
  suppressed_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issue_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_issues TO authenticated;
GRANT ALL ON public.newsletter_issues TO service_role;

ALTER TABLE public.newsletter_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read newsletter issues"
  ON public.newsletter_issues FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update newsletter issues"
  ON public.newsletter_issues FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER newsletter_issues_updated_at
  BEFORE UPDATE ON public.newsletter_issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX newsletter_issues_status_idx ON public.newsletter_issues(status);
CREATE INDEX newsletter_issues_token_hash_idx ON public.newsletter_issues(approval_token_hash) WHERE approval_token_hash IS NOT NULL;

-- 2. Mark scam alerts that have been used in an issue
ALTER TABLE public.scam_alerts ADD COLUMN used_in_issue_id uuid REFERENCES public.newsletter_issues(id) ON DELETE SET NULL;
CREATE INDEX scam_alerts_used_in_issue_idx ON public.scam_alerts(used_in_issue_id);
