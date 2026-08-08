# Fix the offer sheet: one entry, honest estimates, correct Collective positioning

## What I confirmed by reading the code

Verified facts, from files I read this turn:

- `src/lib/build-studio-catalog.ts` is the single source of truth for the Build Studio page. 21 offers across 4 tiers.
- Only 9 of them can actually be bought: 5 Quick Wins and 4 Care Plans have Stripe price IDs. The other 12 (Business Builds, Custom AI Apps) show an exact dollar figure and an exact week count with `inquiryOnly: true`. Those numbers are decoration. Nothing behind them is scoped, contracted, or priced by a real conversation.
- Three separate inquiry forms exist and all three end up in the same place, the `apply-now` edge function: `BuildApplicationDialog` (also writes `build_inquiries`), `OfferInquiryDialog`, `ApplyNowDialog`. Same job, three different sets of fields, three different titles ("Start your build", "Talk to Coach Kay", "Apply Now").
- Promise claims currently in the page copy: "What agencies build in 4 months, the Collective ships in 14 days", "first preview within 48 hours for Tier 1", per-card turnarounds of "48 hr" / "72 hr" / "5 days" / "2 weeks" / "4 weeks", and a refund schedule ("full refund before we start, 50% after first preview").
- `src/pages/Collective.tsx` FAQ currently states the Collective is Coach Kay's delivery team that she assembles and leads. You said the Collective is a separate company, founder John Moyler, and you are an AI partner in it. Those two statements cannot both be true.

## What the Hormozi playbooks you uploaded actually require here

From the two documents: price to the value created, never by averaging competitors; protect the price-to-value gap; narrow the buyer until the offer looks built for one person; do not let the offer sit in a commodity comparison. A grid of 21 boxes with 21 prices is the opposite of that. It invites side-by-side comparison and it prices before value is established.

## The change

**1. One entry, not many boxes.**
A single guided inquiry at `/start-a-build`, driven by dropdowns: what are you trying to build, who is it for, what is the painful problem, budget band, timeline band, name, email. One record, one confirmation. Every non-checkout CTA sitewide points there. The three dialogs get replaced by that one route. Instant-checkout offers keep their direct Buy button and do not go through the form.

**2. Money and time are estimates unless you can buy it right now.**
- Quick Wins and Care Plans: keep the exact price, keep the buy button, keep a stated turnaround, because those are real products you can charge for on the spot.
- Business Builds and Custom AI Apps: no dollar figure, no week count on the card. Replace with an investment band ("Typical investment: mid four figures") and "Timeline estimated during scoping". The exact number comes out of the conversation, as your voice rules require.
- Remove the refund schedule from the page. Refund terms belong in the contract, not the offer sheet.

**3. Fewer, sharper offers.**
Collapse 12 estimate-only cards into 4 outcome lanes, each written for one buyer with one painful problem: Get found and booked, Sell online, Run your business on one dashboard, Build an AI product. Each lane lists what is included and what is not. This is the narrowing step from the playbook, and it kills the commodity grid.

**4. Collective positioning rewritten as a partnership, not a payroll.**
New language: the Collective is an independent AI task force. Separate companies, founded by John Moyler, who meet often, coach together, and combine capacity for large builds and community-scale work. You contract with Focus Flow AI LLC. When a project needs more hands than one person, the task force brings them. No claim that you own or employ the Collective, and no claim that they own your client relationship.

**5. Promise claims get grounded.**
Every remaining time claim on the page must be one we can defend. "14 days versus 4 months" comes out unless you confirm a delivered build that did it. Same for "first preview within 48 hours" outside Quick Wins.

## Order of work

1. Rewrite `build-studio-catalog.ts`: estimate bands replace exact prices on non-checkout tiers, 12 cards collapse to 4 lanes. No Stripe changes, no price IDs touched.
2. Build `/start-a-build`, writing to the existing `build_inquiries` table with the existing `apply-now` notification. No new table needed.
3. Repoint every non-checkout CTA to it, then delete the three dialogs once nothing imports them.
4. Rewrite the Build Studio and Collective copy: positioning, FAQ, promise claims, refund removal.
5. Update `src/lib/__tests__/offer-routes.test.ts` and the catalog price-sync test so a future exact price on an estimate-only lane fails the build.

## Technical notes

- Nothing in Stripe changes. The 9 live price IDs stay exactly as they are, so no live checkout regresses.
- `build_inquiries` already accepts anonymous inserts and already has an admin view at `/admin/build-inquiries`. The new form uses both, so admin visibility and recovery are unchanged.
- `redirectToLeadGenIfConfigured()` stays in front of the buy paths, so the lead-gen switch keeps working.
- Risk to watch: the three dialogs are imported by Advisory, RentAnAgent, Store, Assessment, AgentResult, ResultScreen, ProgramDetail, AutismSocialStories. Repointing them all in one pass is the change most likely to break a CTA, so that step gets a route test per page.
- Assumption I need you to confirm: that the four lane names above are the right four, and that "John Moyler" is spelled that way for public copy.
