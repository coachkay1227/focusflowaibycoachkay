# Phase 4: prove starter-kit-report emails actually deliver

Today's fix cleaned up 21 fake `failed` rows and proved one real send works. Nothing yet stops that
from breaking again silently. This adds two layers: a live end-to-end check you run on demand, and a
fast guard that runs on every build.

## What the live check will do

A new section at the end of the Phase 4 journey, after the existing 16 assertions:

1. Submit the real `/starter-kit` form in the browser (name, business type, bottleneck) using
   `Hello@coachkayelevates.org`, exactly as a visitor would. No direct backend calls, so this covers
   the form, the report generation, and the email together.
2. Confirm the report renders on screen for the visitor.
3. Read the database and assert the resulting email row reached **`sent`**, carries a real provider
   id, and is tagged back to the report that triggered it.
4. Assert the row is **not** `failed` and has no error text, naming the exact error if it is.
5. Immediately repeat the submission with a fake `@example.com` address and assert it logs a single
   **`suppressed`** row with no send attempted. That is the specific regression from today: a fake
   address must never again be recorded as a delivery failure.
6. Assert nothing anywhere in the log has slipped back to `failed`.

Each run puts one real email in your inbox, subject line from the starter-kit template. That is the
cost of proving delivery truthfully.

### Handling the guardrails already in place

The generator allows 3 guest calls an hour per identity. Running the journey repeatedly will hit that
ceiling, and a 429 is correct behaviour, not a failure. The check will report a clear skip in that
case rather than a red result, matching how the existing resend-cap assertion already behaves.

## What the build guard will do

A fast check with no browser and no sending, wired into the build alongside the existing payment-link
and template-registry guards:

- The reserved-domain rules move into one small shared file so there is a single source of truth.
- A unit test covers the matching matrix: `example.com/.org/.net`, `.test`, `.invalid`, `.localhost`,
  subdomains of those, and real addresses that must **not** be caught (including lookalikes such as
  `example.company.com`).
- The build guard asserts the delivery function still imports that rule and still short-circuits
  **before** the provider call. If someone removes or reorders that check, the build fails with a
  message saying why.

This is what stops the regression cheaply and often. The live journey is what proves the template
genuinely lands.

## Technical notes

- `scripts/qa/phase4-delivery-journey.py`: add section 6 plus its backend assertions to the existing
  summary counter. Recipient from `PHASE4_QA_EMAIL`, defaulting to `Hello@coachkayelevates.org`.
- New `supabase/functions/_shared/reserved-recipients.ts`: pure TypeScript, no `npm:` imports, so
  both the Deno functions and Vitest can import it. `send-transactional-email` imports from here
  instead of holding its own copy.
- New `src/__tests__/reserved-recipients.test.ts` for the matching matrix.
- New `scripts/check-email-delivery-guard.ts`, added to the `build` script and CI next to
  `check-payment-links.ts`.
- Redeploy `send-transactional-email` after the shared-file extraction, since edge functions serve
  last-deployed code.
- Expected result: unit tests go from 66 to roughly 76 passing, and the Phase 4 journey from 16 to
  roughly 22 assertions.

## Verification before I hand back

- Run the full Phase 4 journey and show you every assertion, including the real `sent` row and its
  provider id.
- Show the `suppressed` row from the fake address, proving no send was attempted.
- Show a clean build and full unit-test run.
- Deliberately break the guard in a scratch copy to confirm the build actually fails, so you know the
  protection is real and not decorative.
