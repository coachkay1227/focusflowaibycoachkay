# Navigation Reorganization — "Can't Get Lost" Plan

## The Problem
- "For Individuals / For Organizations" forces a false split (Rent-an-Agent serves both).
- 10 built pages are invisible: `/ai-tools`, `/pause-hub`, `/starter-kit`, `/challenges`, `/mirror-challenge`, `/assessment`, `/coach`, `/autism-social-stories`, `/audit/landing`, `/kiosk`.
- We need one mental model that works for a curious visitor AND a paying client.

## New Structure — Organized by Intent, Not Audience

Four top-level groups. Each answers a different visitor question.

```
[Logo]   Start Here ▾   Work With Me ▾   Tools & Resources ▾   Truth ▾        [Start Clarity] [Account]
```

### 1. Start Here  (the on-ramp — anyone, free)
- Clarity Session — `/clarity`
- Starter Kit — `/starter-kit`
- Free Assessment — `/assessment`
- Mirror Challenge — `/mirror-challenge`
- 30-Day Challenges — `/challenges`

### 2. Work With Me  (paid engagements — by depth, not audience)
- Transformation Paths — `/modules`  *(personal · business · full AI)*
- Books & AI Kits — `/store`
- Rent-an-Agent — `/rent-an-agent`  *(individuals + teams)*
- AI Build Studio — `/build-studio`  *(custom builds)*
- Advisory & Partnership — `/advisory`  *(fractional / enterprise)*
- Collective AI — `/collective`  *(the delivery team)*
- Business Audit — `/audit/landing`
- Autism Social Stories — `/autism-social-stories`

### 3. Tools & Resources  (the public library — the orphans get a home)
- AI Tools Directory — `/ai-tools`  *(63 vetted tools w/ affiliate links)*
- Pause Hub (Scam Watch) — `/pause-hub`
- Coach Chat (AI) — `/coach`
- Elevation Hub (Skool Community) — `/community`

### 4. Truth & About  (trust + voice)
- The Truth About AI — `/truth`
- Meet Coach Kay — `/coach-kay`
- FAQ — `/faq`

### Always-visible
- `[Start Clarity]` primary CTA (unchanged)
- Account avatar → Dashboard / Profile / Admin / Sign out (unchanged)
- `/kiosk` stays hidden (intentional — standalone display)

## Mobile
Same 4 accordions in `MobileNav`, same items, same order. Each defaults closed except "Start Here" (the most common entry).

## What I Will NOT Touch
- Auth, routing logic in `App.tsx`, access gates, tier logic
- Any page content, Stripe, edge functions, RLS
- Admin nav (already clean)
- Footer legal links
- The home page (nav hides on `/` — unchanged)

## Files Changed (2)
- `src/components/DesktopNav.tsx` — restructure the 2 dropdowns into 4 groups; widen mega-menu, add icons for new items.
- `src/components/MobileNav.tsx` — mirror the 4 groups as accordions; import new icons.

## Risk Mitigation
- Pure presentational change. No route additions, no data shape changes, no auth changes.
- All target routes already exist in `App.tsx` (verified in last audit).
- Will visually QA both viewports after the edit.

## Out of Scope (next moves, separate asks)
- OpenAI surveillance content on `/truth`
- FTC/FBI scam ingestion edge function
- Beehiiv embed verification
- Flipping affiliate_pending flags once VA returns links