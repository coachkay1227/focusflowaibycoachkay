# Make the drafted alerts readable in the admin view

## What the check found

The ingestion did fire. `scam_alerts` now holds 6 unpublished drafts created today at 21:58 UTC:

- Warning: Fake recovery services targeting scam victims (FTC Consumer Alerts)
- Social Media Investment Training Scams (FTC Consumer Alerts)
- Protecting Your Teen from Credit Identity Theft (FTC Consumer Alerts)
- Free FTC Tool for Kids' Online Safety Skills (FTC Consumer Alerts)
- Active Exploitation of Progress LoadMaster Vulnerability (CISA)
- Aviation Data Link Communication Vulnerabilities (CISA)

The eight May rows are still the only published ones. Read access is correct: the SELECT policy on `scam_alerts` returns unpublished rows to admins, so the data is reachable from the admin page.

Two reasons you can't read them:

1. The drafts queue exists only in the current working code, not in the live published build. The admin page on the published site is still the old version with no drafts section.
2. Even in the new version, a draft row shows a title and a 2-line clipped summary and nothing else. The `body` the AI wrote and the action rules are never rendered in the list, so you cannot tell what the news actually is without opening Edit.

## The fix

### 1. Readable drafts, no Edit round trip
Each draft in the queue becomes expandable. Collapsed it shows what it shows now. Expanded it shows the full drafted alert exactly as it would read on the hub: full summary, the whole body, the numbered action rules, threat level, category, source feed, and the source link. Nothing hidden, nothing truncated. That way one glance tells you whether the AI got the facts right and whether it sounds like you.

### 2. Freshness you can trust at a glance
The queue header shows when the last ingestion ran (newest draft's created time) so you know the job is firing without opening logs.

### 3. Ship it to the live admin
Publish so the drafts queue is actually present at /admin/scam-alerts on the real site, not just in the editor.

## Technical notes
- Edited: `src/pages/admin/AdminScamAlerts.tsx` only. `AlertRow` (lines 397-464) gains an expand toggle and a detail block rendering `body` and `action_rules`; the drafts section (lines 350-373) gains the last-run line.
- No database, edge function, or public hub changes. The ingestion worker and the /pause-hub freshness label are already correct.
- Verification: load /admin/scam-alerts, expand a draft, confirm the full body and action rules render, then publish one and confirm it appears on /pause-hub without a refresh.
