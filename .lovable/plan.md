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