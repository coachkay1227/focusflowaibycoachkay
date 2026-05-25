## Goal
Work through the 7 security checklist items you pasted. The Lovable + Supabase scanners currently report **zero open findings**, and recent work already locked down edge functions, RLS, and PII. So this pass focuses on the gaps that remain: HTTP security headers, an input-validation audit, and documenting the few patterns that are intentionally as-is.

## What I'll do

### 1. Add HTTP security headers (main gap)
There is no `public/_headers` file today. I'll add one so the published site (Lovable hosting / Netlify-style) sends:
- `Content-Security-Policy` — allow self, Google Fonts, Supabase project origin (`*.supabase.co`), Stripe (`js.stripe.com`, `api.stripe.com`, `checkout.stripe.com`), and inline styles (required by Vite/Tailwind runtime). `frame-ancestors 'none'`.
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `X-XSS-Protection: 0` (modern best practice — rely on CSP)

I'll keep CSP report-only friendly by starting permissive enough for Stripe Checkout + Google Fonts + the Supabase functions origin, then note in chat what to tighten later.

### 2. Input-validation audit (no behavior change unless a gap is found)
Confirm Zod (or equivalent) is applied at every user-input boundary:
- `src/components/store/IntakeFormModal.tsx` — already uses Zod ✓
- `src/lib/book-store.ts` — already uses Zod ✓
- `src/pages/Auth.tsx`, `src/pages/ResetPassword.tsx`, `src/components/ApplyNowDialog.tsx`, `src/pages/ClaritySession.tsx`, `src/pages/StarterKit.tsx`, `src/pages/CoachChat.tsx`, admin modals — read each and add a Zod schema + `.trim()` + length cap **only where missing**. No UI redesign.
- Server-side: confirm each edge function that takes a body parses with Zod and returns 400 on failure. Patch any that don't.
Codebase grep already confirms **no `dangerouslySetInnerHTML`, `eval`, or `innerHTML` writes** anywhere — nothing to fix for XSS sinks.

### 3. Auth token storage — keep Supabase default, document why
The checklist asks for HttpOnly cookies for JWTs. The Supabase JS SDK stores the session in `localStorage` by design; switching to HttpOnly cookies requires running an SSR proxy (Next.js / custom Node server) which this Vite SPA does not have. The accepted mitigations stay in place:
- Short access-token TTL + refresh rotation (Supabase default)
- RLS on every table (already enforced)
- HSTS + strict CSP (added in step 1) to block token theft via injected scripts
I'll record this as an accepted risk in `@security-memory` rather than ripping out the SDK.

### 4. RLS / edge-function permission re-review
Walk every table's policies (already pasted in context) and every function in `supabase/functions/*` to confirm:
- No table is missing INSERT/UPDATE/DELETE coverage where it should be locked down.
- Each function either calls `getClaims()` or is intentionally public (webhooks with signature verification, analytics ping, `clarity-insight` guest flow).
Fix anything that drifted; otherwise document the intentional public surfaces in security memory.

### 5. Static vuln sweep
- `bun audit` / `npm audit` style scan via the dependency tool — report and patch high/critical.
- Grep for: `http://` external calls, open redirects (`window.location = userInput`), unsanitized `target="_blank"` without `rel="noopener noreferrer"`, exposed secrets in client code (env grep already shows only the public `VITE_SUPABASE_PUBLISHABLE_KEY` and URL — both safe to ship).

### 6. Update `@security-memory`
Record:
- Security headers baseline and which third-party origins are allow-listed and why
- Token-in-localStorage as an accepted SPA constraint with the mitigations listed
- Public-by-design surfaces (analytics insert, cohort registration insert, `clarity-insight` guest flow, Stripe webhook, GHL webhook)
So future scans don't re-flag them.

## What I won't change
- The Supabase auth SDK's storage mechanism (would require SSR).
- Form UX or copy — validation tightening only.
- Any business logic.

## Files I expect to touch
- `public/_headers` (new)
- A handful of form components and edge functions **only if** I find a missing Zod schema
- `mem://security/security-memory` (new/updated)

Approve and I'll implement.