

# Session 3: Branded Emails + Result Screen Conversion + Pricing Simplification

## Current State

- Email domain `coachkayelevates.org` exists in workspace but is **not configured for this project** and DNS is still pending verification
- Result screen has track-based recommendations but CTAs are generic ("What's your next move?", "Start a Challenge")
- Pricing grid shows 6 flat cards with no visual journey grouping
- All existing routes and features are intact

## Step 0: Email Domain Setup (Required First)

Before any email work can happen, you need to configure the email domain for this project. Click the button below to set it up — this connects `coachkayelevates.org` to FocusFlow AI so branded emails can be sent from your domain.

Once DNS verifies, emails will start delivering automatically. Everything else (templates, triggers, edge functions) will be built and deployed now so they're ready the moment DNS propagates.

## Workstream 1: Branded Email Infrastructure

### Setup sequence
1. Configure email domain for this project (user action via dialog)
2. Set up email infrastructure (queue, cron, suppression tables)
3. Scaffold transactional email edge functions
4. Scaffold auth email templates (branded signup confirmation, password reset)

### Templates to create (2 transactional — the follow-up sequence of 4 is marketing/drip and **cannot** be built as transactional emails)

**Important compliance note**: The 4 "clarity result follow-up" emails described in your request (followup-1 through followup-4) are a **drip/nurture sequence** — they go to users who completed a session but didn't take further action. These are marketing emails by definition (sender-initiated, promotional intent, re-engagement). Lovable's email system only supports transactional emails (triggered by a specific user action where the recipient expects the email). Building drip sequences requires a dedicated marketing email service. I'll note this as a deferred item.

**What we CAN build:**

| Template | Trigger | Subject |
|----------|---------|---------|
| `welcome-to-focusflow` | After signup in Auth.tsx | "Your Clarity Journey Starts Now" |
| `application-received` | After Apply Now submit | "We Got Your Application" |

Both templates will use the FocusFlow brand: navy/gold/cream palette, Cormorant Garamond headings, warm Coach Kay voice, single clear CTA per email.

### Wiring
- `src/pages/Auth.tsx` — invoke `send-transactional-email` after successful signup
- `src/components/ApplyNowDialog.tsx` — invoke after successful application submission (confirmation to applicant)

### Unsubscribe page
- New `src/pages/Unsubscribe.tsx` — branded page matching app design
- New route `/unsubscribe` in `src/App.tsx`

### Auth email branding
- Scaffold branded auth email templates (signup confirmation, password reset, etc.) matching FocusFlow visual identity

## Workstream 2: Result Screen Conversion Engine

### Changes to `src/pages/ResultScreen.tsx`
- Replace "What's your next move?" → **"Your path forward"**
- Replace "Start a Challenge" → show the **specific recommended challenge name** from track resolver
- Make "Continue with Coach Kay" the **single dominant primary CTA** — larger, visually prominent, pulsing gold
- Add "Talk to Coach Kay about this" secondary CTA that preloads insight context
- Show recommended program by **specific name** (look up from programs.ts using slug)
- Replace soft upsell "Ready for structured support?" with more direct copy: "This pattern won't change on its own — here's where to start."
- Add compliance line under phase card (already exists, will verify)

## Workstream 3: Pricing Ladder Simplification

### Changes to `src/pages/Modules.tsx`
- Group the 6 existing cards into **3 labeled sections** with headers:
  - **"Start Here"** — Free
  - **"Go Deeper"** — Monthly Subscriber ($27/mo) + F.O.C.U.S. Reset ($297)
  - **"Full Transformation"** — 30-Day Intensive ($497) + 8-Week Cohort ($997) + 12-Week Mastery ($1,997)
- **"Custom Solutions"** — Corporate & Private Coaching (already exists, just gets a section header)
- No Stripe IDs, prices, or tiers are changed — only visual grouping and section headings
- Subscription positioned as "ongoing access" within "Go Deeper", not the first thing users see

## Files Changed

| File | Change |
|------|--------|
| `src/pages/ResultScreen.tsx` | CTA hierarchy, specific names, copy improvements |
| `src/pages/Modules.tsx` | Pricing grouped into journey sections |
| `src/pages/Auth.tsx` | Welcome email trigger after signup |
| `src/components/ApplyNowDialog.tsx` | Application confirmation email trigger |
| `src/pages/Unsubscribe.tsx` | New branded unsubscribe page |
| `src/App.tsx` | Add `/unsubscribe` route |
| `supabase/functions/_shared/transactional-email-templates/welcome-to-focusflow.tsx` | New |
| `supabase/functions/_shared/transactional-email-templates/application-received.tsx` | New |
| `supabase/functions/_shared/transactional-email-templates/registry.ts` | New/updated by scaffold |
| Auth email templates in `_shared/email-templates/` | Branded by scaffold |

## Deferred (Not Implemented This Session)

- **Clarity result follow-up drip sequence (4 emails)** — These are marketing/re-engagement emails. Requires a dedicated marketing email service (e.g., Mailchimp, ConvertKit). Cannot be built with Lovable's transactional email system.
- **Payment plan implementation** — Future session
- **Email campaign automation** — Requires marketing email service

## First Action Required

Set up the email domain for this project before implementation begins:

