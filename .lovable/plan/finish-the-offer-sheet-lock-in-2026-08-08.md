# Finish the offer-sheet lock-in

Four offer-sheet items remain, plus the two logic problems you just named and a standing rule so I stop missing them.

## 0. Unblock the dev server (do this first)

The SEO contract check is failing and that stops the dev server from booting. The two routes added last turn are unclassified in `scripts/check-seo-regressions.ts`:

- `/start-a-build` goes in INDEXABLE (it is a public lead-gen entry point).
- `/admin/qr-codes` goes in ADMIN_EXEMPT.

Nothing below can be runtime-verified until this passes, because the preview is currently refusing connections.

## 1. Investment bands on the 12 apply-to-build offers

Exact prices and exact timelines come off every `inquiryOnly` offer (Business Builds, Custom AI Apps). Instant-checkout products keep their real prices: Quick Wins ($297 to $797) and Care Plans ($97/mo to $497/mo).

What replaces them:

```text
Full Marketing Site      Band: $2K to $4K    Typical: about 2 weeks
Lead-Gen Quiz Funnel     Band: $2K to $4K    Typical: about 2 weeks
E-Commerce Store         Band: $2K to $4K    Typical: about 2 weeks
Client Portal            Band: $3K to $5K    Typical: 2 to 3 weeks
Course / Membership      Band: $3K to $5K    Typical: about 3 weeks
Internal Ops Dashboard   Band: $3K to $5K    Typical: about 3 weeks
AI Tool / SaaS MVP       Band: $8K+          Typical: 3 to 4 weeks
Multi-Agent Workflow     Band: $10K+         Typical: about 4 weeks
Industry AI Assistant    Band: $10K+         Typical: about 4 weeks
White-Label Platform     Band: $13K+         Typical: about 4 weeks
```

Every band carries the same honest qualifier: estimate, final scope confirmed on a call. Tier headers move from hard ranges to investment-band language. The refund schedule copy comes off the Build Studio FAQ, replaced with terms language that routes to the scoping call, since terms belong in the SOW and not a public page.

## 2. Collective positioning

The current FAQ says the Collective is not a different company and is Coach Kay's delivery team. That is wrong. Correct positioning:

- The Collective is an independent company. Founder: John Moyler.
- Coach Kay is an AI partner in it, not its owner.
- Independent operators who meet often, coach together, support each other, and combine capacity for large builds and community-scale work.
- You contract with Focus Flow AI LLC for Coach Kay's work. Larger scopes bring in Collective partners.

Applies to the FAQ, the roles section framing, the page intro, and the Organization JSON-LD (drop `parentOrganization`, stop naming Coach Kay as founder of the Collective). The Build Studio FAQ gets the same correction so the two pages agree.

## 3. Navigation cleanup

"Autism Social Stories" stops being a top-level item and moves under the Books/Publishing group in both `DesktopNav.tsx` and `MobileNav.tsx`. The `/autism-social-stories` route stays live and every existing link keeps working.

## 4. The Pause page "live" claim

What I verified in the backend just now:

- `scam_alerts` is in the `supabase_realtime` publication with replica identity full, so row changes do broadcast.
- An anon-readable SELECT policy exists for published alerts, so a visitor's socket is allowed to receive them.
- The page subscribes to INSERT, UPDATE, and DELETE and tears the channel down on unmount.

So the wiring exists. What is dishonest is the state handling around it, and that is what you noticed:

- The "Live" indicator is static. It never reads the channel's subscribe status. If the socket never connects, or drops on a phone that slept, the badge still says live while the list is frozen.
- The 10-second timer only re-renders the "Xm ago" labels. It never refetches, so it makes stale data look fresh.
- There is no reconnect path and no tab-visibility handling. Returning to the tab does not re-read the table, so alerts published during the gap never appear.

Fix: drive the indicator off the real channel status (connecting, live, reconnecting, offline), refetch once on `SUBSCRIBED` and once on tab focus so a missed window self-heals, and show an explicit "reconnecting, showing last known alerts" state instead of a green light.

Test: publish an alert from `/admin/scam-alerts` in one tab, watch it appear in a second tab with no reload, then drop the socket and confirm the badge degrades instead of lying.

## 5. Assessment and challenge dates

I checked the real rows. Stored dates are not all the same day: `challenge_progress`, `challenge_enrollments`, `module_enrollments`, `mac_assessments`, and `clarity_sessions` all span multiple dates. The database is not the problem, so the day math or the display is. Three real defects:

- `current_day` is a stored counter advanced by a button press, never derived from the calendar. Someone who started three weeks ago and never clicked still reads Day 1. Someone who clicks four times in one sitting reads Day 4 on day one.
- `started_at` is written once from the browser's `Date.now()` and the update path never touches it again, so it is client-clock dependent and unrepairable after the fact.
- For signed-out users the challenge initializes `startedAt: Date.now()` on mount, so a cleared browser silently restarts the clock.

Fix: derive the displayed day from `started_at` in the user's timezone instead of from the click counter, set `started_at` server-side on first write, and surface the real start date on the dashboard and in `/admin/enrollments`.

Test: query the rows, then confirm each screen's displayed day and start date match the stored timestamps for a user whose rows span several weeks.

## 6. The standing rule you asked for

You are right that "audit the logic" has been landing as "read the code and confirm it looks correct." A short behavior-contract file goes in the repo, and every future audit answers it in writing per feature:

```text
1. What does this screen claim to the user, in plain words
2. What backend result would make that claim true
3. Where can the claim render before that result exists
4. What happens when the connection drops, the tab sleeps, or the clock is wrong
5. What is derived versus stored, and which one does the UI trust
6. The exact query or interaction that proves it, run and pasted
```

Nothing gets called done without items 5 and 6 answered. That is the missing step that let a static "Live" badge and a click-counter day number both pass earlier reviews.

## Technical notes

- `src/lib/build-studio-catalog.ts`: for `inquiryOnly` offers, `priceDisplay` becomes a band string and `turnaround` an approximate phrase. The numeric `price` field stays for internal sorting only and is never rendered for those offers. Card rendering in `CollectiveAIBuildStudio.tsx` already reads the display fields, so no logic change there.
- No Stripe price IDs added, removed, or edited. No database, policy, or edge function changes.
- Verification: typecheck, `bun run test` (87 tests), the payment-link guard script, then a browser pass on `/build-studio` confirming no exact price or hard timeline renders on any apply-to-build card and that `?offer=` deep links still land correctly.