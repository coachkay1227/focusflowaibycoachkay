# Final Plan — Phase 1 (Collective Trust Layer) + Phase 4 Surprise

Locked in based on your answers. Credit-aware: this is the **last build**. Two phases, shipped in one pass, audited before handoff.

---

## Decisions locked in

- **Logo**: extract from the onboarding packet PDF (Collective AI lockup). If extraction fails, ship a tasteful text lockup ("Collective AI") in brand fonts as fallback — no broken images.
- **Entity**: Focus Flow AI LLC, DBA Coach Kay Elevates. Footer copyright updated to reflect this.
- **Booking strategy**: **NO new `/book` route, no duplicate booking surface.** All "talk to Kay" / scoping / discovery CTAs across this site point to `https://coachkayelevates.org/` (your booking home). Single source of truth — your offers live here, your calendar lives there.
- **Recommended booking tiers** for you to set up on coachkayelevates.org (not built here, just my recommendation):
  - **15 min — Free Clarity Call** (qualifier, low friction, feeds Programs/Build Studio)
  - **30 min — Free Discovery Scope** (Advisory/Build Studio/Local-Gov leads only — gated by inquiry form so it doesn't get abused)
  - **45 min — Paid Strategy Session $67** ← your pick, confirmed. High-intent buyers, refundable into any program/audit purchase within 14 days (Hormozi risk-reversal).
- **Donations**: external link to your nonprofit donation modal page (the "Choose Your Donation Amount" UI in your screenshot). Open in new tab, `rel="noopener"`. We do NOT rebuild that UI here.
- **Phase 4 surprise**: scoped to ONE high-leverage wow moment — see below.
- **All other phases (2, 3, 5)**: deferred. Documented in `.lovable/plan.md` as backlog so a future session can pick up cleanly.

---

## Phase 1 — Collective AI Trust Layer

### Build
1. **`src/assets/collective-ai-logo.png`** — extract from onboarding packet via `document--parse_document`. Fallback: clean text lockup component.
2. **`src/components/SiteFooter.tsx`** — replace existing footer:
   - Add trust line under brand block: *"Coach Kay is Operations Architect & Lead Developer at **Collective AI** — a multidisciplinary AI delivery team. Solo coaching by Kay. Enterprise builds delivered with the collective."*
   - Small Collective AI logo lockup beside it.
   - Add **"Book with Coach Kay"** column linking out to `coachkayelevates.org` (15 / 30 / 45 min options described as labels, each linking to the same external home — they'll route correctly once you wire calendars there).
   - Update copyright to "© {year} Focus Flow AI LLC · DBA Coach Kay Elevates."
   - Footer-only link to `/collective`.
3. **`src/pages/Collective.tsx`** (new) — single trust page (~600 words). Sections: who Collective AI is, Kay's two hats, what the team delivers, capability snapshot, single CTA "Start a Build Conversation" → `/build-studio`, secondary "Book 1:1 with Kay" → external `coachkayelevates.org`.
4. **`src/App.tsx`** — register `/collective` lazy route.
5. **`src/pages/CollectiveAIBuildStudio.tsx`** — hero eyebrow becomes "Collective AI Build Studio · Led by Coach Kay" + one-line "Delivered by the Collective AI team" strip.
6. **`src/pages/Advisory.tsx`** — add compact "Who delivers" card (role-only: Operations Architect, Lead Engineer, AI Researcher, Designer). Replace existing inline Advisory booking CTAs to point to `coachkayelevates.org`.
7. **`src/pages/CoachKay.tsx`** — add anchored "Two hats, one mission" section (~80 words) linking to `/collective`. Primary CTA → `coachkayelevates.org`.
8. **`src/lib/seo-schema.ts`** — add `memberOf: { @type: Organization, name: "Collective AI" }` on Person schema. Update Organization `legalName` to "Focus Flow AI LLC".
9. **`public/sitemap.xml` + `scripts/generate-sitemap.ts` + `scripts/check-seo-regressions.ts`** — include `/collective`.
10. **External-link audit pass**: every "Book", "Schedule", "Talk to Kay", "Discovery Call" CTA on Coach Kay, Advisory, Build Studio, Rent-an-Agent, Index → `coachkayelevates.org` (target=_blank, rel=noopener).

---

## Phase 4 Surprise — "The Mirror" (one wow moment on `/truth`)

A single, memorable interaction that makes Truth feel alive without bloating credits or adding libraries. Pure CSS + IntersectionObserver, no new deps.

**What it is**: a scroll-triggered "AI thought reveal" hero panel on `/truth` — when the user scrolls into the Myth-Busting section, a typewriter-style reveal types out: *"You came here for the truth. Here it is: AI won't replace you. But the version of you that ignores it... will be replaced by the version that doesn't."* — letter by letter, gold cursor blinking, then the rest of the page unlocks with a soft fade-up cascade.

Why this and not the full Phase 4: it gives the "blow my mind" moment for free (no edge function call, no API cost, no library), works on mobile, and gives Truth a signature beat that nothing else on the site has. It's the kind of thing people screenshot.

**Built in**: `src/pages/TruthAboutAI.tsx` + one small `src/components/truth/MirrorReveal.tsx`.

---

## Verification gate (before I tell you it's done)

1. `bun run scripts/generate-sitemap.ts` + `bun run scripts/check-seo-regressions.ts` both pass.
2. Read every changed page back, walk at 1280px and 375px.
3. Click-test every external booking CTA → confirms it opens `coachkayelevates.org` in new tab.
4. `/collective` renders, JSON-LD valid, indexable.
5. Footer trust line + logo render sitewide.
6. `/truth` Mirror reveal triggers on scroll, no jank, mobile-safe.
7. Console + network log scan, zero new errors.
8. Backlog written to `.lovable/plan.md` so Phases 2, 3, 5 can resume cleanly later.

---

## Two tiny confirmations before I switch to build

1. **Booking link target** — confirm `https://coachkayelevates.org/` (root) is correct, or do you have a deeper path like `/book` on that site I should use?
2. **Mirror Reveal copy** — keep the line above as-is, or want to write your own? (I can ship with mine and you can tweak after.)

Answer those and I'll build straight through.
