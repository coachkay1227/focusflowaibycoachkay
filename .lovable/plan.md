# Booking URLs, View Plans, admin, and link cleanup

Simplified shape: direct find-and-replace for URLs (no constants file), one shared anchor fix that handles both orphan anchors, one admin row insert. Audit results below.

## 1. Two Calendly URLs, wired by intent

| Audience | URL | Files |
|---|---|---|
| Free / cold leads → **15-min Clarity Call** | `https://call.coachkayelevates.org/widget/bookings/15-minutes-free-call` | `src/components/PricingSection.tsx:12`, `src/pages/ResultScreen.tsx:578` |
| Paid clients (post-purchase) → **60-min Strategy Call** | `https://call.coachkayelevates.org/widget/bookings/60min-discover-call` | `src/components/dashboard/YourProgramPanel.tsx:6`, `supabase/functions/stripe-webhook/index.ts:704`, `supabase/functions/_shared/transactional-email-templates/transformation-welcome.tsx:15`, `supabase/functions/_shared/transactional-email-templates/advisory-purchase-confirmation.tsx:10` |

Direct string replace in each file. No constants file, no client/Deno split — these URLs change rarely and inlining keeps it obvious which audience each surface targets.

Skip: `src/data/ai-tools-directory.ts:375` (bare `https://calendly.com` is just a generic directory entry for Calendly the product, not a CTA for your business).

## 2. Fix both orphan `#` anchors with one Modules-page change

Audit found **two** orphan anchors, not one:
- `AccessGate.tsx:55` → `/modules#plans` (no `id="plans"` exists)
- `PricingSection.tsx:161,201` → `/#pricing` (no `id="pricing"` exists on `Index.tsx`)

Single fix that handles both: add `<section id="plans" className="scroll-mt-24">` to the bottom of `src/pages/Modules.tsx` rendering the existing `<PricingSection />`, plus a `useEffect` watching `location.hash` to smooth-scroll on mount or when the hash changes. Then update `PricingSection.tsx` to point its two CTAs at `/modules#plans` instead of `/#pricing` — one canonical pricing destination, both broken anchors fixed.

`AccessGate`'s button stays a plain `navigate("/modules#plans")` — no pathname branching needed; the `useEffect` handles same-page hash changes too.

## 3. Grant admin to second email

One idempotent insert via the data tool:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE lower(email) = 'kizzy.alaoui@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

`hello@coachkayelevates.org` stays the primary admin (already has the row). `AccessGate` already gives admins full bypass to every tier — no other wiring needed.

If `kizzy.alaoui@gmail.com` hasn't signed up yet, the insert no-ops safely; sign in once, re-run.

## 4. Other audit fixes

- **`src/lib/email-templates.ts:378,388,401,425`** — replace the four `https://app.focusflow.ai/...` placeholder URLs with the real production base `https://coachkayai.life/...` (matching paths preserved).
- **`src/data/tool-picks.ts:76`** and **`src/data/ai-tools-directory.ts:367`** — bare `https://www.skool.com` → `https://www.skool.com/focusflow-elevation-hub` so the Skool entries actually land on your community.

## 5. Confirmed clean — no action

- All 20 top-nav dropdown items resolve to real routes (Start Here / Work With Me / Tools & Resources / Truth & About — all green).
- Zero dead internal `Link to=` or `navigate()` targets across the app.
- All other `#` anchors (`#how-it-works`, `#packages`, `#reimbursement`) have matching `id`s.
- Profile/AgentIntake `https://example.com` and `https://yoursite.com` strings are input placeholder text only, not links — leave alone.

## Technical details

- 6 files get URL string replacements (2 client + 4 server/email).
- `src/pages/Modules.tsx`: import `PricingSection`, append `<section id="plans" className="scroll-mt-24 mt-16"><PricingSection /></section>`, add `useEffect(() => { if (location.hash === "#plans") document.getElementById("plans")?.scrollIntoView({behavior:"smooth"}); }, [location.hash])`.
- `src/components/PricingSection.tsx`: both `/#pricing` strings → `/modules#plans`.
- `src/lib/email-templates.ts`: 4 URL replacements.
- `src/data/tool-picks.ts` + `src/data/ai-tools-directory.ts`: 2 Skool URL replacements.
- Data-only admin insert via the insert tool. No schema migration.

## Not included

- No new `booking-links` constants file.
- No changes to `user_roles` schema, `has_role` RPC, or `AccessGate` admin bypass logic.
- No edits to email-template copy beyond the URL swap.
- No changes to the Calendly appointments themselves (managed in your Calendly account).
