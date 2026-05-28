-- Welcome email trigger for new free-tier signups.
--
-- Fires after a row is inserted into public.profiles (which happens
-- synchronously inside handle_new_user() when auth.users gets a new row).
-- Uses pg_net to POST to the send-transactional-email edge function with
-- the welcome-to-focusflow template so the user receives a branded welcome
-- email immediately after creating their account.
--
-- Credentials are read from app.settings.* which Supabase populates
-- automatically in the database runtime from the project environment.
-- A vault secret (welcome_email_service_role_key) is used as the source of
-- truth; the function reads from vault when available and falls back to
-- current_setting so it works in both local dev and production.

-- pg_net is already enabled in 20260415054923_email_infra.sql, but declare
-- it idempotently here so this migration is self-contained.
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- ─── Trigger function ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_email       TEXT;
  v_name        TEXT;
  v_supabase_url TEXT;
  v_service_key  TEXT;
  v_idempotency_key TEXT;
BEGIN
  -- 1. Resolve the user's email from auth.users
  SELECT email
    INTO v_email
    FROM auth.users
   WHERE id = NEW.id;

  IF v_email IS NULL THEN
    -- No email row yet (shouldn't happen, but be safe)
    RAISE WARNING 'handle_new_user_welcome_email: no auth.users row for id=%', NEW.id;
    RETURN NEW;
  END IF;

  -- 2. Resolve display name — fall back to the email prefix if blank
  v_name := NULLIF(TRIM(COALESCE(NEW.display_name, '')), '');
  IF v_name IS NULL THEN
    v_name := split_part(v_email, '@', 1);
  END IF;

  -- 3. Resolve Supabase project URL
  --    Supabase sets app.settings.supabase_url in the DB runtime.
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  IF v_supabase_url IS NULL OR v_supabase_url = '' THEN
    RAISE WARNING 'handle_new_user_welcome_email: app.settings.supabase_url not set — skipping welcome email for %', v_email;
    RETURN NEW;
  END IF;

  -- 4. Resolve service role key — prefer vault, fall back to app.settings
  BEGIN
    SELECT decrypted_secret
      INTO v_service_key
      FROM vault.decrypted_secrets
     WHERE name = 'welcome_email_service_role_key'
     LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_service_key := NULL;
  END;

  IF v_service_key IS NULL OR v_service_key = '' THEN
    v_service_key := current_setting('app.settings.service_role_key', true);
  END IF;

  IF v_service_key IS NULL OR v_service_key = '' THEN
    RAISE WARNING 'handle_new_user_welcome_email: service role key not available — skipping welcome email for %', v_email;
    RETURN NEW;
  END IF;

  -- 5. Build a stable idempotency key so retries never double-send
  v_idempotency_key := 'welcome-' || NEW.id::text;

  -- 6. Fire-and-forget HTTP POST via pg_net (non-blocking)
  PERFORM extensions.http_post(
    url     := v_supabase_url || '/functions/v1/send-transactional-email',
    body    := jsonb_build_object(
                 'templateName',    'welcome-to-focusflow',
                 'recipientEmail',  v_email,
                 'idempotencyKey',  v_idempotency_key,
                 'templateData',    jsonb_build_object('name', v_name)
               )::text,
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'Authorization', 'Bearer ' || v_service_key
               )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never let an email failure break the signup transaction
  RAISE WARNING 'handle_new_user_welcome_email: unexpected error for user % — %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Restrict to service_role only (SECURITY DEFINER function)
REVOKE EXECUTE ON FUNCTION public.handle_new_user_welcome_email() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.handle_new_user_welcome_email() TO service_role;

-- ─── Trigger ─────────────────────────────────────────────────────────────────

-- Drop first so re-running the migration is idempotent
DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.profiles;

CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_welcome_email();

-- ─── Post-migration steps (applied outside this file) ────────────────────────
--
-- To activate the trigger you must store the service_role key in vault once:
--
--   SELECT vault.create_secret(
--     '<your-service-role-key>',
--     'welcome_email_service_role_key',
--     'Service role key for welcome email trigger'
--   );
--
-- The function also reads current_setting('app.settings.service_role_key', true)
-- as a fallback — Supabase sets this automatically so no manual step is needed
-- for standard hosted projects.
