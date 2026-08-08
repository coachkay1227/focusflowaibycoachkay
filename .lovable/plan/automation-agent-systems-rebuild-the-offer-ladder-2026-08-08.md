# Automation & Agent Systems: rebuild the offer ladder

Right now everything agent-related lives on one page called Rent-an-Agent, and that page names the wrong thing. Renting one agent is the middle of your ladder, not the headline. Three real offers have no door at all: standalone builds, the AI Brain, and Hermes. And the prices on the page contradict your own Stripe-locked source.

This plan builds an Automation & Agent Systems hub with four deep pages under it, fixes the pricing truth, and puts an intake in front of every dollar.

## What Hormozi's approach actually says here

You asked whether to keep prices or go application-first. His answer is not either/or.

Price stays visible. Hiding the number costs you the buyer who was ready, and it makes the page feel like a trap. What changes is what the button does. A price is an anchor for the value you just described. A button is a commitment step.

So: show the price, but never let the first click be a payment for anything you have to build. For a managed system, the buyer cannot know what they are buying and you cannot know what you are delivering. The intake IS the offer's first deliverable. It removes their risk (they find out what they actually need before paying) and yours (you never take money for a build you have not scoped).

Two exceptions where instant checkout stays, because there is nothing to scope: the $47 Audit and the $197 AI Brain.

## Quick wins: your real entry offer

Your fastest, cleanest builds are the Custom GPT and Claude project agents. Never named that way on the page. They become:

**Instant Agents.** One trained assistant, live in 72 hours, drawing on your AI Brain. Positioned as the smallest thing that proves the system works. From $297, additional agents $197. The AI Brain at $197 is required with any build and is the only agent product with open checkout, because it is a foundation, not a build.

That gives the hub a real bottom rung. Today the page jumps from a $47 audit straight to a $297/mo retainer with nothing in between.

## The ladder

```text
$47 AI Business Audit          diagnose      instant checkout
$197 AI Brain                  foundation    instant checkout
from $297 Instant Agents       prove it      intake, then invoice
from $750 Full-System Agents   integrate     intake, then invoice
$297+/mo Rent-an-Agent         run it        intake, then checkout link
Lead Engine (monthly + setup)  fill pipeline application
from $5,000 Hermes             autonomous    scoped on a call
```

## Pages

- `/agents` — new hub. Names who each rung is for, shows the entry price of each lane, routes out. Becomes the "Automation & Agent Systems" nav entry.
- `/agents/builds` — new. Instant Agents, Full-System Agents, AI Brain. The quick-win page.
- `/rent-an-agent` — stays at its URL (printed QR codes point there). Loses the Lead Engine section and becomes the managed-retainer page only.
- `/agents/lead-engine` — new. The five Lead Engine tiers, moved off Rent-an-Agent, corrected to your master sheet.
- `/agents/hermes` — new. From $5,000, custom-scoped, call only.

## Corrections to pricing truth

Per your master reference, MasterOffer.pdf governs:

- Rent-an-Agent Enterprise: drop "from $1,997/mo · $2,997/mo". Becomes By application.
- Lead Engine: five tiers, not three. Essentials from $697/mo, Pro $1,497/mo, Growth $2,497/mo (currently missing from the site entirely), Scale $2,997/mo, Enterprise $4,997/mo. Each with its setup fee.
- Hermes: from $5,000, never open checkout.
- Founding rate: first 10 clients, locked for life, 90-day commitment plus testimonial.

## Copy rules applied throughout

- No platform names in buyer-facing copy. "GHL / CRM connection" becomes "connected to your CRM and pipeline". "Dedicated GHL sub-account" becomes "your own fully provisioned outreach workspace". "Hands-on Claude / GPT labs" becomes "hands-on build labs".
- One guarantee only: live and working within 14 days or the first month is free.
- The cost anchor is allowed: a good assistant runs $40,000+ a year and still clocks out at 5pm.
- Speed claim capped at "most clients live in about 72 hours".
- Agency-grade, agentic tone. Systems that run the work, not tools you have to learn.

## Bug fixed on the way

Every Lead Engine card currently prints its own name twice, once as "Lead Engine: Essentials" and again as "Lead Engine — Essentials". Duplicated heading block in `RentAnAgent.tsx`. Visible on your live page.

## Technical notes

- `src/lib/offer-catalog.ts` becomes the single agent source of truth: corrected `LEAD_ENGINE_TIERS` (five entries plus enterprise), `RENT_AGENT_ENTERPRISE` with no numeric price, and new `AGENT_BUILDS` and `HERMES` exports carrying `intakeRequired` flags.
- Intake reuses the existing `/agent-intake` page, deep-linked with `?offer=<key>` the same way `/start-a-build?offer=` already works, writing to `agent_orders`. No new table.
- Checkout paths untouched for anything already selling: existing Stripe price IDs stay exactly as they are, and existing subscribers are unaffected. The Rent-an-Agent tier buttons change from Subscribe to Start intake; the price ID stays wired for the post-approval link.
- `shareable-offers.ts` gains slugs for the new pages and repoints Lead Engine slugs to `/agents/lead-engine`. Existing printed slugs keep working through the registry.
- New routes added to `App.tsx`, to `INDEXABLE` in `scripts/check-seo-regressions.ts`, and to the sitemap generator. `DesktopNav.tsx` and `MobileNav.tsx` get the hub entry with the lanes nested under it.
- Each page carries its own title, meta description, and Service JSON-LD. Inquiry-only and intake-required offers publish no exact price in structured data, matching the Build Studio rule already in place.

## Verification

Typecheck, `bun run test`, the payment-link guard, the SEO regression check, then a browser pass on all five pages confirming: no duplicated card headings, no platform names, Enterprise carries no number, the five Lead Engine tiers render, every non-exempt CTA lands on an intake with the right offer prefilled, and the $47 and $197 checkouts still open Stripe.