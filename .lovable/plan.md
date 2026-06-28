# Plan: Public Audit Funnel (Intake → Checkout → Auth → Report)

## Simplification review (before changes)

Your instructions are already the simplification — they flip the flow from "pay → auth → intake" to "intake (lead capture) → pay → auth → report." That removes:

- The `useAuditAccess` gate on the intake page (no audit row exists yet pre-payment, so the hook is dead weight here).
- The `ProtectedRoute` wrapper on `/audit/*` public-funnel routes.
- The "sign in to continue" branching on `AuditLanding`.
- The duplicate "magic link / check your email / sign in" copy on the landing page.

One thing I want to flag so we don't over-simplify: the intake data needs to survive the Stripe redirect. Cheapest reliable path = stash intake JSON in `sessionStorage` keyed by a generated `lead_id`, pass `lead_id` + email as Stripe `metadata`, and let the existing `stripe-webhook` create the `business_audits` row with that intake on `checkout.session.completed`. No new tables, no new edge functions, no schema changes.

If you'd rather POST the intake to a tiny `create-audit-lead` edge function before redirecting to Stripe (so the lead is captured even if they abandon checkout), say the word — it's ~1 extra small function. Default below is the zero-new-backend path.

## Changes

### 1. `src/App.tsx`
- Remove `ProtectedRoute` (and any `requireAdmin`/auth wrapper) from `/audit`, `/audit/landing`, `/audit/intake`. Keep `/audit/report/:id` as-is (token or auth still gates the actual report).

### 2. `src/pages/AuditIntake.tsx`
- Remove `useAuth`, `useAuditAccess`, `audit`, `canAccess`, `token`, `auditIdFromUrl`, the "Audit access required" block, and the resume-from-existing-audit `useEffect`.
- Add two required fields to step 1: **Full name** and **Email** (zod: trimmed, email, max 255). These become the lead capture.
- On submit (final step):
  1. Validate full form with zod.
  2. Generate `lead_id = crypto.randomUUID()`.
  3. `sessionStorage.setItem("audit:lead:" + lead_id, JSON.stringify(intake))`.
  4. Call existing `create-checkout` edge function with `{ product: "business_audit", email, lead_id, name }` so Stripe Checkout uses `customer_email` and stores `lead_id` + `name` in session `metadata`.
  5. Redirect to the returned Stripe URL.
- Remove the "Generate My Audit" direct-invoke of `generate-business-audit`; generation now happens post-payment.

### 3. `supabase/functions/create-checkout/index.ts`
- Accept the `business_audit` product path without requiring a Supabase JWT (make this branch public; keep auth required for tier/subscription branches).
- Pass `customer_email`, `metadata.lead_id`, `metadata.product = "business_audit"`, and `metadata.full_name` into the Stripe session. `success_url = ${origin}/audit/landing?session_id={CHECKOUT_SESSION_ID}&lead_id=<lead_id>`.

### 4. `supabase/functions/stripe-webhook/index.ts`
- In the `checkout.session.completed` handler, when `metadata.product === "business_audit"`:
  - Insert a `business_audits` row with `stripe_session_id`, `customer_email`, `full_name`, and a `pending_intake = true` flag (or leave `intake` null — the landing page will hydrate it).
  - Idempotency continues to use existing `processed_stripe_events`.
- No DB migration needed if `business_audits` already accepts these columns; otherwise add a small migration to allow `customer_email` + `full_name` nullable text. (I'll check before writing the migration; only add if missing.)

### 5. `src/pages/AuditLanding.tsx`
- Strip all auth-conditional UI. Single primary CTA: **"Create your account to view your report"** → navigates to `/auth?next=/audit/intake-complete&email=<email>&session_id=<sid>` (prefilled email, banner message).
- On mount, read `lead_id` + `session_id` from URL, pull intake JSON from `sessionStorage`, and POST it to a thin `attach-audit-intake` call (or directly `supabase.from('business_audits').update({ intake })` if RLS allows by `stripe_session_id` — I'll verify; if not, use a small edge function with service role).
- Show the sample-audit preview as it is today.

### 6. `src/pages/Auth.tsx`
- If `?email=` query param is present, prefill the email input and show the message: *"Your audit is being prepared — create your account to view your report."*
- After successful signup/sign-in, if `?next=` is present, navigate there; the existing report-claim logic (by `customer_email` match or token) links the audit to the new user.

### 7. `supabase/functions/generate-business-audit/index.ts`
- No interface change. Continue to accept `audit_id` + `intake`. It's now invoked from the **report page** (or auto on first authenticated visit to `/audit/report/:id` if intake is present and report is null), not from the intake form.

## Out of scope (intentionally not touching)
- Admin audit log viewer, methodology page, newsletter, booking links, role checks — no changes.
- `/audit/report/:id` continues to require either a magic-link token or the authenticated owner.

## Risk notes
- `sessionStorage` is lost if the user opens the Stripe success in a different browser/device. Acceptable trade-off vs. adding an edge function; if you want zero data loss, opt into the `create-audit-lead` pre-write variant.
- Removing auth on `create-checkout` for this one product branch must be scoped carefully — I'll keep JWT required for all other product types.

Approve and I'll implement exactly this.
