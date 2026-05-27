## Where we actually stand

Everything below is the truth after auditing the codebase, not a wishlist.

### Already shipped (don't re-touch)
- Global footer wrapper (`GlobalFooter.tsx`) renders on all public routes; legacy duplicate footers removed.
- Symmetric grid helper (`src/lib/grid.ts`) wired into Modules, Store, RentAnAgent — no more 3+1 orphans; mobile flows 1/1/1.
- Nav rename: "Studio" → "AI Build Studio", "Truth" → "The Truth About AI", "Coach Kay" → "Meet Coach Kay" on desktop + mobile.
- F.O.C.U.S. homepage, Truth page (8 pledges + Tool Picks), Collective, Autism Social Stories, Build Studio, Rent-an-Agent, Advisory, Store, Starter Kit, Audit flow, Sitemap, Legal pages, FAQ.
- Auth (email+password, HIBP, reset), Onboarding, Dashboard, Clarity Sessions, Mirror Challenge, Coach Chat, Profile, Admin suite.
- Stripe: subscription + 3 one-time tiers, webhook, customer portal, autism orders, book orders, audit checkout.
- Transactional email (Lovable templates + Resend) + GHL marketing webhook on signup, clarity-complete, application.
- Security headers, RLS on every table, JWT on AI edge functions.

### Started, not finished
1. **Newsletter / waitlist capture** — nothing exists in the app today. No popup, no inline form, no `newsletter_subscribers` table, no Beehiiv integration. This is the biggest gap before launch.
2. **Auth email domain** — `notify.coachkayelevates.org` DNS is pending (per memory). Until linked, auth emails go through Supabase default sender, which hurts deliverability.
3. **404/dead-link sweep** — partial. Footer links work; not all `to="/..."` across deeper pages have been verified end-to-end.

### Not started (and not needed for launch)
- Tool Vault + P.A.U.S.E. Hub with Realtime publishing (we agreed to defer until after launch).
- Per-offer funnels, multi-site split (nonprofit / for-profit / wealth).
- Scam alert scraper / cron.

### Launch-ready verdict
**Not quite — but close.** Three blockers: (1) no email capture, (2) unverified deep-link integrity, (3) email-sequence backbone not wired to a list. Everything else is launchable.

---

## The phased plan

Each phase has a clear deliverable, an audit step, and a stop-check before the next phase begins. I will not start a phase until the previous one is verified.

### Phase 1 — Newsletter waitlist capture (Beehiiv-ready, works without it)

**Goal:** Capture every email from day one — even before your Beehiiv setup is solid. When you're ready, flip a switch and the same captures forward to Beehiiv.

**What ships:**
- New `newsletter_subscribers` table (email, name optional, source, created_at, synced_to_beehiiv bool, RLS: insert-anon, select-admin).
- `<NewsletterWaitlist />` component used in three spots:
  - Footer inline ("Join the FocusFlow Newsletter — coming soon").
  - Soft popup (delay 30s OR 50% scroll, once-per-visitor via localStorage, dismissible, never shown on /auth /dashboard /admin /checkout flows).
  - Inline block on `/truth`, `/coach-kay`, `/community` bottom.
- Edge function `newsletter-subscribe` that:
  - Writes to the table (always).
  - If `BEEHIIV_API_KEY` secret is present, also POSTs to Beehiiv's `/publications/{id}/subscriptions` endpoint.
  - If not, just stores locally — zero error to the user.
- Admin view `/admin/newsletter` listing captures (CSV export button) so you can manually push to Beehiiv anytime.
- Source-tagged so you know which page captured the lead.

**Beehiiv hook (when you're ready):** You hand me your Beehiiv API key + publication ID, I add the secret, captures auto-sync going forward and I run a one-time backfill of stored emails. SparkLoop works because the subscriptions land in Beehiiv natively.

**Audit before Phase 2:**
- Submit a test email from footer, popup, and inline. Verify row in DB.
- Verify popup doesn't re-show after dismiss; doesn't appear on app-shell routes.
- Verify graceful behavior when Beehiiv key is absent (no console errors).

---

### Phase 2 — 404 + dead-link sweep + SEO sanity

**Goal:** No visitor ever hits a white screen or broken link.

**What I do:**
- Grep every `to="/..."` and `href="/..."` in the codebase against `App.tsx` routes. Fix or redirect any mismatch.
- Manually hit every public route (20 of them) in the preview, confirm render + footer + nav.
- Confirm legacy redirects still work: `/about → /coach-kay`, `/ai-starter-kit → /starter-kit`, `/email-unsubscribe → /unsubscribe`.
- Regenerate `public/sitemap.xml` so every live public route is listed.
- Confirm `robots.txt` allows the right stuff and blocks `/admin`, `/dashboard`, `/auth`, `/profile`, `/onboarding`, `/clarity`, `/mirror-challenge`, `/order-success`, `/audit/intake`, `/audit/report`.
- Confirm each public page has a unique title + meta description via `SEOHead`.

**Audit before Phase 3:** Manual screenshot pass of every public route at 369px (mobile) and 1280px (desktop). Catch any layout breakage.

---

### Phase 3 — Email backbone confirmation (no new code, just verification)

**Goal:** Make sure transactional + GHL marketing fires cleanly so you can start sequencing the moment you're back.

**What I do:**
- Run a test signup, confirm: welcome email arrives, GHL webhook fires with `event: "signup"`.
- Run a test clarity session, confirm GHL fires with `event: "clarity_session_complete"`.
- Run a test Apply Now, confirm `application-received` + GHL fire.
- Run a test newsletter signup (from Phase 1), confirm GHL fires with `event: "newsletter_signup"` (I'll add this trigger in Phase 1).
- Document the 4 trigger payloads in `.lovable/memory/features/email-strategy.md` so your GHL workflows can match field-for-field.

**Audit:** Show you the test logs. No email-sequence content writing — that's your next chapter, on your terms.

---

### Phase 4 — Pre-launch polish + smoke test

**Goal:** Last 5%. Ship-ready.

**What I do:**
- Lighthouse-style spot-check on `/`, `/store`, `/coach-kay`, `/truth` — fix anything red.
- Verify Stripe checkout end-to-end on one $47 sub product (test mode) — does the welcome email fire, does the user land on `/order-success`, does tier update.
- Verify mobile nav, footer wraps properly on 369px viewport (your current viewport).
- Verify the chat widget loads on every public page without console errors.
- Final `console.log` / `console.error` scrub in production code paths.
- Bump CHANGELOG with the launch entry.

**Output:** A short "launch checklist passed" report. You publish.

---

## What I will NOT do without you saying so

- Will not touch coachkayelevates.org or forwardfocuselevation.org references — they stay external.
- Will not auto-write any marketing email copy. Captures only.
- Will not build the Tool Vault / scam alerts / Realtime stuff.
- Will not split into multiple sites.
- Will not enable auto-confirm on signup.

## Technical bits (skim if you want)

- New table migration with grants + RLS (anon INSERT, admin SELECT, service_role ALL).
- New edge function `newsletter-subscribe` with JWT optional (anon allowed), rate limited by IP via a tiny in-function check, zod validation on email.
- New component `src/components/NewsletterWaitlist.tsx` + `src/components/NewsletterPopup.tsx` mounted once in App.tsx behind a route filter (same pattern as `GlobalFooter`).
- New admin page `src/pages/admin/AdminNewsletter.tsx` with CSV export.
- Beehiiv integration behind `BEEHIIV_API_KEY` + `BEEHIIV_PUBLICATION_ID` secrets — added only when you give them to me.

## Credit discipline

Phases 1 and 2 are the meat. Phase 3 is verification (cheap). Phase 4 is polish (cheap). I batch file reads/writes in parallel, no exploratory rewrites. If anything in Phase 2 reveals a deeper issue, I stop and ask before fixing — no scope creep.

---

Approve this and I'll start Phase 1. After each phase I'll report back with what was verified and what Phase N+1 will do — your call to proceed each time.