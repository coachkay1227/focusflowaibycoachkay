# Test 1 Findings: Auth, Roles, Admin Ownership, Protected Routes, Paid Access

> Running findings log. Test 1 and Test 2 recorded below. Nothing implemented yet, by your instruction.
>
> Parked note for later: move Autism & Social Stories under the Books and Publishing family, and create a new AIOS page (the operating system) that links to the FocusFlow Command app for building your AI brain. Not part of these audits.

Read-only audit. No code, database, provider, or secret was changed. Findings recorded only, no fixes implemented yet (holding until all 5 tests are done).

## Verified end-to-end (backend evidence, not screens)

- Account lifecycle wiring is sound. 7 auth users, 7 profiles, 7 access-level rows, 0 orphans on either table. The signup trigger is doing its job, so the orphaned-profile risk is not live today.
- Row-level security holds against anonymous callers. Direct unauthenticated reads of user roles, access levels, profiles, admin audit log, and business audits all returned empty. Only the intentionally public booking and leadgen settings keys came back.
- The admin role function cannot be executed anonymously at all (permission denied), so there is no anonymous role probe.
- Admin status has a single source of truth: the roles table, read through the role-check function. No email allowlist, no tier escalation. Corporate tier does not grant admin.
- The admin user-management backend re-checks admin server-side with a service client before doing anything, so a frontend bypass gets nothing.
- Users cannot write their own tier or role. Insert, update, and delete are all blocked by policy on both tables. Tier changes can only come from the payment webhook running as service role.
- Two confirmed admins exist (your two addresses), which removes single-owner lockout risk today.

## Functional with gaps

- Paid access is enforced in the interface only. The access gate blurs locked content but still renders the real content into the page, and the AI functions (coach chat, clarity insight, pattern detect, weekly insights) check that you are signed in but never check your tier. A signed-in free user can reach paid AI output by calling those endpoints directly, and locked module content is present in the page source. This is the most material finding in Test 1.
- The access gate is applied in only one place (the modules list). Program detail and other paid surfaces rely on their own logic, so gating is inconsistent.
- There is no in-app way to grant or revoke admin. The admin backend can change tiers but never touches roles. Admin ownership is a manual database operation. Safe today, but recovery depends on backend access.
- Two accounts are unconfirmed. Expected with email confirmation on, but worth confirming they are test accounts and not stuck buyers.

## Partial

- Route protection is client-side only, which is normal for this stack, but it means the real security boundary is RLS and the function guards, not the route wrapper. That is fine where RLS covers the data and not fine where it does not (see paid access above).
- The sign-in redirect has a 1.5 second hard fallback to the dashboard. It prevents a stranded user, but it can fire before the preference lookup finishes and send a buyer to the dashboard instead of their intended destination. No redirect loop observed.

## Unknown until the remaining tests run

- Whether Google sign-in completes cleanly end to end on the published domain, including return-to-intent preservation.
- Whether password reset actually lands on the reset screen and changes the password rather than silently signing the user in.
- Whether tier is written correctly by the payment webhook for each product, and whether it ever regresses a cohort or premium account.

## Exact tests still required for this area

1. Signed-in free account calls the paid AI endpoints directly and we inspect the response. Expected: refused. This is the test that proves or disproves the paid-access gap.
2. Signed-in free account loads the modules page and we inspect the page payload for locked content.
3. Non-admin signed-in account requests an admin route and an admin backend action. Expected: no admin data returned.
4. Full Google sign-in from a protected route, then refresh and back navigation, confirming the session and the intended destination.
5. Password reset from request through new-password submission, confirming the password actually changed.

## Notes

Nothing here is a claim based on how the code looks. Every verified item came from a live backend response or a direct database read. Everything I could not prove from the backend is filed as unknown.

Ready for Test 2 when you are.

---

# Test 2 Findings: Edge Functions, External APIs, Webhooks, Validation, Idempotency, Rate Limits, Retries

Read-only. 38 edge functions, the Stripe webhook, the GHL webhook, the email pipeline, and the nurture queue were inspected against live backend records and logs.

## Verified end-to-end (backend evidence)

- Stripe webhook signature verification is real and working. It uses the async verification variant required by this runtime, refuses a request with no signature header, and refuses a bad signature. Evidence: three recorded webhook failures, all of them rejected unsigned or badly signed attempts (missing signature header, no matching signature, unparseable header). No unsigned payload has ever been processed.
- The webhook also self-checks its own verifier health before processing, and records a config failure if the signing secret is missing instead of falling through.
- Idempotency is enforced at the database, not in memory. Every event id is inserted into the processed-events table first, and a duplicate insert short-circuits with a duplicate response. Three settled checkout events are recorded, all distinct. Duplicate side effects on retry are structurally prevented.
- Only settled and complete sessions fulfil. Fully discounted sessions (100 percent off promo) are treated as settled on purpose, which is correct for your test promo code.
- Price tampering has a guard: fulfilment compares against gross amount including any Stripe discount, so a legitimate promo cannot look like a tampered price.
- The GHL webhook and the internal senders refuse callers that are not the service role, so they cannot be triggered from a browser.
- Every admin-facing function re-checks admin server-side through the roles function, using a service client. No email fallback anywhere.
- The nurture queue has real retry semantics: attempt counter increments per failure, the row stays pending for the next run, and it parks as failed after five attempts. Nothing is stuck: zero pending and zero failed nurture rows right now.
- AI calls handle provider pressure explicitly: rate limiting returns a 429 with a retry message, and exhausted credits return a distinct 402 rather than a generic failure.

## Functional with gaps

- The email pipeline works, and the failures in the log are test artifacts, not a broken system. Of 52 send-log rows, the real failures are five rejected because the recipient was an example.com test address, and three older ones from a period when project email was disabled. Every real recipient shows a pending row followed by a sent row. Gap: those failures are only visible if someone opens the log. There is no alert when a real buyer email fails.
- Failure visibility generally is passive. Webhook failures, dead-lettered emails, and parked nurture rows all land in tables with admin screens, but nothing pages you. An invisible error stays invisible until you look.
- The unsigned-webhook attempts recorded tonight have no event type or source attribution beyond the stage and reason, so a real attack and your own testing look similar in the record.
- Rate limiting is handled inbound from providers but there is no outbound rate limit or abuse throttle of your own on the AI functions. A signed-in user can call them repeatedly. Combined with the Test 1 paid-access gap, that is a cost exposure, not just an access one.

## Partial

- Fulfilment coverage is uneven across product families. Three checkout events processed and five audits exist, but the one-time orders table is still empty, so the newer order paths have never actually been exercised by a real event. They are untested rather than known-broken.
- Function JWT settings are mixed, with most functions set to not verify at the platform edge and doing their own in-code check instead. That is the documented pattern here and each one I opened does check, but the guarantee rests on every function remembering to, with no shared enforcement.

## Unknown until tested

- Whether a real Stripe retry of a genuine event is a no-op end to end (the duplicate path is proven by code and unique constraint, not yet by a real replayed delivery).
- Whether the newer product fulfilment paths write their order rows correctly under a real event.
- Whether a provider outage on the email service surfaces anywhere you would notice within a day.

## Exact tests required

1. Replay one already-processed Stripe event from the dashboard and confirm the response is a duplicate short-circuit and no second order row or second email appears.
2. Send a deliberately unsigned request to the webhook and confirm a 400 plus a new failure row, with nothing written downstream.
3. Run one real checkout on each newer product path with the test promo and confirm the order row, the confirmation email, and the admin screen all agree.
4. Force one email failure with a real-looking address and confirm it lands in the log and is recoverable from the admin screen without code.
5. Call a paid AI function repeatedly as a free signed-in account and record what happens. This is both the rate-limit test and the paid-access test from Test 1.

## Verified facts versus assumptions

Verified from live records: signature rejection behaviour, idempotency rows, email send outcomes and their causes, empty nurture queue, retry ceiling, AI 429 and 402 handling. Assumed until a real replay and real orders exist: duplicate-safety under an actual Stripe retry, and correctness of the newer fulfilment paths.

Ready for Test 3.