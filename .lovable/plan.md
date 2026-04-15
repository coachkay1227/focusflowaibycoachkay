

# Session 2: Pricing Grid Alignment + Apply Now CTAs + Contact Forms

## What's Changing

### 1. Expand pricing grid from 4 to 6 tiers on `/modules`
The current grid shows Free, $27/mo, $497, $997. Missing: $297 F.O.C.U.S. Reset and $1,997 12-Week Mastery.

**New grid layout** (6 cards, 2 rows on desktop via `lg:grid-cols-3`):

| Card | Price | CTA | Type |
|---|---|---|---|
| Free | $0 | Try Free | Direct |
| Monthly Subscriber | $27/mo | Get Started | Stripe checkout |
| 30-Day F.O.C.U.S. Reset | $297 | Get Started | Stripe checkout |
| 30-Day Intensive | $497 (MOST POPULAR) | Apply Now | Opens modal |
| 8-Week Cohort | $997 | Get Started | Stripe checkout |
| 12-Week Mastery | $1,997 | Apply Now | Opens modal |

The $497 Intensive and $1,997 Mastery have "Application required" in their program data — these get an **Apply Now** CTA that opens a lightweight application dialog instead of direct checkout.

### 2. Apply Now modal component
Create `src/components/ApplyNowDialog.tsx` — a simple dialog with:
- Name, email, "Why are you interested?" textarea, selected program name (read-only)
- Submit sends data to a new `apply-now` edge function that forwards to Coach Kay's email via the existing `send-email` function pattern
- Success toast: "Application received — Coach Kay will be in touch."

### 3. Corporate & 1:1 inquiry CTA
Add a "Corporate & Private Coaching" card at the bottom of the pricing section with:
- "Contact Coach Kay" button → opens a similar inquiry dialog
- Fields: Name, email, organization (optional), "Tell us about your needs" textarea
- Submits to the same `apply-now` edge function with `type: "inquiry"`

### 4. Edge function: `apply-now`
Receives `{ type: "application" | "inquiry", name, email, programName?, message }`, validates input with Zod, sends a formatted email to `Hello@coachkayelevates.org` using the existing Resend/email pattern.

## Files Changed
- `src/pages/Modules.tsx` — expand pricing grid to 6 tiers + corporate row, wire Apply Now and Inquiry dialogs
- `src/components/ApplyNowDialog.tsx` — new reusable dialog for applications and inquiries
- `supabase/functions/apply-now/index.ts` — new edge function to forward application/inquiry emails

## Files NOT Changed
- No changes to Stripe config, programs data, routes, or existing features
- No pricing logic changes — just UI alignment with what already exists in Stripe

## After Implementation
You should test the full flow: onboarding → clarity session → result screen to verify the track resolver and phase detection work end-to-end.
