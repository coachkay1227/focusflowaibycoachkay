---
name: Lead-gen routing switch
description: Admin-set leadgen.offer_url reroutes all $297+ offer CTAs away from Stripe checkout to a lead-gen page
type: feature
---
Mid/high-ticket routing is controlled by the `leadgen.offer_url` row in `app_settings`, editable at `/admin/booking-links`.

- Blank = every offer keeps direct Stripe checkout (default).
- Set to an https URL = all $297+ CTAs redirect there instead of opening checkout.

Enforced centrally via `redirectToLeadGenIfConfigured()` in `src/lib/lead-gen.ts`, called at the top of four entry points: `start-program-checkout.ts` (transformation paths), `PricingSection`, `RentAnAgent`, `CollectiveAIBuildStudio`.

Deliberately NOT routed to lead-gen — these stay direct-buy: $47 AI Business Audit, Autism Social Stories store, book store.

Stripe webhook notes: `no_payment_required` counts as settled (100%-off promo codes must fulfil). Order-total checks compare against gross = amount_total + discount. Test promo code `FFTEST100` (100% off, 6 uses). The legacy trigger.dev webhook endpoint was disabled 2026-08-08 — it 401'd every Stripe delivery.
