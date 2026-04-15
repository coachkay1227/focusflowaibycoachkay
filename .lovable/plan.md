

# Root Cause Analysis & Fix Plan

## Issue 1: Assessments Not Visible in Paid Flows

**Root cause (100% confirmed):** In `ProgramDetail.tsx` line 43, the "Start Session" button only appears when `canStart` is true, which requires `program.type === "assessment"`. However, the CTA rendering logic on line 184-239 checks `!hasAccess` **first**. For paid programs where the user doesn't have the required tier, the entire CTA block shows only the "Subscribe" or "Sign In" button — it never reaches the `canStart` branch that shows "Start Session".

This means: for any paid assessment, the user sees pricing and details but **no assessment-specific UI** (no "Start Session" button). Even if they had access, gated assessments would hit the `isGated` check first and show "Application Required" or "Cohort Code Required" instead.

Additionally, all current assessments in `programs.ts` are `accessTier: "free"` — there are no paid assessments yet. So if you're looking at paid programs like "Power Hour Challenge" (type: `challenge`, not `assessment`), there is no assessment to show because it's a challenge, not an assessment. The "Start Session" button only appears for assessment-type programs.

**Fix:** The CTA logic needs to show a "Start Session" or "Try Assessment" option for assessment-type programs even within paid flows, or clarify that challenges don't have assessments. The cleanest fix is:
- For paid **assessment** programs where the user lacks access: show a locked preview of the assessment with an upgrade CTA
- For paid **non-assessment** programs (challenges, courses, etc.): the current behavior is correct — there's no assessment to show

If you want every paid program to have an embedded assessment preview or link to the free Clarity Check, that's a feature addition.

## Issue 2: GHL Webhook Failing

**Root cause (100% confirmed from logs):** The `GHL_API_KEY` secret currently contains the GHL SI/API token you provided earlier (not a URL). The `ghl-webhook` function validates that `GHL_API_KEY` is a valid URL (line 33: `new URL(ghlApiKey)`), and since an API token isn't a URL, it fails with `invalid_webhook_url`.

The webhook URL you provided (`https://services.leadconnectorhq.com/hooks/WQpTteopklZd5iY7mogH/webhook-trigger/baf9c90d-3170-4452-b019-5a066003980d`) needs to be stored as `GHL_API_KEY`, replacing the current token value.

**Fix:** Update the `GHL_API_KEY` secret to contain the webhook URL instead of the API token. If you also need the SI token for other GHL API calls, we'd add a separate `GHL_SI_TOKEN` secret.

## Implementation Steps

### Step 1: Fix GHL Webhook
- Update `GHL_API_KEY` secret with the webhook URL: `https://services.leadconnectorhq.com/hooks/WQpTteopklZd5iY7mogH/webhook-trigger/baf9c90d-3170-4452-b019-5a066003980d`
- Re-test the webhook to confirm delivery

### Step 2: Clarify Assessment Logic in ProgramDetail
- Add a section in the paid program detail page that links to the free Clarity Check assessment as a "preview" or "try before you buy" experience
- For programs with `type === "assessment"` that are behind a paywall, show a locked assessment preview with upgrade CTA
- For non-assessment programs (challenges, courses, sprints), no change needed — they correctly don't show assessment UI

### Step 3: End-to-End Verification
- Test webhook delivery to GHL
- Verify each paid program detail page renders correctly
- Confirm free assessments still show "Start Session"

