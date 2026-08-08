# Buyer Onboarding Flow at /start

A short, guided welcome for people who just bought something. It tells them what their results say, names the one offer that fits them next, and gives them a single button to move. It shows once, then gets out of the way.

## What the buyer sees

A new page at `/start`, three quick steps with the same progress bar and card styling as the current get-started flow.

**Step 1 — Here's what we found.** For audit buyers: the leak their report names, their five pillar scores, and the first action from their 7-day plan. If the report is still generating, the step says so plainly and offers to hold their place instead of showing an empty box. For every other buyer (advisory, agents, books, social stories): what they bought, that access is already active, and what happens next.

**Step 2 — Your recommended next move.** The offer name their report already picked, why it fits, and what they get. Non-audit buyers see the natural next step for what they just bought rather than an invented recommendation.

**Step 3 — One button.** A single primary CTA, sized to the recommendation:

- Recommendation is a high-touch or application-based offer (Rent-an-Agent, Lead Engine, Advisory, 90-day and 6-month programs, Build Studio): the button books a call. Free 15-minute clarity call for audit-only buyers, paid 60-minute strategy session for anyone already above the $297 pre-discount line, using your admin booking links.
- Recommendation is self-serve (modules, store, mini-story): the button goes straight to that offer's page and anchor.
- Recommendation is the free community hub: the button goes to the hub.

Underneath, quiet secondary links only: full report, dashboard, challenges. Nothing competes with the primary button.

## Showing it once

- Signed-in buyers: completing or dismissing writes a timestamp on their preferences record. After that `/start` is reachable from the dashboard but never pushed at them again.
- Guests who bought without an account: the same dismissal is remembered in the browser, and the flow invites them to create an account so their audit follows them.
- Someone with no purchase at all who lands on `/start` gets sent to the dashboard rather than an empty flow.

## Where buyers enter it

- The order-success screen gains "Start here" as its lead action, above the existing book/challenge cards.
- The dashboard shows a single dismissible welcome card linking to `/start` until it is completed.
- No email changes. The existing day 1/3/7 follow-ups already cover the inbox.

## Technical notes

- New page `src/pages/Start.tsx`, lazy route in `App.tsx`, `noIndex` on `SEOHead` like the other logged-in pages.
- The offer-slug routing table currently lives privately inside `AuditReport.tsx` as `ctaRoute`. Move it to `src/lib/offer-routes.ts` and have both pages use it, adding a `contact: "application" | "self_serve" | "community"` classification per slug so the CTA choice is data, not a second switch statement. `AuditReport.tsx` keeps its existing behaviour.
- New hook `src/hooks/use-buyer-onboarding.ts` resolves, for the signed-in user: their most recent `business_audits` row (report, `recommended_offer`) and, when there is no audit, their most recent row across `one_time_orders`, `agent_orders`, `book_orders`, `autism_orders`. Reads go through existing RLS, no new policies. Guests with a `?token=` continue to use `get_audit_by_token`.
- Booking URLs come from the existing `use-booking-links` hook, so the admin booking-links page stays the single source. The $297 pre-discount threshold is reused from `NextStepsPanel`, extracted to a shared constant so the two screens cannot drift.
- One migration: add a nullable `buyer_onboarding_completed_at` timestamp to `public.user_preferences`. Existing policies already scope that table to the owner, so no grant or policy change is needed.
- Analytics: `buyer_onboarding_view`, `buyer_onboarding_step`, `buyer_onboarding_cta` through the existing `trackEvent`, carrying the recommended slug and resolved CTA type.
- Copy follows the voice rules already in the project: no em dashes, no urgency, no invented prices. Investment lines render only the text the report itself produced.

## Verification

- Unit tests for the CTA resolver: application slugs pick the call, self-serve slugs pick the offer route, community picks the hub, unknown slugs fall back to the dashboard rather than a dead link.
- Render tests for the four `/start` states: audit with report, audit pending report, non-audit purchase, no purchase.
- Typecheck, full vitest suite, and production build must all pass.
- Playwright pass over `/start` at desktop and mobile widths to confirm one visible primary button per step and no layout break.
