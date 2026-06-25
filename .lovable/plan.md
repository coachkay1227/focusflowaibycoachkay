# Weekly newsletter from Scams + Truths (AI-drafted, you edit, you send)

## What you're getting

A weekly issue auto-drafted by AI from two content seeds you already have, dropped into your inbox every Monday morning. You review, edit, paste back, and trigger a send to all `newsletter_subscribers` through Lovable Emails.

**Issue format (locked, ~400 words):**

```text
1. SCAM ALERT  — pulled from the freshest unused row in scam_alerts
2. TRUTH DROP  — a myth/take aligned to the "Truth About AI" voice
3. AI PLAY     — one concrete tool or workflow you can run this week
```

All three sections drafted in Coach Kay voice (Voice Bible applied via the existing `_shared/coach-voice.ts`).

## How it works (no admin UI, just edge functions)

```text
Mon 07:00 ET — pg_cron
    │
    ▼
draft-weekly-newsletter (edge fn)
    ├─ pulls 1 unused scam_alert + 1 truth seed + 1 play
    ├─ Gemini 3 Flash drafts subject + 3 sections in Voice Bible style
    ├─ stores draft in newsletter_issues table
    └─ emails the draft + an "Approve & Send" link to hello@coachkayelevates.org
                                │
                                ▼
                  You click the link (signed token, 7-day TTL)
                                │
                                ▼
                send-weekly-newsletter (edge fn)
                    ├─ verifies token
                    ├─ pulls draft from newsletter_issues
                    ├─ enqueues one transactional send per subscriber
                    │   (existing process-email-queue handles throughput + retries)
                    └─ marks issue 'sent', stamps sent_at
```

If you want to edit before sending: hit the "Edit in browser" link instead — opens a minimal one-page editor at `/admin/newsletter-draft/:id` (smallest possible UI, not a full campaign manager).

## What gets built

1. **`newsletter_issues` table** — id, issue_number, subject, scam_alert_id, truth_body, play_body, status (`draft`/`approved`/`sent`/`skipped`), approval_token, token_expires_at, sent_at, sent_count. Admin-only RLS.
2. **`scam_alerts.used_in_issue_id`** — nullable FK so we never repeat a scam.
3. **Edge function `draft-weekly-newsletter`** — content selection + Gemini draft + email to you.
4. **Edge function `send-weekly-newsletter`** — token verify + enqueue sends.
5. **Email template `weekly-newsletter-draft.tsx`** — the draft preview you get with two CTA buttons (Approve & Send, Edit).
6. **Email template `weekly-newsletter-issue.tsx`** — the actual subscriber-facing newsletter (footer auto-adds unsubscribe link, per email infra rules).
7. **One-page editor** at `/admin/newsletter-draft/:id` — textarea per section + "Send now" button (admin-only, gated by `has_role`). Smallest viable surface, no campaign list, no analytics page.
8. **pg_cron job** — Monday 07:00 ET hits `draft-weekly-newsletter`.

## Guardrails (because this is bulk-ish)

- Lovable Emails forbids bulk/marketing; this is allowed because **each subscriber explicitly opted in via the waitlist with "Get on the waitlist" wording**, and every issue includes the auto-appended unsubscribe footer. We will document this in the function header to keep future-you honest.
- Hard cap: max one issue per 7 days per subscriber, enforced server-side in the send function.
- Bounces/complaints already flow into `suppressed_emails`; the queue worker honors it. Nothing extra to wire.
- Skip subscribers in `suppressed_emails` and any with `confirmed = false` if you're using double opt-in.

## What this plan does NOT include

- No Beehiiv mirror (you chose Lovable Emails only).
- No analytics dashboard, open/click tracking, A/B subjects, segmentation, or campaign list UI.
- No automated send — you stay in the loop on every issue (you said "you edit").
- No public archive page (can add later if you want the SEO benefit).

## Technical notes

- AI model: `google/gemini-3-flash-preview` via existing `_shared/ai-gateway.ts`, with Voice Bible system prompt.
- Content selection: scam = newest `scam_alerts` row where `used_in_issue_id IS NULL` and `published_at IS NOT NULL`; truth seed = rotates from a small curated list in code (we can move to a `truth_seeds` table later if you want).
- Approval token: 32-byte random, SHA-256 hashed in DB, raw in the email link. Same pattern as `email_unsubscribe_tokens`.
- Cron: uses `pg_cron` + `pg_net` per the standard scheduled-edge-function pattern.
- The send function enqueues one message per subscriber so the existing 120/min queue throttles correctly — no custom rate limit.

Ready to build this when you approve.
