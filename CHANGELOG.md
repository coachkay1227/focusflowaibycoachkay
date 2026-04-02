# Changelog

All notable changes to the FocusFlow AI platform are documented here.

---

## [1.0.0] — 2026-04-02

### 🚀 Features

#### Core Platform
- **Cinematic design system** — Deep navy/gold/cream palette, Cormorant Garamond + DM Sans fonts, floating orbs, grain overlay, fade-up animations
- **F.O.C.U.S. framework homepage** — 5 pillar cards (Foundation, Opportunity, Create, Unlock, Sustain) replacing generic "Three steps to clarity"
- **Programs section** — 5 pathway cards (1-on-1, Group Journey, Full Access, Reentry & Community, Corporate & Nonprofit)
- **SEO foundation** — JSON-LD structured data, Open Graph tags, per-route meta descriptions via `react-helmet-async`, sitemap.xml, robots.txt

#### AI Coaching
- **AI Coach Chat** (`/coach`) — Conversational coaching powered by Lovable AI with Coach Kay persona
- **Clarity Sessions** (`/clarity`) — 6-question guided self-reflection flow with AI-generated insights
- **Pattern Detection** — Cross-session pattern analysis via `pattern-detect` edge function
- **Weekly Insights** — AI-generated weekly summaries with 24-hour localStorage caching
- **Decision Mode** — Quick decision-making tool widget on dashboard

#### Authentication & User Management
- **Email + password auth** — Sign up, sign in, password reset with email verification
- **User profiles** — Display name, avatar URL with validation
- **Onboarding wizard** — Multi-step flow: primary goal → module selection → coaching style
- **5-tier access system** — Free, Subscriber, Cohort, Premium, Corporate stored in `user_access_levels` table
- **AccessGate component** — Tier-based content gating with blurred preview + lock overlay

#### Enrollment System
- **Module enrollment** — Enroll/unenroll in programs with cloud persistence
- **Challenge enrollment** — Enroll in challenges (Mirror Challenge, etc.)
- **Challenge progress tracking** — Day-by-day entries with cloud sync + localStorage fallback

#### Payments (Stripe)
- **Subscriber tier** — $47/mo recurring subscription via Stripe Checkout
- **Cohort tier** — $297 one-time payment
- **Premium tier** — $997 one-time payment
- **Corporate tier** — $2,497 one-time payment
- **Customer portal** — Manage subscriptions via Stripe Customer Portal
- **Stripe webhook** — Handles `checkout.session.completed` and subscription lifecycle events

#### Community
- **Skool integration** — Community page redirects to real Skool community (skool.com/focusflow-elevation-hub) with Coach Kay bio and member highlights

#### Infrastructure
- **7 edge functions** — coach-chat, clarity-insight, pattern-detect, weekly-insights, check-subscription, create-checkout, customer-portal, stripe-webhook
- **7 database tables** — profiles, user_preferences, user_access_levels, clarity_sessions, module_enrollments, challenge_enrollments, challenge_progress
- **RLS on all tables** — Row-Level Security scoped to `auth.uid()` on every table
- **Cloud session persistence** — Sessions save to DB for authenticated users, localStorage fallback for anonymous
- **Code-split programs** — `programs.ts` (1965 lines) lazy-loaded only on `/modules` route

---

### 🐛 Bug Fixes

1. **Insight save bug** — `ResultScreen.tsx` saved `null` insight to DB because `setTimeout` captured stale React state. Fixed by passing `insightData` directly from the resolved promise instead of reading from state.

2. **Tier overwrite bug** — `check-subscription` reset manually-set tiers (cohort/premium/corporate) to "free" every 60 seconds. Fixed to only overwrite `subscriber` tier when Stripe says inactive; never touches other tiers.

3. **Booking link placeholder** — `ResultScreen.tsx` CTA linked to `calendly.com`. Replaced with actual booking URL: `https://call.coachkayelevates.org/widget/booking/d93xqjlytvCCkndwqJmu`

4. **Hardcoded preview domain in JSON-LD** — Lovable preview URL baked into structured data. Replaced with dynamic `window.location.origin`.

5. **Enrollment errors silently swallowed** — All enrollment functions caught errors and did nothing. Added toast notifications for success/failure feedback.

6. **Dashboard program titles unresolved** — Dashboard showed raw module IDs instead of human-readable titles. Added title resolution from programs catalog.

---

### 🔒 Security

1. **JWT auth on AI edge functions** — Added `Authorization` header verification to `coach-chat`, `pattern-detect`, `clarity-insight`, and `weekly-insights`. Returns 401 for unauthenticated requests.

2. **Security headers** — Added to `vercel.json`: `X-Frame-Options: DENY`, `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.

3. **Password HIBP check** — Enabled leaked password protection in auth settings to prevent signups with known breached passwords.

4. **DELETE policy for clarity_sessions** — Added RLS policy so users can delete their own sessions (GDPR compliance).

5. **Avatar URL sanitization** — Added URL validation before rendering user-provided avatar URLs.

---

### 🧹 Cleanup & DX

1. **Removed 32 unused shadcn/ui components** — Pruned accordion, alert, calendar, carousel, chart, checkbox, command, drawer, form, hover-card, menubar, navigation-menu, pagination, popover, radio-group, resizable, scroll-area, select, sidebar, slider, switch, table, tabs, toggle-group, and more.

2. **Extracted shared constants** — `TIER_RANK` and `TIER_LABELS` moved to `src/lib/tier-constants.ts` to eliminate duplication across AccessGate, Modules, and ProgramDetail.

3. **Extracted mouse glow hook** — Shared `useMouseGlow` hook replaces duplicated mouse-follow glow logic across 9 page files.

4. **Project documentation** — Added `README.md`, `filesExplainer.md`, `scripts.md`, and system architecture diagram.

5. **Email templates** — Built HTML email template system with preview page at `/email-preview` (enrollment confirmation, challenge reminder, session summary, weekly digest).

---

### ⚠️ Known Limitations

- **Cohort code system** — UI shows a disabled "Enter Code" button but no code entry/validation flow exists yet.
- **Split payment plans** — Advertised on some programs but Stripe only processes single payments.
- **E2E tests** — Playwright is configured but no test files written yet.
- **`wrdLink` field** — Defined on every program in `programs.ts` but unused; WRD short-link page not built.
