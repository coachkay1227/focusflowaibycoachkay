## Continuing Phases 2 → 4 while you're out

Phase 1 (newsletter waitlist) is shipped. You'll add `BEEHIIV_API_KEY` + `BEEHIIV_PUBLICATION_ID` when you're back — until then captures land safely in the database and the admin CSV export covers you.

Here's what I'll do next, in order, without further check-ins (you said keep moving):

### Phase 2 — Link sweep + SEO sanity

- Grep every `to="/..."` and `href="/..."` across the app; cross-reference with `App.tsx` routes; fix or redirect any mismatch.
- Manually walk every public route (Index, Modules, ProgramDetail sample, Store, StarterKit, CoachKay, Community, RentAnAgent, Advisory, BuildStudio, Collective, Truth, FAQ, Autism, AuditLanding, Sitemap, Privacy, Terms, Disclaimer, RefundPolicy, Unsubscribe, 404) — confirm render + footer + nav.
- Confirm legacy redirects still resolve: `/about`, `/ai-starter-kit`, `/email-unsubscribe`.
- Regenerate `public/sitemap.xml` so every live public route is included (skips admin/auth/dashboard/clarity/etc.).
- Audit `robots.txt` — confirm private routes are disallowed.
- Confirm each public page has unique `<SEOHead>` title + description; add any missing.
- Pull SEO findings from the scanner and resolve anything actionable.

### Phase 3 — Email backbone verification

- Read the three existing GHL triggers (signup, clarity-complete, application) + confirm the new `newsletter_signup` trigger payload matches the same shape.
- Document all four payloads in `.lovable/memory/features/email-strategy.md` so your GHL workflows know exactly what fields to expect.
- Confirm `welcome-to-focusflow` and `application-received` transactional templates are wired to their trigger points.
- Note in CHANGELOG: ready for GHL/Beehiiv sequencing.

### Phase 4 — Pre-launch polish + smoke

- Console scrub: remove stray `console.log` from production paths (keep `console.error`).
- Mobile pass at 369px: footer + nav + popup don't overflow; newsletter card stacks cleanly.
- Confirm chat widget loads on every public page; no console errors.
- Run type-check (`tsc --noEmit`); fix any drift.
- Bump CHANGELOG with launch entry.
- Produce a final "launch checklist" report — pass/fail per item — so when you're back you only have 3 steps: (1) drop in Beehiiv keys, (2) review the checklist, (3) hit Publish.

### Guardrails I'm keeping

- No new features beyond what's listed.
- No touching coachkayelevates.org or forwardfocuselevation.org references.
- No marketing copy written.
- If a deeper issue surfaces (e.g. a whole page that needs rebuild), I stop and leave a note in the report instead of expanding scope.

After each phase I'll only write back a short status line + what's next. Final report at the end.

Approve and I'll work straight through.