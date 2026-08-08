# Audit result: what landed, what is still loose

I checked every item of the offer-sheet lock-in against the actual code. Two items are clean. Two are half-done, and I found three real bugs that were not in the original plan.

## Verified done

- **Item 0, dev server unblock.** `/start-a-build` is in INDEXABLE and in the sitemap generator, `/admin/qr-codes` is in ADMIN_EXEMPT.
- **Item 1, investment bands.** All 12 apply-to-build offers carry band strings and approximate timelines, each flagged `estimate: true` with `inquiryOnly: true`. Tier headers read "Bands from $2K" and "Bands from $8K". Quick Wins and Care Plans keep real prices and price IDs. The refund-schedule copy is gone, replaced by scope-first terms language.

## Still wrong

### 1. The line you flagged

Build Studio hero currently reads: "Scoped by Coach Kay, delivered with Collective AI , an independent company founded by John Moyler. Contracted under Focus Flow AI LLC."

Two problems. A stray space before the comma from the link wrapper renders "Collective AI , an independent". And "Contracted under Focus Flow AI LLC" is a floating fragment with no subject. Rewrite as one plain sentence that says who you sign with and who builds.

### 2. Collective positioning is only half applied

The body copy was corrected. The framing around it still says Coach Kay owns the Collective:

- Structured data on `/collective` still has `parentOrganization` pointing at Focus Flow AI and still names Coach Kay as `founder`. The plan said drop both. The org description still reads "led by Coach Kay".
- Page title and meta description still say "The Team Behind Coach Kay's Builds" and "the delivery team Coach Kay leads".
- Hero eyebrow reads "THE COLLECTIVE · DELIVERY TEAM" and the H1 reads "Coach Kay isn't alone. She builds with the Collective."
- Roles section says "Coach Kay leads, scopes, and signs every SOW" and the capability header reads "What the Collective ships".
- Build Studio meta description says "Coach Kay's Collective AI team", its eyebrow says "LED BY COACH KAY", and a keyword is "Collective AI build team".

Fix: independent-company framing everywhere. Kay is an AI partner who scopes your work and signs under Focus Flow AI LLC. Collective partners join when scope needs more capacity. Drop `parentOrganization`, drop Kay as `founder`, name John Moyler as founder in the org description.

### 3. Navigation is adjacent, not grouped

"Autism Social Stories" now sits next to "Books & AI Kits" inside Work With Me. Desktop carries a "Part of Books" hint. Mobile carries nothing, so on mobile it still reads as a standalone top-level offer. Make the grouping explicit on mobile the same way it is on desktop.

## Bugs found during the audit, not in the original plan

- **Dead canonical and a 404 cancel path.** `/collective-ai-build-studio` is not a route. The real route is `/build-studio`. That wrong path is used in the page's WebPage JSON-LD, the breadcrumb, the Service `@id` and `url`, the FAQPage `@id`, and, worse, the Stripe `cancelPath`. A buyer who cancels checkout on a Quick Win or Care Plan lands on a 404. Repoint all six to `/build-studio`.
- **Process copy contradicts the bands.** Step 01 says "We scope the build and lock the price". For apply-to-build offers there is no locked price until the SOW. Change to scope-then-quote language.
- **Em dashes in titles.** Both page titles use an em dash, which your voice rules ban. Replace with a colon.

## Scope guardrails

Copy, metadata, JSON-LD paths, and nav labels only. No Stripe price IDs touched. No database, policy, or edge function changes. No changes to the band values already in place.

## Verification

Typecheck, `bun run test`, the payment-link guard and SEO regression scripts, then a browser pass on `/build-studio` and `/collective` confirming: no exact price or hard timeline on any apply-to-build card, `?offer=` deep links still land, the hero sentence reads clean, and the checkout cancel path resolves to a real page.