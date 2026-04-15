

# Hybrid Email Strategy: Lovable (Transactional) + GHL (Marketing/Drip)

## How It Works

Lovable handles emails that users expect immediately — password resets, signup confirmations, and application acknowledgments. GHL handles everything marketing — your 4-part clarity follow-up drip, re-engagement, promotions, and nurture sequences.

```text
User Action                     → Lovable (transactional)
─────────────────────────────────────────────────────────
Signs up                        → Branded confirmation email
Resets password                  → Branded reset link
Submits Apply Now                → "We got your application" confirmation

User Action                     → GHL (marketing/drip via webhook)
─────────────────────────────────────────────────────────
Signs up                        → Welcome nurture sequence
Completes clarity session        → 4-part follow-up drip
Submits application              → Lead tagged for Coach Kay follow-up
```

## Step 1: Configure Email Domain for This Project

The domain `notify.coachkayelevates.org` exists in your workspace but isn't linked to this project yet. You need to complete the setup dialog so Lovable can send branded auth and transactional emails from that subdomain. DNS verification is still pending — you'll need to add NS records at your domain registrar (wherever you manage coachkayelevates.org).

## Step 2: Lovable Transactional Email Setup

Once domain is configured:
- Set up email infrastructure (queue, retry, suppression)
- Scaffold branded auth email templates (signup confirmation, password reset) matching FocusFlow gold/navy/cream identity
- Create two transactional templates:
  - **welcome-to-focusflow** — sent after signup, "Your Clarity Journey Starts Now"
  - **application-received** — sent after Apply Now submit, confirms receipt
- Wire triggers in `Auth.tsx` (after signup) and `ApplyNowDialog.tsx` (after submit)
- Create branded `/unsubscribe` page (already partially built)
- Deploy all edge functions

### Files Changed
| File | Change |
|------|--------|
| `supabase/functions/_shared/transactional-email-templates/welcome-to-focusflow.tsx` | New template |
| `supabase/functions/_shared/transactional-email-templates/application-received.tsx` | New template |
| `supabase/functions/_shared/transactional-email-templates/registry.ts` | Register templates |
| `supabase/functions/_shared/email-templates/*.tsx` | Branded auth templates (scaffold) |
| `src/pages/Auth.tsx` | Welcome email trigger after signup |
| `src/components/ApplyNowDialog.tsx` | Application confirmation trigger |
| `src/pages/Unsubscribe.tsx` | Already created — verify it works with new infrastructure |

## Step 3: GHL Webhook Integration

Create a lightweight edge function `ghl-webhook` that posts lead data to your GHL webhook URLs. Three triggers:

1. **Signup** — push name + email + event type to GHL (fires alongside the Lovable welcome email)
2. **Clarity session complete** — push email + phase/track + insight summary to GHL for the 4-part drip
3. **Application submit** — push applicant data + program name to GHL for Coach Kay's pipeline

You'll provide the GHL webhook URL(s) when ready. The `GHL_API_KEY` secret is already configured.

### Files Changed
| File | Change |
|------|--------|
| `supabase/functions/ghl-webhook/index.ts` | New — generic webhook forwarder |
| `src/pages/Auth.tsx` | Also fire GHL webhook on signup |
| `src/components/ApplyNowDialog.tsx` | Also fire GHL webhook on application |
| `src/pages/ResultScreen.tsx` | Fire GHL webhook after clarity result |

## Step 4: Deploy Everything

Deploy all new and updated edge functions.

## What This Does NOT Do
- Does not build drip sequences in Lovable — that's GHL's job
- Does not remove any existing features
- Does not change Stripe config

## First Action Required

Click the button below to link the email domain to this project. Once that's done, I'll implement everything in one pass.

