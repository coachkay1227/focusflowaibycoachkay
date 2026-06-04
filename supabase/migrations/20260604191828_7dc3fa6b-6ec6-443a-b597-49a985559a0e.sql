-- Tighten realtime.messages policy: remove broad 'messages' topic access for anon.
DROP POLICY IF EXISTS "Authenticated can read public realtime topics" ON realtime.messages;

-- Anonymous users: only the public scam_alerts topic.
CREATE POLICY "Anon can subscribe to scam_alerts topic"
  ON realtime.messages
  FOR SELECT
  TO anon
  USING ((realtime.topic()) = 'scam_alerts');

-- Authenticated users: scam_alerts plus their own per-user topic namespace.
CREATE POLICY "Authenticated can subscribe to public and own topics"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    (realtime.topic()) = 'scam_alerts'
    OR (realtime.topic()) LIKE ('user:' || auth.uid()::text || ':%')
  );