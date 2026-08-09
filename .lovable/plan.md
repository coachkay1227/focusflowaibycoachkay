# Fix the /advisory engagement section and who-delivers block

Three corrections on `/advisory`. Nothing about checkout, payments, or the $497 Strategy Intensive changes.

## 1. AI University Roadmap Tracks becomes a pointer to the Task Force

That track was converted into the Cbus AI Task Force (with government and public-sector added), so it stops being a scoped offer with its own "Request Scope" button.

The card stays on the page, retitled to name the Task Force, with copy that says the roadmap tracks now live inside that program and that it includes government and public-sector readiness. Its button becomes a link to `/ai-task-force` instead of opening the inquiry dialog. No price line on that card.

## 2. One inquiry box with a booking-format dropdown

Replace the five separate "Request Scope" buttons with a single inquiry section at the bottom of "Choose the right format". One button opens one dialog. Inside the dialog, a required dropdown picks the format:

- Executive advisory retainer
- Single day (workshop or training)
- Keynote or single session
- Multi-session series
- Corporate, EAP or workforce program
- Transformation cohort
- Not sure yet, help me pick

The dialog collects name, email, organization, and goals/team size/timeline, and submits through the existing inquiry path so it lands in email and the CRM the same way every other offer inquiry does. The selected format is included in the submission so it is visible in the notification.

Pricing on this section reduces to one honest line: engagements start at $500 and final scope is set on a call. The per-card price lines (`$500/hr`, `From $750`, `Custom scope`, `Consumer to institutional`) come off the cards so there is one number on the page, not five.

## 3. Correct the WHO DELIVERS block

Right now it says the AI Task Force is an independent company founded by John Moyler. That is wrong and mixes the two entities. The corrected block reads:

- Advisory is led by Coach Kay.
- For larger training, cohort, and enterprise scopes, she brings in partner capacity across engineering, AI research, design, and QA.
- That partner capacity comes through Collective AI, the separate enterprise founded by John Moyler, where Coach Kay serves as an AI partner.
- The Cbus AI Task Force is her own Columbus program, not that company.

The block links to `/collective` for the partner company and to `/ai-task-force` for the Columbus program, labeled so a visitor can tell them apart.

## Technical notes

- `src/lib/offer-catalog.ts`: rework the `ADVISORY_LANES` entries (drop `price` display strings, replace the `university` lane with the Task Force pointer including a route field).
- `src/pages/Advisory.tsx`: single inquiry CTA, one starting-price line, corrected WHO DELIVERS block with both links, and the ItemList JSON-LD updated to match the new lanes.
- `src/components/offers/OfferInquiryDialog.tsx`: add an optional required `formats` prop rendering a shadcn `Select`, appended to the submitted message and lane label.
- No new tables, no schema change, no new edge function. Existing `apply-now` handler already carries the lane and message.
- Verify: typecheck, unit tests, build, then open `/advisory` and submit one inquiry to confirm the row and notification carry the chosen format.
