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

## GHL event payloads (for sequence/automation matching)

All events arrive at the GHL webhook URL with this envelope:
`{ event, source: "focusflow-ai", timestamp, ...payload }`

| event | payload fields |
|---|---|
| `signup` | email, name (optional), user_id |
| `clarity_session_complete` | email, user_id, module_id, phase, track, insight |
| `application` / `inquiry` | email, name, phone, offer/program, message, source |
| `newsletter_signup` | email, name (optional), newsletter_source (footer/popup/inline), synced_to_beehiiv |

## Beehiiv integration (optional)

Edge function `newsletter-subscribe` writes every signup to `newsletter_subscribers` and, if `BEEHIIV_API_KEY` + `BEEHIIV_PUBLICATION_ID` are set, forwards to Beehiiv via `POST /v2/publications/{id}/subscriptions` and flips `synced_to_beehiiv = true`. When keys are absent it silently stores locally; admin CSV export at `/admin/newsletter` covers manual sync.
