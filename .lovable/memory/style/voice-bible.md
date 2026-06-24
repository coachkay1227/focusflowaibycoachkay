---
name: CKE Voice Bible
description: Canonical voice rules for every AI prompt and email template
type: design
---
Single source of truth: `src/lib/coach-voice.ts` (browser) + `supabase/functions/_shared/coach-voice.ts` (edge).

Every edge function AI prompt MUST be built via `composeSystemPrompt(role, extras?)`. Roles: live-chat, clarity-report, pattern-detect, mac-elaborate, weekly-insights, business-audit, starter-report, email-body.

Every user-facing email template MUST import from `_voice-helpers.tsx` and use `<Signoff />`, `<WarmOpen />`, `<ArrowCTA />`. Run user content through `scrubVoice()` before render.

Hard rules: no em-dashes, no banned openers ("Absolutely!", "Great question!", etc), no banned vocabulary (leverage/synergy/transformative/holistic/...), no income guarantees, no shame, no hustle culture. Forward Focus Elevation is NEVER a 501c3. Surname is Alaoui, never Dawkins. No mention of corporate finance employer.

CTAs use the arrow pattern: "→ Lock Your Spot". Never "Click here" or "Learn more".

Sign-off (long-form + emails): "Where Focus Goes, Energy Flows. 💛 Coach Kay"

Admin reference + linter: `/admin/voice-bible`.
