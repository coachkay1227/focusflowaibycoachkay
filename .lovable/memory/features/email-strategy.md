---
name: Hybrid Email Strategy
description: Lovable for transactional (welcome, application-received, auth); GHL webhooks for marketing/drip sequences
type: feature
---
## Email Architecture

**Lovable (transactional):**
- `welcome-to-focusflow` template — fires after signup in Auth.tsx
- `application-received` template — fires after Apply Now submit
- Auth emails (signup confirm, password reset) — pending domain setup
- Templates in `supabase/functions/_shared/transactional-email-templates/`

**GHL (marketing/drip via webhook):**
- Edge function: `supabase/functions/ghl-webhook/index.ts`
- GHL_API_KEY secret holds the webhook URL
- Three trigger points:
  1. Signup (Auth.tsx) → event: "signup"
  2. Clarity session complete (ResultScreen.tsx) → event: "clarity_session_complete" with phase/track/insight
  3. Application submit (ApplyNowDialog.tsx) → event: "application" or "inquiry"

**Domain:** `notify.coachkayelevates.org` — DNS pending, needs to be linked to project via email setup dialog.

**All triggers are fire-and-forget** — failures don't block user flow.
