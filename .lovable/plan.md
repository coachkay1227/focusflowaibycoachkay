## Phase 3.2.5B — Step 5: Autism & Social Stories Lane

Scope = Step 5 only (page + checkout). Steps 6–9 handled in a follow-up phase.

### Pricing (confirmed)
| Slug | Name | Price | Type |
|---|---|---|---|
| autism_single_digital | Single Digital Social Story | $47 | checkout |
| autism_therapy_toolkit | Therapy Toolkit (3 stories) | $127 | checkout |
| autism_premium_illustrated | Premium Illustrated Social Story | $297 | checkout (+ gift wrap) |
| autism_therapy_practice_bundle | Therapy Practice Bundle (5 stories) | $997 | checkout |
| autism_school_iep_bundle | School + IEP Bundle (10 stories) | from $1,997 | inquiry |
| autism_custom_practice_license | Custom Practice License | $3,997+ | inquiry |
| autism_gift_wrap_addon | Gift Wrap + Personalized Note | $25 | add-on |

### Already done in this session
- ✅ All 5 Stripe one-time USD products + prices created (4 packages + gift wrap).
- ✅ Database migration `autism_orders` table applied with RLS (owner SELECT, admin SELECT, service-role writes only).

### Files to create / modify
**Edge functions** (all ESM `esm.sh` imports per memory):
- NEW `supabase/functions/_shared/autism-catalog.ts` — server-side catalog (slug → priceId, priceCents, inquiry flag, gift-wrap eligible flag).
- NEW `supabase/functions/create-autism-checkout/index.ts` — clone of `create-book-checkout`. Validates package_slug against server catalog, computes total from server prices (never trusts client), inserts `autism_orders` pending_payment row, creates Stripe Checkout session using stored `price` IDs (+ gift wrap line item when `gift_wrap=true` and package is premium), persists `stripe_session_id` with rollback if linking fails. Metadata: `{ autism_order_id, package_slug, order_type: "autism" }`. JWT optional (guest checkout allowed). success_url → `/order-success?type=autism&session_id={CHECKOUT_SESSION_ID}`; cancel_url → `/autism-social-stories#packages`.
- NEW `supabase/functions/verify-autism-order/index.ts` — clone of `verify-book-order` against `autism_orders`. Same paid/complete/metadata/amount cross-checks.
- MODIFY `supabase/functions/stripe-webhook/index.ts` — add an `autism_order_id` branch (mirrors book_order_id branch): amount cross-check → mark `autism_orders.status='paid'`, store `stripe_payment_intent_id`. Idempotent via existing `processed_stripe_events`. Does NOT touch `user_access_levels` (autism purchases never grant access tiers — respects the "never auto-modify tier" memory rule).
- MODIFY `supabase/config.toml` — add `verify_jwt = false` entries for `create-autism-checkout` and `verify-autism-order`.

**Frontend**:
- NEW `src/data/autismCatalog.ts` — client mirror with display strings, bullets (LMN/HSA/IEP on every package), best-for line, anchor ID.
- NEW `src/pages/AutismSocialStories.tsx` — full page per Step 5 brief:
  - Hero (Cormorant heading, Coach Kay voice paragraph, gold accents).
  - This-Is-For-You — 3 audience cards (Parents / Therapists / Schools & Clinics) anchored to corresponding package cards.
  - Packages grid — 4 checkout cards + 2 inquiry cards with deep anchors `#single #toolkit #premium #practice #school #license`. Checkout cards show price (large, gold), "Best for" line, bullet list (always includes LMN + HSA + IEP). Premium card includes "Add gift wrap + personalized note (+$25)" checkbox. Buy Now → opens `AutismIntakeModal`. Inquiry cards → open existing `OfferInquiryDialog` with `lane={packageName}`.
  - Reimbursement & Eligibility — verbatim copy block from brief.
  - Footer CTA.
  - SEOHead: title <60ch, description <160ch, canonical `/autism-social-stories`, single H1.
  - Pure CSS animations + IntersectionObserver only (per memory).
- NEW `src/components/autism/AutismIntakeModal.tsx` — adapted intake modal. Collects: buyer name/email/phone, use case (parent/therapist/school), child first name + age + interests, scenario focus (textarea), provider name + provider email (for LMN routing), special requirements, gift wrap toggle (when premium selected), gift recipient + gift note (when gift wrap on). On submit → invokes `create-autism-checkout` → `window.location.href = url` (same tab, per the existing PricingSection convention and the audit recommendation).
- MODIFY `src/App.tsx` — add lazy route `/autism-social-stories`.
- MODIFY `src/pages/OrderSuccess.tsx` — when `?type=autism`, call `verify-autism-order` instead of `verify-book-order`, and render an autism-specific header ("Your Story Is On Its Way") + line confirming LMN template + HSA itemized receipt will arrive by email.

### Security & rules respected
- All edge functions input-validated with Zod, server-side price authority, guest-checkout supported, JWT optional (matches `create-book-checkout`).
- Webhook tier-protection rules untouched — autism branch never writes to `user_access_levels`.
- AI race-condition rule N/A (no AI in flow).
- No external animation libraries.

### Deferred to follow-up phases
- Step 6: Coach Kay AI router catalog alignment.
- Step 7: nav entries.
- Step 8: sitemap entry.
- Step 9: LMN/HSA email templates + automated provider routing.
