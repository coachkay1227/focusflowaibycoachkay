# Offer sheet lock-in: keep every offer, one entry, honest estimates, QR-ready, Task Force positioned

You were right to push back. The earlier draft cut offers, and it missed the QR requirement, the nav change, and the Task Force. Corrected below. Nothing gets deleted from your catalog.

## Verified facts (read this turn, not assumed)

- `src/lib/build-studio-catalog.ts` holds 21 Build Studio offers. 9 are directly buyable (5 Quick Wins, 4 Care Plans have live Stripe price IDs). 12 are `inquiryOnly` yet still display an exact dollar figure and an exact week count.
- Three inquiry forms, one destination: `BuildApplicationDialog`, `OfferInquiryDialog`, `ApplyNowDialog` all call the `apply-now` edge function. Imported across Advisory, RentAnAgent, Store, Assessment, AgentResult, ResultScreen, ProgramDetail, AutismSocialStories, CollectiveAIBuildStudio.
- `src/lib/offer-routes.ts` already maps offer slugs to destinations, and most already use anchors like `/rent-an-agent#pro`. That is the backbone a QR system needs. Build Studio offers are the gap: cards have no anchor id, so no single Build Studio offer is linkable today.
- **`src/components/QRCodeDisplay.tsx` does not generate real QR codes.** Its own comment says it "produces a valid-looking but runtime-generated pattern" and it hand-draws a 25x25 matrix with no error correction. It is used on `/kiosk`. Classification: mocked. Any code printed from it will not scan. This directly blocks your workshop use case and it is the single most important thing this plan fixes.
- Nav: `DesktopNav.tsx:41` and `MobileNav.tsx:41` both list "Autism Social Stories" as its own top-level item.
- `src/pages/Collective.tsx` FAQ says the Collective is the delivery team Coach Kay assembles and leads. That contradicts the Task Force structure you described.

## What the two playbooks require of the page

From the Offers lessons: price to value created, never by averaging competitors; protect the price-to-value gap; narrow until the buyer recognizes themselves; do not let the offer sit in a commodity comparison. From Improvise: the free thing has a strategic job, and the job is to reveal a problem, give a trial, or complete step one of a multi-step solution.

Applied here: your free audit and assessments are the "reveal a problem" front door and should be the entry to every paid lane, not a separate island. And a 21-box price grid is a commodity comparison, which is what the lesson tells you to avoid. The fix is not fewer offers. The fix is fewer things visible at once, with the price revealed at the right moment.

## The plan

**1. Every offer stays. Nothing is deleted or merged away.**
All 21 Build Studio offers keep their name, features, and identity. What changes is how many are on screen at once and what number is printed on the card.

**2. Progressive disclosure instead of a wall.**
Each tier shows its 2 or 3 anchor offers by default, with "See all in this tier" expanding the rest. Same data, same routes, fewer simultaneous comparisons.

**3. Every offer becomes its own linkable, QR-able destination.**
- Each offer gets a stable slug and a real anchor id, so `/build-studio#lead_magnet` works and scroll-focuses that card.
- Add `?offer=<slug>` handling: landing with that param opens that offer's detail and prefills the inquiry with it. That is the link you put behind a QR code at a class or workshop.
- Extend `offer-routes.ts` to cover every Build Studio offer so one table remains the source of truth for slug to destination.

**4. Replace the fake QR generator with a real one.**
Swap the hand-rolled matrix for a real encoder (`qrcode` on npm), then build `/admin/qr-codes`: a list of every offer sitewide with its deep link, a scannable preview, UTM/source tagging so you can tell which workshop a lead came from, and PNG/SVG download for print. Acceptance test is literal: generate a code, scan it with a phone, land on the right offer. No code ships as "working" until a scan is captured.

**5. Money and time: exact only when it is instantly buyable.**
- The 9 offers with live Stripe prices keep the exact price and the buy button. Real product, real charge, real turnaround.
- The 12 inquiry-only offers keep the offer and lose the printed number. Card shows an investment band and "Timeline estimated during scoping". The number comes out of the conversation.
- The refund schedule comes off the page. That belongs in the contract.
- Sitewide, same rule applies to Advisory, Rent-an-Agent Enterprise, Lead Engine, and the inquiry-only store packages, so one rule governs everything.

**6. One inquiry, prefilled by the offer.**
A single `/start-a-build` route with guided dropdowns: what you want built, who it is for, the painful problem, budget band, timeline band, name, email. Arriving from an offer link prefills the offer so the visitor never re-types it. The three dialogs are retired only after every CTA is repointed and tested.

**7. Nav: Autism moves under Books.**
Remove the standalone "Autism Social Stories" nav item from both navs. It becomes a child of the Books/Publishing entry. The route `/autism-social-stories` stays live so existing links, emails, and any printed QR codes keep working.

**8. AI Task Force positioning.**
New `/ai-task-force` page, and the Collective FAQ rewritten to match reality: independent companies, founded by John Moyler, who meet often, coach together, and combine capacity for large builds and community-scale work. You are an AI partner in it. Clients contract with Focus Flow AI LLC. No claim that you employ or own it.
**I need your input here:** the Task Force details live in your other project, "Coach Kay's FOCUS App", which I cannot read from inside this one. Either paste the positioning copy, or approve me pulling that project's content as the first build step so this page is written from your source and not my summary.

**9. Ground the promises.**
"What agencies build in 4 months, the Collective ships in 14 days" and "first preview within 48 hours" come off unless you can point me at a delivered build that did it. Quick Wins keep their turnarounds since those are real fixed-scope products.

## Order of work

1. Real QR encoder + `/admin/qr-codes`, with a scan-verified test. Highest impact, zero risk to checkout.
2. Slugs, anchor ids, and `?offer=` deep links across every offer; extend `offer-routes.ts`.
3. Estimate bands replace printed prices on all inquiry-only offers sitewide. No Stripe changes.
4. `/start-a-build` with prefill; repoint CTAs page by page; retire the three dialogs last.
5. Progressive disclosure on the tier grids.
6. Nav change and Autism nesting; route stays live.
7. `/ai-task-force` page + Collective FAQ rewrite, from your source copy.
8. Promise and refund cleanup.

## Failure scenarios and how each is prevented

1. **A repointed CTA goes dead.** Prevention: route test per page asserting every CTA resolves. Detection: extend `offer-routes.test.ts` to assert every catalog slug has a route. Rollback: dialogs stay in the tree until step 4 passes.
2. **A printed QR code breaks later.** Prevention: slugs are permanent once published, and `/autism-social-stories` is never removed. Detection: a test asserting no published slug disappears from the route table.
3. **A live Stripe price is touched by accident.** Prevention: price IDs are not edited in any step. Detection: the existing `catalog-price-sync` test plus a new one asserting an inquiry-only offer never carries a `priceId`.
4. **Two sources of truth for offers.** The catalog stays the only place an offer is defined; `offer-routes.ts` only maps slug to destination. A test fails if a catalog slug is missing from the route table.
5. **A price sneaks back onto an estimate-only card.** A build guard fails if an inquiry-only offer exposes a formatted dollar figure.
6. **QR leads land with no attribution.** Every generated link carries a source tag written into `build_inquiries` so you can see which workshop produced which lead.

## Technical notes

- Zero Stripe changes. All 9 live price IDs untouched, so no live checkout regresses.
- `build_inquiries` already accepts anonymous inserts and already has `/admin/build-inquiries`. The new form reuses both, so admin visibility and recovery are unchanged. One additive column may be needed for the QR source tag.
- `redirectToLeadGenIfConfigured()` stays in front of every buy path, so your lead-gen switch keeps working.
- New dependency: a real QR library. That is the only package added.
- Kept as an open question, not an assumption: exact Task Force wording, and whether "John Moyler" is the correct public spelling.
