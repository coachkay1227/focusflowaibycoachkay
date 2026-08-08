# Live status on /admin/nurture while jobs process

Right now the page is a snapshot. After you queue steps or press Resend, the panel only changes if you hit Refresh yourself. This makes it update on its own while there is work in flight, and stop on its own when there isn't.

## What changes for you

A small live indicator sits next to the Refresh button:

```text
Live . updating every 5s          [ Pause ]
```

While any step is still pending or the report is still generating, the page re-reads the buyer's real queue state every 5 seconds. Queue coverage badges, the touch rows, sent timestamps, attempt counts, and last-error text all move on their own. Nothing on screen is a guess: every update is a fresh read of the same lookup the page already uses.

The polling is deliberately quiet about when it runs:

- **Starts** only when there is something to watch, meaning at least one touch is `pending`, or a Day 1 step is waiting on a report that hasn't generated yet.
- **Stops** as soon as every step reaches a settled state (`sent`, `skipped`, or `failed`) and shows `All steps settled . live updates off`.
- **Pauses** when you switch browser tabs, and resumes when you come back. No background traffic against a page you aren't looking at.
- **Gives up** after 5 minutes of continuous polling and switches to `Paused after 5 minutes . Resume`. The nurture worker runs on a schedule, not instantly, so a Day 3 row that isn't due won't change no matter how long we watch it. This keeps the page from polling all afternoon.
- **Never overlaps** with your actions. A poll is skipped while a preview, queue, or resend request is in flight, and skipped if the previous poll hasn't returned.

You can turn it off with the Pause button and go back to manual Refresh at any time. That choice sticks for the session.

Silent failure handling: if a poll request errors, the indicator shows `Reconnecting…` and keeps its last known good data on screen rather than blanking the panel or firing a toast on every retry. Three consecutive failures pause polling and surface one message.

## What does not change

- No new edge function, and no change to `admin-nurture`. Polling calls the existing `lookup` action with the audit ID already on screen.
- No database changes, no realtime subscription. A 5-second poll on one admin page is cheaper and simpler than adding a table to the realtime publication and holding a websocket, and this page is only ever open while you are actively watching one buyer.
- The Resend and Queue confirmation flows, the preview modal, and the queue coverage logic stay exactly as they are.

## Technical notes

All work is in `src/pages/admin/AdminNurture.tsx` plus one small extracted hook.

- New `src/hooks/use-live-refresh.ts`: takes a refresh callback, an `active` flag, an interval, and a max duration. Owns the `setInterval`, the `document.visibilitychange` listener, the in-flight guard, the consecutive-failure count, and the manual pause toggle. Returns `{ state, isPolling, pause, resume }` where `state` is one of `idle`, `polling`, `reconnecting`, `paused-manual`, `paused-timeout`, `settled`. Clears its interval and listener on unmount so no timer leaks.
- `refresh` in `AdminNurture.tsx` is split into the existing user-facing version and a quiet variant that does not clear the preview and does not toast, so the polling path can reuse it. It returns a success boolean for the failure counter.
- New derived value `hasWorkInFlight`: true when `touches.some(t => t.status === "pending")`, or when a `requiresReport` step exists and `audit.has_report` is false. Drives the hook's `active` flag.
- The `busy` state already tracks user actions; the hook reads it to skip overlapping polls.
- New `LiveIndicator` block rendered beside the existing Refresh button at line 290, using the `Radio` and `Pause` icons from lucide-react and existing design tokens. No hardcoded colors.

## Verification

- Unit test for the hook covering: no polling when inactive, polling when active, stop on settle, pause on hidden tab and resume on visible, skip while in-flight, pause after max duration, pause after three consecutive failures.
- Playwright pass on `/admin/nurture` with a signed-in admin: look up an audit that has a pending touch, confirm the live indicator appears and the panel updates without a manual click, then confirm the indicator reads settled for an audit whose steps are all sent.
- Production build and typecheck.
