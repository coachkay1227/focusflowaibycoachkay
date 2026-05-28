-- Restrict Realtime channel subscriptions.
-- Without RLS on realtime.messages any authenticated user can subscribe to
-- any channel topic. Enabling RLS + adding an explicit allowlist means only
-- the scam_alerts_feed channel (the only one this app publishes) is reachable.
-- All other channel names are denied by default.

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Any authenticated user may receive messages on the public scam alerts feed.
CREATE POLICY "authenticated_read_scam_alerts_feed"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (realtime.topic() = 'scam_alerts_feed');
