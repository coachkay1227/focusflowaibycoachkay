# Launch Audit — Status Report

## ✅ Verified working (from yesterday's changes)

- **Email rewire complete**: `send-transactional-email` and `auth-email-hook` both send via Resend API → `Coach Kay <noreply@coachkayai.life>`, Reply-To `Hello@coachkayelevates.org`. No stale `notify.coachkayelevates.org` / `SENDER_DOMAIN` references remain anywhere in the codebase.
- **Autism purchase confirmation template** exists (`autism-purchase-confirmation.tsx`) and is registered.
- **Stripe webhook** wired to invoke the new autism template with extended metadata.
- **Templates registered** (11 total): application-received, audit-purchase-confirmation, autism-purchase-confirmation, book-order-paid, book-order-status-update, clarity-code-result, reset-welcome, transformation-welcome, webhook-failure-alert, welcome-to-focusflow.
- **Edge function logs**: no recent errors on send-transactional-email or stripe-webhook (no traffic yet — these need a real test transaction to confirm).

## ⚠️ Still broken / needs fixing

### Security findings (10 open from scanner, NEW since yesterday)

1. **`book_orders` — missing INSERT policy** (warn). Authenticated users can insert rows with arbitrary `user_id`. Need `WITH CHECK (auth.uid() = user_id)`.
2. **`autism_orders` — missing INSERT policy** (warn). Same issue. Need ownership-enforcing INSERT policy.
3. **`cohort_registrations`** — anon INSERT with no field validation / rate limit. Lower priority; add a CHECK on email format at minimum.
4. **5× "RLS Policy Always True" warnings** — need to identify which UPDATE/DELETE/INSERT policies use `USING (true)` and tighten them.
5. **3× "Authenticated Can Execute SECURITY DEFINER" warnings** — new definer functions exposed to `authenticated` role. Need to identify and either revoke EXECUTE or document as accepted risk in security memory.
6. **1× "Anon Can Execute SECURITY DEFINER"** — likely `get_audit_by_token` (already in accepted-risk memory). Confirm and re-mark as fixed.

### Email infrastructure gaps

7. **Lovable Emails workspace still has stale `coachkayelevates.org` entry** with `provisioning_failed`. Should be deleted + Lovable Emails toggled off for the project (since we now send 100% via Resend) — otherwise it sits as a confusing artifact and the queue dispatcher cron may still try to drain.
8. **`process-email-queue` cron** — confirm whether it's still scheduled. Since both senders now bypass the pgmq queue and call Resend directly, the queue tables (`email_send_log`, `email_unsubscribe_tokens`, `suppressed_emails`) are no longer being written to. Decision needed: (a) delete the queue infra, or (b) refactor the Resend senders to enqueue + dispatch (recommended for retry safety, suppression, unsubscribe).
9. **No suppression / unsubscribe check** in the new Resend sender path. Recipients who unsubscribed previously will now receive emails again. Auth emails are fine (transactional/required), but app emails should respect `suppressed_emails`.

### Code health

10. **Stale references to send-transactional-email** in `client-notify`, `clarity-insight`, `apply-now`, `update-book-order`, `stripe-webhook`, `_shared/structured-log.ts` — verify each invocation still passes a valid `templateName` and that no caller still expects the old Lovable gateway response shape.
11. **React Router v7 warnings** in console (non-blocking) — add `future` flags or accept.

## 📄 The "one more page" you mentioned

You said you still have one more page to build — I don't know which one. Routes currently registered: Index, Auth, ResetPassword, Onboarding, Dashboard, Profile, Community, Modules, ProgramDetail, ClaritySession, ResultScreen, MirrorChallenge, Challenges, CoachChat, CoachKay, Store, OrderSuccess, AutismSocialStories, Assessment, StarterKit, RentAnAgent, Advisory, AuditIntake, AuditReport, AuditLanding, EmailPreview, EmailUnsubscribe, Unsubscribe, Kiosk, Sitemap, Faq, NotFound, Privacy, Terms, Disclaimer, RefundPolicy, plus Admin (Dashboard/Users/Analytics/Content/Orders). **Tell me which page is missing** and I'll build it.

## 📧 Email campaign (next phase, not started)

Confirmed scope before building:
- Welcome / nurture sequence for each access path?
- Audit-buyer drip after $47 purchase?
- Autism Studio post-purchase educational series?
- Cohort enrollment campaign?
- Marketing emails belong outside Lovable's transactional system (deliverability rule) — confirm you want these in GHL or Resend Broadcasts, not in our transactional pipeline.

---

## Proposed fix order (if approved)

1. Add INSERT-with-ownership policies to `book_orders` + `autism_orders` (migration).
2. Audit + tighten the 5 "always true" RLS policies (migration).
3. Identify the 3 new authenticated-SECURITY-DEFINER functions; revoke or accept-risk + memory update.
4. Re-mark `get_audit_by_token` finding as fixed (already in memory).
5. Decide queue strategy: refactor Resend senders to enqueue+dispatch, OR delete queue infra. **Recommend refactor** so we keep suppression/unsubscribe.
6. Add suppression check + unsubscribe footer support to the Resend send path.
7. Delete stale Lovable Emails workspace entry; toggle Lovable Emails off.
8. Sanity-check the 6 callers of `send-transactional-email`.
9. Build the missing page (need name).
10. Email campaign scoping → build.

**Tell me: which page is missing, and do you want me to proceed with items 1–8 as a single fix pass before we tackle the page + campaigns?**
