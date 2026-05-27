---
name: Pause Hub (P.A.U.S.E. Scam Hub)
description: /pause-hub is the consumer-protection scam alert hub, NOT a breathwork/meditation page
type: feature
---
# /pause-hub = P.A.U.S.E. Scam Hub

Route `/pause-hub` is the **AI scam, hype, and productivity-trap alert hub**. Per original plan (chat #897-902).

- Powered by `scam_alerts` table via Supabase Realtime (free tier).
- Public reads (`is_published = true`); admin writes only via `has_role(uid, 'admin')`.
- Admin UI at `/admin/scam-alerts` — create, edit, publish, delete.
- Threat levels: `red_flag`, `caution`, `watch`, `resolved`. Red reserved for `red_flag` only (brand: navy/gold/cream, no red as primary).
- Each alert has title, summary, body, category, action_rules (jsonb array), optional source_url.
- New/updated/deleted rows appear live on /pause-hub without refresh.

**Do NOT** turn this into a breathwork, meditation, or mindfulness page. That was a misbuild that has been discarded.
