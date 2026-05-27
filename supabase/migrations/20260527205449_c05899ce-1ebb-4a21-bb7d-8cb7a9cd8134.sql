DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'process-email-queue';
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'vault') THEN
    DELETE FROM vault.secrets WHERE name = 'email_queue_service_role_key';
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DROP FUNCTION IF EXISTS public.enqueue_email(text, jsonb);
DROP FUNCTION IF EXISTS public.read_email_batch(text, integer, integer);
DROP FUNCTION IF EXISTS public.delete_email(text, bigint);
DROP FUNCTION IF EXISTS public.move_to_dlq(text, text, bigint, jsonb);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'pgmq') THEN
    BEGIN PERFORM pgmq.drop_queue('auth_emails'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN PERFORM pgmq.drop_queue('transactional_emails'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN PERFORM pgmq.drop_queue('auth_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN PERFORM pgmq.drop_queue('transactional_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
END $$;

DROP TABLE IF EXISTS public.email_send_state;