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

---

# Test 3 Findings: Offers, Products, Prices, Checkout, Webhooks, Purchases, Subscriptions, Entitlements, Delivery, Recovery

Read-only. Evidence came from live Stripe reads, live database rows, webhook records, and the send log. Nothing was changed.

## Verified end-to-end (backend evidence)

- One product family is proven: the AI Business Audit. Three real live-mode checkout events are recorded, and all three produced an audit row marked paid with a generated report and a timestamp. Entry form to payment to fulfilment to report to email is real for that one path.
- The success screen cannot lie. The post-checkout screen calls a server check that reads the real Stripe payment status and then looks for the actual fulfilment row across all five order tables before it says anything positive. A paid-but-unfulfilled session reports as pending, not success. This closes the success-page-only risk for the screen itself.
- Checkout refuses unknown prices. Every price must be registered in the server price map or the session is never created, which prevents a broken or stale button from silently charging at the wrong mode.
- Checkout stamps the buyer's user id into both the session metadata and the subscription metadata, so a subscription can be tied back to an account later.
- Signature verification, duplicate-event blocking, and the price-tampering guard behave as recorded in Test 2 and still hold for these paths.
- Subscription cancellation does not wipe manually elevated accounts. Only the subscription-tied tier is allowed to fall back to free; cohort, premium, and corporate are preserved.

## Functional with gaps

- Entitlement writing is unproven. Zero accounts currently hold any paid tier. Every paid tier in the system has been granted by code that has never actually run against a real event. The tier upgrade path is written and plausible, but no row in the database proves it works.
- Price truth is checked against the codebase, not against Stripe. The link report resolves 33 referenced price IDs against the internal map and reports zero failures, but that only proves the app knows about them. It does not prove the price is still active in Stripe or that the amount matches the number on the page. The wrong-price and dead-price risks are therefore undetected by the current guard.
- The admin link dashboard does read live Stripe (active flag, product active flag, amount), so the capability exists. It is just not wired into the automated guard, and nobody is required to look at it.

## Partial

- Fulfilment coverage is one path out of five. Orders tables for one-time products, agent builds, and social stories are all completely empty. The book order path has a single row from May that is still marked awaiting payment with a live session id, meaning that checkout was started and never settled and nothing has cleaned it up since. Those four families are untested, not proven broken.
- Recovery is admin-side only. There are admin screens for orders, nurture, audits, webhook health, and payment links, and a fulfilment test harness with a full-discount promo code. A buyer has no self-service way to say "I paid and got nothing."
- Subscription state has no reconciliation. Tier is written on the event and cleared on cancellation. There is no periodic comparison of Stripe's subscription list against stored tiers, so a missed event drifts silently and permanently.

## Unknown until tested

- Whether a paid subscription actually writes the correct tier and unlocks the correct surfaces.
- Whether the four unexercised order families write their rows and send their confirmation emails under a real event.
- Whether every live price ID is still active and priced as displayed.
- Whether a payment made while not signed in reliably reconnects to the account created afterwards for anything other than the audit path.

## Current user impact

A buyer of the AI Business Audit gets what they paid for. A buyer of anything else is on a path no completed purchase has ever traversed, and a subscriber may pay and receive no unlocked access, with no automatic detection and no self-service recovery.

## Exact tests required

1. One real checkout per family (agent build, one-time product, social story, book) using the full-discount promo. Confirm order row, confirmation email, and admin screen agree.
2. One real subscription checkout. Confirm the tier row is written, the paid surfaces unlock, then cancel and confirm the downgrade behaves and does not touch a manually elevated tier.
3. Live price reconciliation for all referenced price IDs: active, product active, amount equal to the displayed price.
4. Replay a processed event and confirm no second row and no second email.
5. Abandon a checkout and confirm the pending row is visible and closable by an admin, since one has been stranded since May.

## Verified facts versus assumptions

Verified: three settled audit purchases with reports, the server-side success verification, price-map rejection at checkout, zero paid tiers in the database, four empty order tables, one stranded pending book order, live price reading available in the admin dashboard only.
Assumed until a real purchase exists: tier granting, subscription lifecycle, and the four unexercised fulfilment families.

Ready for Test 4.

---

# Test 4 Findings: Branded Templates, Sender Domain, Triggers, Lifecycle Journeys, Queues, Consent, Logs, Alerts

Read-only. Evidence came from the live domain status, the send log, the nurture queue, subscriber and consent tables, and a trace of the webhook code against what the log actually shows.

## Verified end-to-end (backend evidence)

- The sender domain is real and verified. Mail sends from your own subdomain on your own domain, delegated to Lovable nameservers, and project email is enabled. Auth emails are on.
- Delivery is genuinely happening for the audit journey. The log shows a matching sent row for every real recipient across intake confirmation, purchase confirmation, report ready, the clarity code result, the newsletter welcome, and the weekly draft. Sending works, and the branded templates render and deliver.
- Failures are honestly recorded with the provider's own reason. The five failed rows are all the provider rejecting example.com test addresses, and the three dead-lettered rows are from a period when project email was switched off. Nothing is silently dropped.
- Suppression and consent plumbing exists and is clean: zero suppressed addresses, nine unsubscribe tokens issued, five newsletter subscribers, six newsletter issues.
- The send endpoint is server-only. It refuses any caller that is not the service role, so no browser can trigger a branded email.

## Broken

- The immediate post-purchase next-steps email has never sent. Zero rows exist in the send log for that template, across all three settled purchases, even though the template is registered and the send is wired into the webhook. This is the message that hands the buyer their booking link and first-challenge timeline, and no buyer has ever received it. Two hypotheses, both testable: the send is fired without being awaited, so the worker shuts down when the webhook returns its response and the call never completes; or the internal invoke is being rejected and the failure is swallowed by the attached catch, which only logs a warning. The zero-row evidence is consistent with either.
- Worse, the admin audit trail records `next_steps_email_sent: true` unconditionally, at the moment the send is fired, not when it succeeds. So the admin record asserts an email was sent that the send log proves was never sent. This is the exact pattern of an interface claiming success before the backend is complete, and it is on the admin side, which is where you would go to check.

## Functional with gaps

- Lifecycle enrollment is inconsistent. Three audits were purchased. Only one nurture row exists in the whole queue, step one, already sent. The enrollment code sits on the branch that runs when the webhook creates a brand new audit row, so a buyer who filled in the intake form first and paid second updates an existing row and is never enrolled. Two of your three buyers got no day one, day three, or day seven follow-up.
- Nothing alerts you. Failed sends, dead-lettered mail, missing enrollments, and the never-sent next-steps email all sit quietly in tables. The only way any of this surfaces is if someone opens an admin screen and reads it. There is a webhook failure alert template in the registry, but no evidence in the log that an alert has ever been sent.

## Partial

- Auth emails are enabled and configured, but zero auth rows exist in the send log. Signup, reset, magic link, and email change have no delivery evidence at all, and two accounts sit unconfirmed. Configured is not the same as proven.
- Marketing lane is half-built. Subscribers, issues, welcome mail, and a draft flow all work, but no issue has been recorded as sent to the list, so the actual broadcast path is unexercised.

## Current user impact

A buyer today gets their confirmation and their report. They do not get the next-steps email, and unless they happened to be the one buyer created on the insert path, they get no follow-up sequence at all. From the buyer's side it looks like the relationship stops the moment the report lands. From your side, the admin trail says the next-steps email went out.

## Exact tests required

1. Run one full-discount purchase and then read the send log for the next-steps template. Expected: a pending row followed by a sent row. If nothing appears, the send is not surviving the webhook response, which identifies the failing boundary precisely.
2. Run one purchase where the intake form was filled in first, then check whether three nurture rows appear. This proves or disproves the insert-only enrollment hypothesis.
3. Trigger a password reset and a new signup and confirm auth rows appear in the log and mail lands in a real inbox.
4. Force one failure with a real-looking address and confirm it is visible and re-sendable from the admin screen without touching code.
5. Send one newsletter issue to a small real list and confirm sent counts, suppression handling, and the unsubscribe link resolving to a real page.

## Verified facts versus assumptions

Verified: domain verified and enabled, real deliveries for six templates, provider-attributed failure reasons, zero suppressions, one nurture row total, zero next-steps rows, zero auth rows, service-role-only send endpoint, admin metadata asserting the next-steps send unconditionally.
Assumed until tested: the specific reason the next-steps send never completes, and that the insert-only branch is what starved the other two buyers of follow-up.

Ready for Test 5.