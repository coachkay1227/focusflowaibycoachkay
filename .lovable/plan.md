## Email Sender Update — Wire Verified Resend Domain

Update the 3 hardcoded `onboarding@resend.dev` / placeholder `from:` addresses across 2 edge functions to use the verified `coachkayai.life` domain, with `reply_to:` pointing to your Google Workspace inbox.

### Final config
- **from:** `Coach Kay <noreply@coachkayai.life>`
- **reply_to:** `hello@coachkayelevates.org`

No new subdomain or mailbox needed — `noreply@coachkayai.life` works because the root `coachkayai.life` is already verified in Resend.

### Files to update

**1. `supabase/functions/apply-now/index.ts`**
- Line ~101 (applicant confirmation email): swap `from:` → `Coach Kay <noreply@coachkayai.life>`, add `reply_to: "hello@coachkayelevates.org"`
- Line ~122 (admin notification email): same swap + reply_to

**2. `supabase/functions/send-email/index.ts`**
- Line ~188/199: swap fallback `from:` from `coach@focusflowelevation-hub.com` → `noreply@coachkayai.life`, add `reply_to` if not already supplied by caller

### Out of scope (leaving untouched)
- `auth-email-hook/index.ts` and `send-transactional-email/index.ts` — Lovable-managed, already use env-driven `FROM_DOMAIN` from your verified Lovable Emails setup
- No DNS changes, no new secrets, no website impact

### Verification after deploy
1. Redeploy `apply-now` and `send-email`
2. Trigger a test submission via the Apply form
3. Confirm email lands in inbox with:
   - From: `Coach Kay <noreply@coachkayai.life>`
   - Reply-To: `hello@coachkayelevates.org`
   - Hitting "Reply" in Gmail/Outlook routes to your Workspace inbox
4. Check `supabase--edge_function_logs` for any Resend API errors

### Rollback
Single revert if Resend rejects the domain (won't happen since you confirmed all 3 are verified) — change is isolated to 3 lines across 2 files.

Switch to **Build mode** to execute.