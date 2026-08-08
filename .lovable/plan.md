## Goal

Two things, in order:

1. **Audit first** — prove, with backend evidence, which revenue and journey paths actually work end-to-end. No code changes.
2. **Then** re-point offers to the new lead generation page in Coach Kay's FOCUS App, once the subdomain exists.

Nothing below changes code, database objects, secrets, or provider settings.

---

## Part 1 — Evidence-based audit

Every item gets one classification, and the classification must come from a backend result (Stripe object, database row, function log, delivered email), never from a rendered screen or a "success" toast.

**Classifications:** verified end-to-end · functional with gaps · partial · UI only · mocked · broken · missing · unknown

### Audit tracks

**A. Money paths (highest impact)**
For each live price ID in `PricingSection.tsx`, `offer-catalog.ts`, `build-studio-catalog.ts`, `autismCatalog.ts`, `book-store.ts`:
- Confirm the price exists and is active in Stripe (read-only Stripe API).
- Confirm it maps to a fulfillment branch in `_shared/stripe-config.ts`.
- Confirm `stripe-webhook` has a handler that writes a row for that branch.
- Test required: one real Stripe test-mode checkout per branch, then show the order row and the tier change it produced.

**B. Journey paths**
Homepage → offer card → checkout → success redirect → account → dashboard access. Also the public audit funnel: `/audit` → `/audit/intake` → checkout → `/auth` prefilled → report.
- Test required: Playwright run against the live preview capturing the final URL, the created database row, and the function logs for each step.

**C. Access control**
Admin sees everything without paying; corporate tier does not become admin; free tier is correctly gated.
- Test required: query `user_roles` / `user_access_levels` for real rows, then load a gated route as each tier and record what rendered.

**D. Email**
Every template referenced by `send-transactional-email` and the newsletter functions.
- Test required: trigger a send and show the provider response ID, not just a 200 from the function.

**E. Offer CTA inventory (feeds Part 2)**
Produce one table of every offer CTA sitewide: page, offer name, price, current action (Stripe checkout, inquiry dialog, external booking link, dead), and intended action after the lead-page change. This is the artifact that tells us exactly what to re-point and what has no destination today.

**F. Recent changes**
Review the last commits touching `index.html`, contrast token sweep, security hardening, and payment-link guards for regressions the guards would not catch.

### Output format

One table, written to `docs/qa/production-audit.md` at build time:

| Item | Classification | Evidence | Owner | Dependency | User impact today | Exact test to close it |
|---|---|---|---|---|---|---|

Ordered by user impact, not by effort.

---

## Part 2 — The lead generation subdomain

The lead page lives in a separate Lovable project, so it needs its own hostname on your domain.

**How it works:** the FOCUS App project gets a subdomain of `coachkayai.life` (for example `focus.coachkayai.life` or `start.coachkayai.life`). In that project's Settings → Domains, you type the full subdomain into the connect-domain field. Because `coachkayai.life` is already connected to this project, the DNS record for the subdomain is added on the registrar side where that domain is managed — an A record for the subdomain name pointing at Lovable's IP, plus the verification TXT record Lovable shows you. The subdomain is independent of the root domain, so it does not disturb the live site.

You do not need to purchase a second domain. If you have already purchased one, that works too and the same connect flow applies.

**Once the hostname is live**, the re-pointing work is mechanical and driven by the Part 1E table: offers that should become lead-gen get their CTA swapped from Stripe checkout / inquiry dialog to a link at the new subdomain, with campaign parameters so we can attribute which offer sent the lead.

---

## Technical notes

- Audit uses read-only tools only: Stripe API reads, database SELECTs, edge function logs, Playwright against the running preview.
- Playwright runs against the live app with a real signed-in session, so admin/tier checks reflect actual policy evaluation.
- Nothing in Part 2 gets implemented until the subdomain resolves and you confirm which offers become lead-gen rather than direct checkout.
