# Care plans become an attachment, not a tier

## Where everything stands

Shipped and verified: the offer-sheet lock-in (investment bands on all 12 apply-to-build offers with the estimate qualifier), Collective AI positioning as an independent company founded by John Moyler, nav grouping, the unified `/start-a-build` inquiry with prefill and QR deep links, the QR console, fulfillment recovery with automatic email retries, the nurture sequence, and the CI guards (payment links, SEO routes, role invariants, email templates).

Open before this change: the pricing architecture on the Build Studio page, plus a mobile pass on checkout.

## What is actually behind a care plan today

Each of the four is a real Stripe recurring price. "Buy now" opens a subscription checkout. On payment the webhook writes a `build_orders` row flagged as a subscription, grants the access tier, and sends the confirmation plus next-steps email. That is the whole activation. The delivery work (updates, monitoring, small edits) is manual by you. Nothing about that is broken. The problem is placement: a monthly retainer sold cold, in its own tab, next to build prices, with no build behind it.

## The change

### 1. Care Plans stop being a tier tab

The tier row on `/build-studio` becomes three: Quick Wins, Business Builds, Custom AI Apps. Site Care and Agent Care move out of the tab row.

### 2. Care is offered right after a build purchase

After a Quick Win or a build order settles, the order-success next-steps screen adds one care offer, matched to what was bought:

```text
Chatbot Widget           -> Agent Care $197/mo
Any other Quick Win      -> Site Care $97/mo
```

It reads as the natural fourth step of the process ("Care"), not a second sale pitch. One card, plain language about what it covers, one button that opens the existing subscription checkout. Skipping it is a first-class option and changes nothing about the order.

### 3. Existing sites get care by inquiry

The Build Studio "Care" process step and the footer of the offer sheet route to `/start-a-build` with the care option preselected, instead of a direct checkout. Two new choices in the inquiry dropdown: "Care for a site you did not build" and "Care for an AI assistant you did not build". You see the site before you take a monthly commitment.

The four Stripe recurring prices stay live and untouched, so any existing subscriber keeps billing normally and your inquiry-to-checkout path still works when you decide to send it.

### 4. Collective Membership and Build Credits come off this page

Neither is site care and neither belongs on a build offer sheet. Both are removed from the Build Studio surface. Their Stripe prices, webhook mappings, and existing subscriptions are left alone so nothing breaks for anyone already on them. They stay in the catalog file, marked as not shown on the Build Studio page, ready to place somewhere deliberate later.

## Technical notes

- `src/lib/build-studio-catalog.ts`: `CARE_PLANS` splits. Site Care and Agent Care get an `attachTo` marker naming which Quick Win keys they follow. Membership and Build Credits get `hidden: true`. `BUILD_STUDIO_TIERS` drops the `care` entry.
- `src/pages/CollectiveAIBuildStudio.tsx`: tier row and JSON-LD `offers` derive from the tiers array, so both shrink automatically. The Care process step and the closing copy repoint to `/start-a-build?offer=care`.
- `src/components/NextStepsPanel.tsx`: one new optional care card, chosen from the purchased product name against the `attachTo` map. Uses the existing `create-checkout` invoke path, no new edge function.
- `src/pages/StartABuild.tsx`: two care options added to the dropdown, plus prefill handling for `?offer=care`.
- `src/lib/shareable-offers.ts` and the QR registry: hidden offers drop out of the printable list. Care slugs repoint to the inquiry path and are marked as not a direct purchase.
- No Stripe price IDs created, edited, or deleted. No database, policy, or edge function changes.

## Verification

Typecheck, `bun run test`, then the payment-link, SEO-route, role and email-template guards. Browser pass: the tab row shows three tiers with no care prices, a completed test order surfaces exactly one matching care card that opens a real subscription checkout, skipping it leaves the order untouched, and `/start-a-build?offer=care` lands with the care option preselected.