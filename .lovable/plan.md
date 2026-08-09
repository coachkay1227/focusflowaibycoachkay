# Rebuild /advisory as one converting path: entry, one offer, one form

The page currently shows five priced cards with five buttons. That splits attention five ways on the page that carries your highest-ticket work. The fix is the structure you named: one entry point, one core offer, one form.

## New page order

```text
1. Hero               Bring Coach Kay into the room
2. ENTRY              $47 AI Business Audit  (low-risk first step)
3. THE OFFER          AI Strategy Intensive, $497, direct checkout
4. WHAT SCOPES LOOK LIKE   one strip, no buttons, no per-item prices
5. THE FORM           one inquiry box with a format dropdown
6. WHO DELIVERS        corrected attribution
7. FAQ
```

## Entry (step 2)

The $47 AI Business Audit moves up from the bottom of the page to directly under the hero. It is the only thing on the page a cold visitor can buy without talking to you. Copy names who it's for and what they walk out with, then one button to `/audit/intake`.

## The one offer (step 3)

The $497 AI Strategy Intensive stays the single headline offer with direct checkout. It keeps its bullets and its price, and it is the only price shown besides the audit.

## What scopes look like (step 4)

The five lanes stop being cards with buttons and prices. They become one compact strip that tells a visitor the work exists, with no competing calls to action:

- Executive advisory retainers
- Keynotes, workshops, and team trainings
- Corporate, EAP, and workforce learning
- Transformation cohorts and the Summit
- Cbus AI Task Force (the former AI University roadmap tracks, now including government and public sector) links to `/ai-task-force`

One honest pricing line under the strip: scoped engagements start at $500, and final scope is set on a call. No `$500/hr`, `From $750`, `Custom scope`, or `Consumer to institutional` labels anywhere.

## The one form (step 5)

A single inquiry box, on the page itself rather than hidden behind five dialogs. Fields: name, email, organization, a required format dropdown, and goals / team size / timeline.

Dropdown options:

- Executive advisory retainer
- One day (workshop or training)
- Keynote or single session
- Multi-session series
- Corporate, EAP, or workforce program
- Transformation cohort
- Not sure yet, help me pick

It submits through the existing inquiry path so it reaches your email and CRM exactly like every other offer inquiry, with the chosen format carried in the notification. Success state confirms Coach Kay reviews every inquiry personally.

## Who delivers (step 6)

The current block wrongly says the AI Task Force is an independent company founded by John Moyler. Corrected:

- Advisory is led by Coach Kay.
- For larger training, cohort, and enterprise scopes she brings in partner capacity across engineering, AI research, design, and QA.
- That capacity comes through Collective AI, the separate enterprise founded by John Moyler, where Coach Kay serves as an AI partner.
- The Cbus AI Task Force is her own Columbus program, not that company.

Links to `/collective` and `/ai-task-force`, labeled so the two are unmistakable.

## Technical notes

- `src/pages/Advisory.tsx`: reorder sections, promote the audit CTA, collapse the lane grid into a no-CTA strip, embed the inquiry form inline, correct the who-delivers block, and update the ItemList JSON-LD so it lists the audit and the intensive as the offers with prices and the rest as unpriced services.
- `src/lib/offer-catalog.ts`: drop the `price` display strings from `ADVISORY_LANES`, replace the `university` lane with the Task Force entry carrying a route to `/ai-task-force`.
- `src/components/offers/OfferInquiryDialog.tsx`: extract the form body so the same fields render inline on this page, and add the required format `Select`.
- No schema change, no new edge function, no payment logic change. The `apply-now` path already carries lane and message.
- Verify: typecheck, unit tests, production build, then load `/advisory` and submit one inquiry to confirm the format lands in the notification.
