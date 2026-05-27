# Fix AI Lead Engine: symmetric layout + real, convertible offers

## Two problems in one section

**1. Asymmetry.** `LEAD_ENGINE_TIERS` has 5 items, rendered through `getSymmetricGridClass(5)`, which lays them as 3-col on lg → orphaned row of 2 boxes hugging the left edge (visible in your screenshot). 5 is a hostile count for a clean grid at every breakpoint.

**2. Bluffy copy.** Current descriptions are one-liners with no deliverable, no volume, no outcome, no timeline:
- "AI-scored, enriched lead lists."
- "Full GHL sub-account + automated outreach system."
- "Done-for-you outreach follow-up and reporting."
- "Voice AI + LinkedIn + auto appointment booking."
- "Full-channel custom build and integration."

These are jargon stubs. A prospect can't tell what they're buying, what gets delivered week one, or what success looks like. Low conversion is structural here, not a styling problem.

## Plan

### A. Collapse 5 tiers → 3 tiers + 1 Enterprise banner

Mirrors the Rent-an-Agent layout we just shipped. Three real paths covers the market without dilution; Enterprise sits below as the "talk to us" lane.

- **Essentials** — list + intelligence
- **Pro** — system + sequenced outreach (was Pro + Growth merged)
- **Scale** — full omnichannel including voice (was Scale)
- **Enterprise** — custom build (banner, not in grid)

This gives a clean `lg:grid-cols-3` row with no orphans.

### B. Rewrite every offer with the same 5-part structure

Each tier card gets: **outcome headline** → **concrete deliverables list** → **volume / cadence** → **timeline to live** → **price + setup**. No more one-liner descriptions.

#### Proposed tiers (you'll review copy before I ship — these are my best draft):

**Lead Engine — Essentials · $697/mo intro ($997/mo standard) + $1,500 setup**
*Outcome:* "Stop guessing who to call. Get a weekly list of pre-qualified, intent-scored leads."
- Up to **500 enriched leads / month** matched to your ICP
- Intent + fit scoring (0–100) with reasoning per lead
- Verified email + direct phone + LinkedIn URL per record
- Weekly CSV drop into your CRM (HubSpot / GHL / Pipedrive)
- 1× scoring tune-up call per month
*Live in:* 7 days
*Best for:* Founders doing outbound themselves who want a smarter list, not a bigger one.

**Lead Engine — Pro · $1,997/mo + $2,500 setup** *(highlighted as Most Popular)*
*Outcome:* "Replace your outbound SDR with a system that sends, follows up, and books."
- Everything in Essentials, plus:
- Dedicated GHL sub-account (fully provisioned + branded)
- **3-channel sequence**: email + LinkedIn + SMS, 8-touch cadence
- AI-personalized first lines on every send
- Reply detection → auto-route to your calendar
- Monthly performance review (open / reply / meeting rates)
*Live in:* 14 days
*Best for:* Operators with a clear ICP who need consistent pipeline without hiring.

**Lead Engine — Scale · $3,497/mo + $5,000 setup**
*Outcome:* "Run a full outbound floor — voice, social, inbox — without headcount."
- Everything in Pro, plus:
- **Voice AI agent** (outbound dialer + inbound qualification, 1,000 calls/mo included)
- LinkedIn automation with profile warming + connection sequencing
- Calendar-integrated auto-booking with reminder cadence
- Dedicated success engineer (weekly call)
- Custom dashboard: pipeline, attribution, cost-per-meeting
*Live in:* 21 days
*Best for:* Teams targeting 30+ booked meetings / month across multiple channels.

**Lead Engine — Enterprise · By application** *(banner, like Rent-an-Agent Enterprise)*
*Outcome:* "Custom-built outbound infrastructure for multi-brand, multi-region, or regulated GTM."
- Custom-scoped agent fleet across channels
- Dedicated success engineer + solutions architect
- CRM / data warehouse integration (Salesforce, HubSpot Enterprise, Snowflake)
- SLA + compliance review (SOC 2, GDPR, TCPA)
- Quarterly executive briefings on pipeline + system health
*Best for:* Multi-brand operators, agencies, and regulated industries.

### C. Honesty guardrails

To honor "real not bluffed":
- Every deliverable is something we can actually scope and ship — no "magical AI" claims, no unbounded "unlimited" language, no promised meeting counts (only **target ranges** and **honest cost-per-meeting framing**).
- Voice AI is the only deliverable that depends on a per-account provisioning step; Pro and Essentials work on launch day. Setup timelines reflect that.
- Pricing anchors include the setup fee so prospects don't bounce at the first invoice.

### D. Code changes

**`src/lib/offer-catalog.ts`** — Replace `LEAD_ENGINE_TIERS` with the new 3-tier shape:
```ts
export const LEAD_ENGINE_TIERS = [
  { name, headline, price, setup, bullets: string[], timeline, best_for, highlighted? }, ...
] as const;
export const LEAD_ENGINE_ENTERPRISE = { name, headline, price, bullets, best_for };
```

**`src/pages/RentAnAgent.tsx`** (lines 330–358) — Rebuild the section to mirror the Rent-an-Agent layout we just shipped:
- 3-col grid (`lg:grid-cols-3`) for the three tiers with `items-stretch`
- Highlight Pro with the same gold ring treatment used on the Rent-an-Agent Pro tier
- Each card: name, headline (one bold sentence), price + setup, bullets list with `Check` icons, "Live in X days" footnote, italic best_for, "Request Scope" CTA
- Centered Enterprise banner below (same `max-w-3xl` gold-edged pattern as Rent-an-Agent Enterprise)

### E. Verification

After edits: screenshot `/rent-an-agent` at desktop (1366) and mobile (390), confirm the AI Lead Engine row is now 3 even cards + a centered Enterprise banner, and the copy reads concrete on a single read.

## What I am NOT touching

- Stripe price IDs, GHL provisioning, inquiry flow.
- The Rent-an-Agent tier section above this one.
- Any other page's offer surfaces.

## Open question

Pricing on the new consolidated Pro tier — I rolled "Pro + Growth" into a single tier at **$1,997/mo + $2,500 setup** (a deliberate increase from old Pro's $1,497 because the new Pro now includes Growth's outreach follow-up + reporting). Approve, or hold Pro at $1,497 and downgrade the deliverables list?
