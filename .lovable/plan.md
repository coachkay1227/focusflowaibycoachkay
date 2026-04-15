

# Full Brand, Performance & Product Alignment Audit + Fixes

## What You're Asking For (Broken Down)
1. Font consistency across all pages
2. Coach Kay chat should feel like a real AI conversation (like Claude)
3. Every page at 100% Lighthouse (performance, SEO, accessibility)
4. No bugs, no silent failures, no duplicates, no undone code
5. Challenges page — what does each challenge actually DO when you click it?
6. Paid tiers under admin — how to test them
7. Price/sales alignment — what's promised vs what's connected
8. Offers not in app that may need a response
9. Email campaign readiness

This is too large for a single pass. Here's a phased plan.

---

## Phase 1 — Font Consistency + Coach Chat Quality

### Font Issues Found
- Fonts are properly defined: `Cormorant Garamond` for headings, `DM Sans` for body, `DM Mono` for labels
- The tailwind config registers them as `font-heading`, `font-body`, `font-mono`
- CSS base layer applies them globally to `body` and `h1-h6`
- **Actual problem**: Many components use `font-heading` inline but some prose areas (especially Coach Chat markdown output and challenge prompts) inherit browser defaults or get overridden by `prose` classes
- Coach Chat markdown output uses `prose prose-sm prose-invert` which may reset fonts to system serif

### Fixes
- **CoachChat.tsx**: Override prose font-family to use DM Sans for body and Cormorant Garamond for headings inside markdown output. Add proper prose customization classes.
- **CoachChat.tsx**: The chat currently works well with streaming SSE, but the empty state and overall UX need polish — add suggested starter prompts (like Claude's conversation starters), better typing indicator, and proper message spacing.

### Files Changed
- `src/pages/CoachChat.tsx` — prose font overrides, starter prompt chips, improved UX
- `src/index.css` — add prose overrides for `.prose` inside chat context

---

## Phase 2 — Accessibility & Performance Fixes

### From Lighthouse (98 performance, 98 accessibility)
- **Cache policy**: Main JS bundle has `cache-lifetime: 0` — this is a Lovable hosting issue, not fixable in code
- **Render-blocking**: Google Fonts CSS is render-blocking (250ms). Fix: add `media="print" onload="this.media='all'"` pattern or use `font-display: swap` (already using `display=swap`)
- **Unused JS**: 144 KiB of unused JS in main bundle — code-splitting is already in place with lazy routes. Further reduction requires removing unused library code (diminishing returns)
- **Max Potential FID**: 310ms — caused by main bundle parse time. Already lazy-loading.
- **Accessibility**: Score is 98. Need to check for missing `aria-labels`, contrast ratios, and form labels across all pages.

### Fixes
- Add `fetchpriority="high"` to font preconnects
- Add `aria-label` to all icon-only buttons across all pages
- Verify color contrast on muted text (cream on dark navy)
- Add skip-to-content link for screen readers

### Files Changed
- `index.html` — font loading optimization
- Multiple page files — aria-label additions

---

## Phase 3 — Challenges: What Each One Actually Does

### Current State
- `/challenges` shows 6 challenge types (3-day through 30-day) with titles, descriptions, and enroll buttons
- Clicking "Begin challenge" navigates to `/challenges/{type}` which loads `MirrorChallenge.tsx`
- `MirrorChallenge.tsx` has prompts for all 6 types (3, 4, 7, 8, 14, 30 day)
- Each day shows a prompt, user writes a reflection, saves to cloud storage
- **The actual coaching content is there** — prompts are specific and meaningful
- **What's missing**: The challenge cards on `/challenges` don't explain what happens day-by-day. Users can't preview the journey before enrolling.

### Fixes
- Add a "What to expect" expandable section or detail page for each challenge showing day-by-day preview (first 2-3 prompts visible, rest teased)
- Make challenge descriptions more action-oriented

### Files Changed
- `src/pages/Challenges.tsx` — add expandable day preview

---

## Phase 4 — Paid Tier Testing for Admin

### Current State
- Stripe is fully wired: `create-checkout`, `check-subscription`, `stripe-webhook`, `customer-portal`
- Stripe is in live mode (real price IDs like `price_1THJVvBReje0oFcLhkxCXesA`)
- **To test paid tiers as admin**: You can use the admin panel to manually set your access level in the `user_access_levels` table, or use Stripe test mode

### Recommendation (no code change needed)
- Use the existing admin user management (`/admin/users`) to upgrade your own account's tier to `subscriber`, `cohort`, or `premium` to see what each tier unlocks
- For actual payment testing, Stripe test mode requires switching price IDs — this would be a separate configuration task

---

## Phase 5 — Price/Sales Alignment Audit

### What's Promised vs What's Connected

| Offering | Price | In Stripe? | In App? | Purchasable? |
|---|---|---|---|---|
| Subscriber Monthly | $27/mo | Yes (price_1THJ...) | Yes — Modules pricing section | Yes |
| 30-Day F.O.C.U.S. Reset | $297 | Yes (price_1THkx...) | **Not shown in pricing grid** | Yes via ProgramDetail |
| 30-Day Intensive | $497 | Yes (price_1THlFp...) | Yes — Modules pricing section | Yes |
| 8-Week Cohort | $997 | Yes (price_1THkwQ...) | Yes — Modules pricing section | Yes |
| 12-Week Mastery | $1,997 | Yes (price_1THlGg...) | **Not shown in pricing grid** | Yes via ProgramDetail |

**Gaps Found:**
1. The $297 "30-Day F.O.C.U.S. Reset" is in Stripe but NOT in the Modules pricing grid — only the $497 30-Day Intensive is shown
2. The $1,997 "12-Week Mastery" is in Stripe but NOT in the Modules pricing grid
3. Payment plans (3 installments) are defined in program data but **no installment checkout flow exists** — only single payments
4. `validateCohortCode()` uses hardcoded codes, not connected to any backend

### Fixes
- Add missing tiers to the pricing grid on `/modules` OR intentionally exclude them (your call)
- Payment plans would require Stripe subscription schedules — flag for future

---

## Phase 6 — Offers Not in App

### Identified External Offers Without App Presence
1. **Corporate & organizational cohorts** — mentioned in footer text on Index but no intake form or pricing
2. **Forward Focus Elevation (nonprofit)** — linked externally but no integration
3. **Skool Community** — linked to external Skool page, no in-app community features
4. **1:1 Private Sessions with Coach Kay** — mentioned in 12-Week Mastery description but no booking flow
5. **Application-required programs** (30-Day Intensive, 12-Week Mastery) — descriptions say "application required" but there's no application form

### Recommendation
- These need landing pages or intake forms if they're being marketed. At minimum, a "Contact for Details" or "Apply Now" CTA that opens an email or form.

---

## Phase 7 — Email Campaign Readiness

### Current State
- `send-email` edge function exists with multiple templates (welcome, session-complete, weekly-insights, challenge-complete, subscription-confirmed)
- `email-templates.ts` has client-side template definitions
- **No email domain is configured** — emails won't send until a domain is set up
- No automated drip/nurture campaigns exist
- Weekly insights edge function (`weekly-insights`) exists but depends on email sending

### Recommendation
- Set up an email domain first (required before any emails send)
- Then wire automated triggers: welcome email on signup, session complete, weekly digest

---

## Proposed Execution Order

Given the scope, I recommend tackling this in 3 implementation sessions:

**Session 1** (this approval):
1. Fix font consistency across all pages (especially Coach Chat prose)
2. Polish Coach Chat UX (starter prompts, better markdown rendering)
3. Add aria-labels for accessibility
4. Add challenge day previews

**Session 2** (next):
5. Fix pricing grid alignment (show all tiers or clarify which are hidden)
6. Add "Apply Now" CTAs for application-required programs
7. Add contact/intake for corporate and 1:1 offerings

**Session 3** (next):
8. Email domain setup and automated email triggers
9. Payment plan implementation (if desired)

### Files Changed in Session 1
- `src/pages/CoachChat.tsx` — font overrides, starter prompts, UX polish
- `src/index.css` — prose font customization
- `src/pages/Challenges.tsx` — day preview sections
- `index.html` — accessibility skip link
- Multiple pages — aria-label additions on icon buttons

