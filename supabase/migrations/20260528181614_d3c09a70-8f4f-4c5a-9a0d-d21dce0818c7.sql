-- Enable RLS on realtime.messages and restrict channel subscriptions to known public topics.
-- Only the 'scam_alerts' topic (and postgres_changes for the public.scam_alerts table) is exposed today.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read public realtime topics" ON realtime.messages;
CREATE POLICY "Authenticated can read public realtime topics"
ON realtime.messages
FOR SELECT
TO authenticated, anon
USING (
  realtime.topic() IN ('scam_alerts', 'messages')
);
