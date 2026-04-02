CREATE POLICY "Users can delete own sessions"
ON public.clarity_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);