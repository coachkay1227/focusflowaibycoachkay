
-- Threat level enum
CREATE TYPE public.scam_threat_level AS ENUM ('red_flag', 'caution', 'watch', 'resolved');

-- Table
CREATE TABLE public.scam_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  threat_level public.scam_threat_level NOT NULL DEFAULT 'watch',
  category TEXT NOT NULL DEFAULT 'AI scam',
  action_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scam_alerts_published ON public.scam_alerts (is_published, published_at DESC);
CREATE INDEX idx_scam_alerts_threat ON public.scam_alerts (threat_level);

-- Grants
GRANT SELECT ON public.scam_alerts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scam_alerts TO authenticated;
GRANT ALL ON public.scam_alerts TO service_role;

-- RLS
ALTER TABLE public.scam_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published alerts"
  ON public.scam_alerts FOR SELECT
  TO anon, authenticated
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert alerts"
  ON public.scam_alerts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update alerts"
  ON public.scam_alerts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete alerts"
  ON public.scam_alerts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_scam_alerts_updated_at
  BEFORE UPDATE ON public.scam_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.scam_alerts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scam_alerts;

-- Seed starter alerts
INSERT INTO public.scam_alerts (title, slug, summary, body, threat_level, category, action_rules, source_url, is_published, published_at) VALUES
('"AI Millionaire in 7 Days" Coaching Funnels', 'ai-millionaire-7-days', 'Paid ad funnels promising AI-driven income in a week. Almost always upsells into a $2K–$10K mastermind with no refund path.', 'These funnels follow a predictable pattern: free webinar, fake testimonials, false urgency, then a closer call. The "AI" angle is window dressing — the real product is the high-ticket coaching upsell.', 'red_flag', 'Overhyped trend', '["Never pay for a mastermind on the same call as the pitch.", "Search the coach name + ''refund'' and + ''lawsuit'' before buying.", "Ask for a written refund policy. No policy = no payment."]'::jsonb, NULL, true, now()),
('Fake ChatGPT / Gemini Browser Extensions', 'fake-chatgpt-extensions', 'Malicious Chrome/Edge extensions impersonating ChatGPT or Gemini that steal session cookies and hijack social accounts.', 'These extensions ask for "all site data" permission, then exfiltrate auth cookies from Facebook, Google, and bank tabs. Reported repeatedly throughout 2025.', 'red_flag', 'AI scam', '["Only install extensions from the verified publisher (openai.com, google.com).", "Check the review count — under 1000 reviews on an ''AI'' extension is suspect.", "Audit your installed extensions monthly. Remove anything you don''t actively use."]'::jsonb, NULL, true, now()),
('Deepfake "Family Emergency" Voice Calls', 'deepfake-family-emergency', 'Scammers clone a loved one''s voice from social media and call claiming an arrest, accident, or kidnapping that needs immediate wire transfer.', 'Voice cloning now needs only 3 seconds of audio. Targets are usually parents and grandparents. The call always demands secrecy and speed.', 'red_flag', 'AI scam', '["Set a family safe-word that only real family members know.", "Hang up and call the person back on a known number.", "Banks and police never demand gift cards, crypto, or wire transfers."]'::jsonb, NULL, true, now()),
('"Done-For-You AI Agency" Templates', 'done-for-you-ai-agency', 'Course bundles selling Make.com / n8n workflow templates as a "plug-and-play AI agency in a weekend." Templates work; the business model rarely does.', 'The templates themselves are often legitimate. What''s sold as fantasy is the idea that businesses will pay $3K–$10K/month for them without any sales work, niche expertise, or follow-through.', 'caution', 'Overhyped trend', '["Buy the template if you want the workflow. Skip the ''agency'' framing.", "Validate one paid client before quitting anything.", "Anyone selling ''passive AI income'' is selling the dream, not the result."]'::jsonb, NULL, true, now()),
('AI "Productivity Stack" FOMO', 'ai-productivity-stack-fomo', 'The pressure to subscribe to 12+ AI tools to stay competitive. Most people use 2–3 well; the rest become $400/month in unused subscriptions.', 'New tools launch weekly. Influencers stack affiliate links. The honest answer: pick one chat model, one writing tool, one automation platform. Master those before adding more.', 'watch', 'Productivity trap', '["Audit subscriptions quarterly. Cancel anything unused for 30 days.", "Tool count is not the metric. Output is.", "If a tool only saves 5 minutes a week, the mental tax of switching costs more."]'::jsonb, NULL, true, now()),
('Pig-Butchering Crypto + AI Trading Bots', 'pig-butchering-ai-bots', 'Romance-style long-cons where the scammer eventually offers access to an "AI trading bot" on a fake exchange. Funds are unrecoverable.', 'The pattern: weeks of friendly DMs, then a "secret" investment platform, small wins to build trust, then a request for a large deposit. The platform is fake.', 'red_flag', 'AI scam', '["No legitimate trading platform is shared via DM by someone you met online.", "Withdraw a small amount early. If the platform blocks or delays it, walk away.", "If you''re asked to pay ''tax'' to withdraw your own funds, you''ve been scammed. Stop sending money."]'::jsonb, NULL, true, now());
