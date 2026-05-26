# /coach-kay audit — nav fix, accurate bio, compliant brand listings

## Problem 1 — No way out of the page

`src/pages/CoachKay.tsx` (line 39+) renders straight into a hero with **no DesktopNav and no MobileNav**. Every other public route mounts them. The page is a dead-end on desktop AND mobile.

**Fix:** import and render `DesktopNav` (top, sticky) + `MobileNav` (hamburger) at the top of the component, exactly like `Community.tsx` / `Index.tsx` do. Add a small "← Back to Home" link in the hero on mobile for redundancy.

## Problem 2 — Bio is generic and slightly inaccurate

The current copy invents stats ("500+ Clients Coached Worldwide") and ignores what's actually on `coachkayelevates.org`. The real public bio says:

- **Founder & CEO, Focus Flow Elevation** — Columbus, OH. Woman-owned, COED partner.
- **5x certified life coach**, full-time banking professional, single mom to a daughter with autism.
- Credentials: Certified Transformation Life Coach · Mindfulness & Goal Setting Specialist · Life Purpose Coaching Certification · Accredited Consultant Strategist.
- Business readiness: Columbus Chamber member · COED workforce partner · general + professional liability insurance · accepts purchase orders.
- Two parallel missions: **for-profit workforce/AI literacy** (coachkayelevates.org) and **nonprofit justice-impacted family support** (forward-focus-elevation.org).

**Fix:** rewrite the bio + credentials grid to mirror the real story and credentials (no invented numbers). Add a single "Recognized for" row with: Woman-owned · COED Partner · Columbus Chamber · WIOA-aligned.

## Problem 3 — Two real brands aren't listed

Add a new **"Where Coach Kay's Work Lives"** section above the final CTA. Two equal cards, compliant phrasing — no donation solicitation here (donations only on the nonprofit site itself), and clearly disclose nonprofit vs for-profit status.

**Card 1 — Coach Kay Elevates (for-profit)**
- Tag: `FOR-PROFIT · COLUMBUS, OH`
- Headline: "Workforce Readiness & AI Literacy"
- Body: "Structured cohort program helping working families build AI literacy, career-ready skills, and sustainable momentum. COED partner. WIOA-aligned. Pilot programs available."
- CTA: `Visit coachkayelevates.org →` (opens new tab, `rel="noopener noreferrer"`)

**Card 2 — Forward Focus Elevation (nonprofit)**
- Tag: `NONPROFIT · JUSTICE-IMPACTED FAMILIES`
- Headline: "Trauma-Informed Family Support"
- Body: "AI-enhanced, trauma-informed, income-based support for justice-impacted families and crime victims/survivors. Free learning community, peer support, crisis resources."
- Crisis line micro-row: `Crisis? 911 · 211 · 988 · Text HOME to 741741` (small, muted).
- CTA: `Visit forward-focus-elevation.org →` (new tab, `rel="noopener noreferrer"`)

**Compliance details applied to both cards:**
- Explicit "for-profit" / "nonprofit" labels so users aren't misled about tax-deductibility.
- `target="_blank" rel="noopener noreferrer"` on every external link.
- `aria-label` includes "opens in new tab".
- External-link icon (lucide `ExternalLink`) next to each link.
- A short footnote under the section: "Forward Focus Elevation is a separate nonprofit entity. Donations and program participation are governed by that organization's own terms and privacy policy."

## Problem 4 — Testimonials still use placeholder names

The 4 quotes (Amira/David T./Sarah/Marcus) don't match the Sheila/Starr/Buzz voices we just unified on the homepage. Swap to the same authentic Coach Kay Elevates voice with **F.O.C.U.S. pillar chips** so the brand reads consistent end-to-end. Keep 4 cards (homepage has 3); add a 4th "Forward Focus Elevation" community voice to reflect the nonprofit work.

## Problem 5 — SEO + JSON-LD

- Update `webPage("/coach-kay", "Coach Kay", "AboutPage")` description to mention both organizations.
- Add a Person JSON-LD with `sameAs: ["https://coachkayelevates.org/", "https://forward-focus-elevation.org/"]` so search engines connect the three properties. (Helper already exists in `seo-schema.ts`; reuse `PERSON_ID`.)

## Verification

After build:
1. Open `/coach-kay` on desktop (1750px) — confirm `DesktopNav` shows and "Home / Programs / Community / Sign in" links work.
2. Resize to mobile (375px) — confirm hamburger appears and opens MobileNav.
3. Click both external brand cards — confirm new tab, correct URL, no referrer leak.
4. Run a quick view-source check that the Person JSON-LD includes both `sameAs` URLs.

## Files touched

- `src/pages/CoachKay.tsx` — nav imports, bio rewrite, credentials rewrite, new "Where this work lives" section, testimonials swap, JSON-LD update.
- (no new components needed; reuse existing `DesktopNav`, `MobileNav`, `AnimatedSection`, `Button`, lucide `ExternalLink`.)

## Open question

Do you want the new **"Where Coach Kay's work lives"** section **only on /coach-kay**, or should I also surface those two brand cards in the global `SiteFooter` (as a "Sister organizations" row) so every page acknowledges both entities? Footer placement is the standard compliant pattern for multi-entity brands, but it's a bigger change.
