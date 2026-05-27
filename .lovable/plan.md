# Clean up the email mismatch — once and for all

## What's actually true in the code right now

I read every email-related file. Here's the real picture:

**Sending (what runs in production today):**
- `send-transactional-email/index.ts` → calls **Resend directly** with `Coach Kay <noreply@coachkayai.life>`
- `auth-email-hook/index.ts` → calls **Resend directly** with `noreply@coachkayai.life`
- `apply-now/index.ts` → calls **Resend directly** with `noreply@coachkayai.life`
- `send-email/index.ts` → calls **Resend directly** with `noreply@coachkayai.life`

All four use `RESEND_API_KEY` and the verified Resend domain `coachkayai.life`. None of them touch the Lovable Email queue.

**Dead weight still sitting in the project:**
- `notify.coachkayelevates.org` is registered as the project's Lovable Email domain, status **pending DNS forever**. Nothing sends through it. It keeps surfacing in scans/tooling and that's why you keep seeing it get flagged.
- `process-email-queue/index.ts` is a queue dispatcher that calls `sendLovableEmail()` (Lovable Email infra, not Resend). It runs every 5 seconds via pg_cron but the queue is empty because no code enqueues anything — `send-transactional-email` and `auth-email-hook` skip the queue entirely.
- Email queue tables (`email_send_log`, `email_send_state`, `email_unsubscribe_tokens`, `suppressed_emails`) — only `email_send_log` is actively written by the Resend path; the others are queue-only and unused.
- A `welcome-to-focusflow` memory note still references `notify.coachkayelevates.org` as the sender subdomain.

You're right — I've patched symptoms three times. The actual fix is to delete the dead Lovable Email pipe and the stale domain registration so nothing in the project ever points at `notify.coachkayelevates.org` again.

## The plan

### 1. Remove the Lovable Email domain registration
Disable Lovable Emails for the project so `notify.coachkayelevates.org` stops showing up as the configured sender. (Heads up: this will *not* auto-delete the NS records you added at your registrar months ago — those are inert as long as nothing points at them, but you can remove them at your DNS provider any time.) Auth emails will fall back to Lovable's default templates only if anything were still routing through the hook — but our hook calls Resend directly, so nothing changes for users.

### 2. Delete the dead queue plumbing
- Delete edge function: `process-email-queue` (cron will be orphaned and stop firing; we'll also drop the cron job in a migration).
- Drop the pg_cron job `process-email-queue` and the `email_queue_service_role_key` vault secret in a migration.
- Drop the unused tables: `email_send_state`, `email_unsubscribe_tokens`, `suppressed_emails`, plus the `enqueue_email` / `read_email_batch` / `delete_email` / `move_to_dlq` RPC functions.
- Keep `email_send_log` — it's actively populated by the Resend path and is your only audit trail.

### 3. Clean residual references
- `process-email-queue/index.ts` — delete.
- `preview-transactional-email` — keep (it's a dev preview tool, doesn't touch the queue).
- `handle-email-suppression` / `handle-email-unsubscribe` — these were scaffolded for Lovable Email's bounce/unsubscribe webhook. Since we send via Resend, hook them up to Resend's webhook **or** delete them. Recommendation: keep `handle-email-unsubscribe` (the in-app `/unsubscribe` page calls it) but rewrite it to use a simpler `email_send_log` + a fresh small `unsubscribes` table; delete `handle-email-suppression` unless you wire Resend webhooks to it.
- Update memory note `mem://features/email-strategy` — replace `notify.coachkayelevates.org` with `noreply@coachkayai.life (Resend, verified)`.
- Remove `sender_domain` references in any client code that passes it (search came up clean outside the dead queue, but I'll double-check during build).

### 4. Verify end-to-end after cleanup
- Trigger a test signup → confirm auth email arrives from `noreply@coachkayai.life`.
- Trigger an Apply Now submit → confirm both the coach notification and the applicant `application-received` email arrive.
- Check `email_send_log` for `sent` rows; confirm no `pending` orphans.
- Confirm `supabase/config.toml` no longer needs `process-email-queue` entry.

## Files / surfaces touched

```
DELETE  supabase/functions/process-email-queue/
EDIT    supabase/functions/handle-email-suppression/   (delete or rewrite)
EDIT    supabase/functions/handle-email-unsubscribe/   (rewrite to not depend on queue tables)
EDIT    supabase/config.toml                            (remove process-email-queue block)
NEW     supabase/migrations/<ts>_drop_email_queue.sql   (drop tables, RPCs, cron job, vault secret)
EDIT    mem://features/email-strategy                   (correct the sender)
TOOL    email_domain--toggle_project_emails(false)      (disable Lovable Email domain)
```

## What this fixes for launch
- Stops the `notify.coachkayelevates.org` ghost from getting re-flagged.
- Removes a cron job that's been waking the DB every 5s for nothing.
- Single, obvious source of truth: **all email = Resend, from `noreply@coachkayai.life`, replies to `Hello@coachkayelevates.org`**.
- `email_send_log` becomes a clean audit trail you can actually trust.

## Open question before I build

**Do you want me to also delete `handle-email-suppression`?** It's only useful if you wire Resend's bounce/complaint webhook to it. If you don't want bounce tracking right now, I'll delete it. If you do, I'll keep it and rewrite it for the Resend webhook payload shape.
