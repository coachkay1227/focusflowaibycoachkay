-- Remove dead Lovable Email queue plumbing.
-- All email sending happens via Resend directly from edge functions
-- (send-transactional-email, auth-email-hook, apply-now, send-email)
-- using the verified domain noreply@coachkayai.life.
--
-- The pgmq-based queue, the process-email-queue cron job, and
-- email_send_state were leftover scaffolding from Lovable Emails
-- and were never invoked. Keeping suppressed_emails,
-- email_unsubscribe_tokens, and email_send_log — those are actively
-- read/written by the Resend send path.

-- 1. Drop the pg_cron job if it exists.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'process-email-queue';
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- ignore if cron schema not present
  NULL;
END $$;

-- 2. Drop the vault secret used by the cron job.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_namespace WHERE nspname = 'vault'
  ) THEN
    DELETE FROM vault.secrets WHERE name = 'email_queue_service_role_key';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 3. Drop the queue RPC wrappers (no callers remain).
DROP FUNCTION IF EXISTS public.enqueue_email(text, jsonb);
DROP FUNCTION IF EXISTS public.read_email_batch(text, integer, integer);
DROP FUNCTION IF EXISTS public.delete_email(text, bigint);
DROP FUNCTION IF EXISTS public.move_to_dlq(text, text, bigint, jsonb);

-- 4. Drop the pgmq queues if they exist.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'pgmq') THEN
    BEGIN PERFORM pgmq.drop_queue('auth_emails'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN PERFORM pgmq.drop_queue('transactional_emails'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN PERFORM pgmq.drop_queue('auth_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN PERFORM pgmq.drop_queue('transactional_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
END $$;

-- 5. Drop the dead state table (only the dispatcher read/wrote it).
DROP TABLE IF EXISTS public.email_send_state;
