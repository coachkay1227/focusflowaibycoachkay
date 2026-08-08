# Why /pause-hub still shows May: no new alerts exist

## What the check found

The page is not broken. Confirmed by reading the code and querying the table:

- `src/pages/PauseHub.tsx` subscribes to realtime INSERT/UPDATE/DELETE on `scam_alerts`, refetches on tab focus, and refetches again on subscribe. That wiring is correct.
- `scam_alerts` holds exactly 8 rows. Every one was created 2026-05-27, with `published_at` between 5/13 and 5/26. Nothing has been published since.

So the feed is showing the truth. The "LIVE / AUTO-UPDATING" badge reflects a connected socket, not fresh content, and there is nothing in the system that ever creates a new alert. That is the gap.

## The fix: automated weekly ingestion with your approval

New alerts get drafted from real published sources each week, saved unpublished, and wait for you at `/admin/scam-alerts`. Nothing goes public until you press publish. No invented incidents, no made-up numbers, every draft carries the source link it came from.

### 1. Source pull
A new edge function `ingest-scam-alerts` pulls recent items from public consumer-protection and security feeds (FTC consumer alerts, CISA advisories, IC3/FBI alerts). Each item keeps its real title, date, and URL. Items whose `source_url` already exists in `scam_alerts` are skipped, so nothing duplicates.

### 2. Voice pass
Each kept item goes through Lovable AI using the existing `coach-voice.ts` prompt to produce: title, summary, body, category, threat level, and 3 to 4 `action_rules`. The prompt is restricted to the facts in the source item. Anything the source does not state is omitted rather than filled in.

### 3. Saved as a draft
Rows insert with `is_published = false`, `published_at = null`, and the real source URL. Public reads only return `is_published = true`, so drafts stay invisible until you approve.

### 4. Weekly schedule
A `pg_cron` job runs the ingest function once a week. The function is worker-authorized the same way `retry-failed-emails` is, using `is_privileged_caller()`, so it cannot be triggered by the public.

### 5. Your approval queue
`/admin/scam-alerts` gets a Drafts section at the top: count badge, the source link for each draft, edit before publishing, publish, or discard. Publishing sets `published_at = now()` and the row appears on `/pause-hub` live through the existing realtime channel, no refresh.

### 6. Honest badge
The hub badge keeps saying LIVE while the socket is connected, and the counter next to it changes from "updated just now" (which tracks the fetch, not the content) to the newest alert's actual publish date, so the page never overclaims freshness.

## Technical notes
- New: `supabase/functions/ingest-scam-alerts/index.ts`, sharing `_shared/coach-voice.ts` and `_shared/worker-auth.ts`.
- Migration: none needed for `scam_alerts` itself. One nullable `source_feed` text column added so drafts show where they came from.
- Cron registered via the insert tool (contains project URL and key), not a migration.
- Edited: `src/pages/admin/AdminScamAlerts.tsx` (drafts queue), `src/pages/PauseHub.tsx` (freshness label only).
- Verification: run the ingest function once by hand, show you the drafted rows, publish one, and confirm it appears on `/pause-hub` without a refresh.
