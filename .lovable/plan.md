# Admin Booking-Links Settings Page

Edit the free and paid Calendly-style booking URLs from a UI without touching code or redeploying.

## 1. New `app_settings` key/value table

`content_settings` is shaped for per-program toggles (not a generic kv store), so add a small dedicated table.

```sql
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Public read so any page (signed-in or not) can resolve the booking URLs
CREATE POLICY "Anyone can read app_settings"
  ON public.app_settings FOR SELECT USING (true);

-- Only admins can write (via has_role)
CREATE POLICY "Admins can upsert app_settings"
  ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
```

Seed two rows:
- `booking.free_clarity_url` → `https://call.coachkayelevates.org/widget/bookings/15-minutes-free-call`
- `booking.paid_strategy_url` → `https://call.coachkayelevates.org/widget/bookings/60min-discover-call`

## 2. Admin page `/admin/booking-links`

New file `src/pages/admin/AdminBookingLinks.tsx` behind `<ProtectedRoute requireAdmin>`:
- Two labeled URL inputs ("Free 15-min Clarity Call", "Paid 60-min Strategy Call"), Save button, last-updated stamp
- Loads from `app_settings` on mount, upserts on save, toast on success/error
- URL validation (must start with `https://`)
- Add to `AdminNav.tsx` as a new tab ("Booking Links")

## 3. Client-side hook with safe fallback

New `src/hooks/use-booking-links.ts`:
- Single fetch from `app_settings` cached in React state (module-level cache so it loads once per session)
- Returns `{ freeClarityUrl, paidStrategyUrl, loading }`
- **Fallback constants** = the current hardcoded URLs, used if the query fails or returns nothing — links never break

Wire it into:
- `src/components/PricingSection.tsx` (replaces `PARTNERSHIP_BOOKING_URL` const)
- `src/pages/ResultScreen.tsx` (replaces inline free-call URL)
- `src/components/dashboard/YourProgramPanel.tsx` (replaces inline paid-call URL)

## 4. Server-side resolver for edge functions / emails

New `supabase/functions/_shared/booking-links.ts`:
- `getBookingLinks(supabaseAdmin)` → reads both rows with service role, returns `{ freeClarityUrl, paidStrategyUrl }` with the same hardcoded fallbacks on any error
- Called from:
  - `supabase/functions/stripe-webhook/index.ts` (paid URL in post-purchase email)
  - `supabase/functions/_shared/transactional-email-templates/transformation-welcome.tsx` — switch from hardcoded constant to a prop; passed in by send-transactional-email
  - `supabase/functions/_shared/transactional-email-templates/advisory-purchase-confirmation.tsx` — same prop pattern
- `send-transactional-email/index.ts` resolves links once and merges them into `templateData` for these two templates so triggers don't have to know about it

## 5. Out of scope

- No changes to the underlying booking provider (still your external GHL/Calendly-style page — no API, no embed, no sync)
- No URL history/audit log (just `updated_at` + `updated_by`)
- No per-environment overrides; one value per key, applies everywhere

## Files changed
- New migration: `app_settings` table + seed
- New: `src/pages/admin/AdminBookingLinks.tsx`, `src/hooks/use-booking-links.ts`, `supabase/functions/_shared/booking-links.ts`
- Edit: `src/App.tsx` (route), `src/components/admin/AdminNav.tsx`, `PricingSection.tsx`, `ResultScreen.tsx`, `YourProgramPanel.tsx`, `stripe-webhook/index.ts`, `send-transactional-email/index.ts`, `transformation-welcome.tsx`, `advisory-purchase-confirmation.tsx`
- Redeploy: `stripe-webhook`, `send-transactional-email`
