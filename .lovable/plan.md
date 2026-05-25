## Why you can't find the Studio

The desktop nav is hidden on every "app" route (`/community`, `/dashboard`, `/clarity`, `/programs`, etc.) because those are in `PRIVATE_ROUTES`. So once a user is logged in and browsing the app, there is literally no link to `/store` anywhere. Mobile nav has it, homepage does not, and authenticated app shell does not.

That is the #1 blocker to "launch ready" — the page works, but nobody can reach it.

## Plan to make the Studio fully launch-ready

### 1. Add visible entry points (highest priority)
- Add a **Studio** link to the authenticated app shell (Dashboard header / sidebar) so logged-in users can reach `/store` from `/community`, `/dashboard`, `/programs`, etc.
- Add a **Studio** teaser card/section on `Index.tsx` (homepage) with a CTA → `/store`.
- Add a **Studio** link in the Dashboard quick-actions area.
- Keep the existing DesktopNav (public) and MobileNav entries as-is.

### 2. Sitemap + SEO
- Add `/store` to `scripts/generate-sitemap.ts` with `priority: 0.9`.
- Add `<title>`, meta description, and JSON-LD `Product` schema for each lane on `Store.tsx`.
- Add OG image for social shares of `/store`.

### 3. Stripe end-to-end smoke test (live mode)
- Verify `STRIPE_SECRET_KEY` is live (not test) via the Stripe tool.
- Run one real $497 Mini-Story Starter checkout → confirm `book_orders` row + webhook fulfillment + confirmation email.
- Verify `order-success` page renders correctly post-payment.

### 4. Inquiry flow verification (Autism lane)
- Submit one Autism & Social Stories inquiry → confirm `apply-now` edge fn delivers email to Coach Kay's inbox.
- Add an admin view row in `AdminOrders` (or new `AdminInquiries`) so inquiries don't get lost.

### 5. Analytics completion
- Wire the remaining 4 events that were specced but not yet fired: `studio_package_view`, `studio_intake_submit`, `studio_checkout_started`, `studio_checkout_paid`, `studio_inquiry_submitted`.
- Add a simple funnel view in `AdminAnalytics` (lane → package → intake → paid).

### 6. Content & trust polish
- Confirm all 5 lanes have: hero copy, 3+ packages, "best-fit buyer" line, delivery timeline, and at least one testimonial or social proof block. Flag any lane missing these.
- Add FAQ section (refund policy, delivery time, revisions, rights/ownership).
- Add a footer trust row (Stripe badge, money-back guarantee, contact email).

### 7. Error & empty states
- Add error boundary around `Store.tsx` so a catalog parse error doesn't blank the page.
- Add loading skeletons for the lane tabs and intake modal.
- Handle Stripe checkout failure with a toast + retry CTA (currently silent on some paths).

### 8. Mobile QA pass
- Test all 5 lanes + intake modal + inquiry submit at 375px width.
- Test checkout redirect on iOS Safari (Stripe sometimes blocks popups).

### 9. Legal / operational
- Confirm Terms, Privacy, and Refund Policy pages exist and are linked from the intake modal footer.
- Confirm Coach Kay's email inbox for `apply-now` inquiries is monitored.

### 10. Final pre-launch checklist (verification, not new work)
- Run `tests/assessment-flows.spec.ts` + add a `tests/studio-flows.spec.ts` covering: lane navigation, paid intake → Stripe redirect, Autism inquiry → success state.
- Confirm sitemap regenerates on `prebuild`.
- Publish.

### Technical scope summary
| Area | Files touched |
|------|---------------|
| Entry points | `src/components/AppShell.tsx` (or wherever auth nav lives), `src/pages/Index.tsx`, `src/pages/Dashboard.tsx` |
| SEO | `scripts/generate-sitemap.ts`, `src/pages/Store.tsx` (Helmet + JSON-LD) |
| Analytics | `src/pages/Store.tsx`, `src/components/store/IntakeFormModal.tsx`, `src/lib/analytics.ts` |
| Admin | `src/pages/admin/AdminOrders.tsx` (inquiries tab) |
| Tests | new `tests/studio-flows.spec.ts` |
| Polish | `src/pages/Store.tsx` (FAQ, trust row, error boundary) |

No DB migrations. No edge function changes (Stripe + inquiry paths already verified healthy in prior audit).

---

**Want me to do all 10, or pick a subset?** My recommendation: do **1, 3, 4, 6, 9** first (the true launch blockers), then ship, then follow up with 2, 5, 7, 8, 10.