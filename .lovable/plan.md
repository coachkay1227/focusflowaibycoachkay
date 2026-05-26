# Authentic testimonials + correct contact email

## 1. New testimonials (Sheila, Starr, Buzz)

Replace the placeholder names (Aisha M. / David R. / Priya S.) on the homepage "What they're saying" section with three real-feeling voices that map to what Coach Kay actually delivers: **cohort coaching, simplified AI, and the F.O.C.U.S. framework** (Focus · Ownership · Clarity · Uplevel · Sustain).

Proposed copy:

- **Sheila — Cohort Member, Reset 30** *(F · Focus)*
  > "I joined the cohort thinking I needed another productivity system. Coach Kay showed me I needed focus. By week two, the noise was gone — I knew exactly which one thing to protect every morning."

- **Starr — Life Coaching Client, Transformation 90** *(C · Clarity / U · Uplevel)*
  > "Coach Kay made AI feel like a journal that actually answers back. The Clarity Check named the pattern I'd been dancing around for years in one paragraph. That's when I stopped second-guessing and started building."

- **Buzz — Founder, AI Simplified Track** *(O · Ownership / S · Sustain)*
  > "I'm not techy. Coach Kay walked me through AI like a friend, not a manual. Three weeks in, I had a workflow I actually own — not one I rented from a YouTube video."

Each card adds a small F.O.C.U.S. pillar chip under the role (e.g. `F · FOCUS`, `C · CLARITY · U · UPLEVEL`) using existing `font-mono-label text-primary` styling — no new components.

## 2. Where to apply

- `src/pages/Index.tsx` (homepage "What they're saying", lines 510–528) — primary swap + pillar chip.
- `src/pages/Kiosk.tsx` (rotating quotes, lines 6–19) — mirror the same 3 voices, shorter (kiosk-friendly).

CoachKay.tsx and Community.tsx use a different set of names (Amira/David T./Sarah/Marcus and Jordan/Serena/Marcus) — **left alone unless you say otherwise** (open question below).

## 3. Contact email correction

Replace `hello@coachkayai.life` → `hello@coachkayelevates.org` everywhere it appears:

- `src/components/SiteFooter.tsx` (nav + visible contact line)
- `src/pages/legal/RefundPolicy.tsx` (2 mailtos)
- `src/pages/legal/Disclaimer.tsx`
- `src/pages/legal/Terms.tsx` (LLC signature line)

(`seo-schema.ts` and `use-roles.ts` already use the correct address.)

## 4. Verification

After edits: load `/` and screenshot the testimonials grid to confirm names + pillar chips render, then load `/refund-policy` and `/terms` to confirm the new mailto.

## Open question before I build

Should I also rewrite the testimonials on **/coach-kay** (4 quotes) and **/community** (3 quotes) to follow the same Sheila/Starr/Buzz-style cohort + F.O.C.U.S. voice, or keep those pages as-is for now?
