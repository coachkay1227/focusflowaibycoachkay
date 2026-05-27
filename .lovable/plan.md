## Goal

Adopt the new autism purchase confirmation email design, fix the schema mismatch with the Stripe webhook, and wire a real `downloadUrl` path so the same template covers both async (default) and ready-now (future) delivery.

## Brand recommendation (since you're unsure)

Use a **hybrid header**: keep `FocusFlow AI` as the parent brand wordmark at the top, then `Lulu's Adventures · Personalized Social Stories` as the product-line sub-header. This way:
- Customers still recognize the parent brand on receipts/HSA docs (matters for reimbursement paperwork)
- "Lulu's Adventures" gets room to grow as the autism product line
- We don't have to rebrand the landing page, store, etc. in this pass

If you'd rather go pure "Lulu's Adventures" (no FocusFlow mention), say so and I'll strip it.

## Changes

### 1. Rewrite `autism-purchase-confirmation.tsx`

Replace the current file. Key adjustments to the snippet you pasted:
- Convert to project convention: `npm:react@18.3.1` + `npm:@react-email/components@0.0.22` imports, named `template` export `satisfies TemplateEntry`, `<Preview>` component, `previewData` block.
- Apply hybrid header above.
- Map props to what the webhook actually sends + new fields:
  - `name` (existing) → greeting
  - `packageName` → `bundleName`
  - `orderTotal` (currency string) → `bundlePrice`
  - `orderId` → `orderNumber`
  - `childFirstName`, `scenarioFocus`, `isGift`, `giftRecipient` → kept (used in copy)
  - **New:** `deliveryMethod`, `storyCount`, `includesHsaReceipt`, `downloadUrl` (all optional with sensible defaults)
- HSA/FSA + LoMN + IEP bullets stay (you confirmed these are planned deliverables — I'll add a note in the security/follow-ups list to actually generate them before launch).
- Keep dark navy palette as-is — this project bypasses the Lovable email gateway and sends directly via Resend, so the white-body convention doesn't apply, and the navy matches your existing brand memory.
- Reply-to and footer continue to use `Hello@coachkayelevates.org` via the Resend sender (no template change needed there).

### 2. Update `stripe-webhook/index.ts` autism branch

In the `templateData` block (lines ~276-285), add:
- `deliveryMethod: pending.package_slug?.includes('illustrated') ? 'custom-illustrated PDF' : 'print-ready PDF'` (or pull from package metadata if you'd rather — tell me)
- `storyCount: 1` for now (extend later if bundles ship)
- `includesHsaReceipt: true`
- `downloadUrl`: read from a new nullable column `autism_orders.download_url`; pass through if set, otherwise omit so the template's fallback copy fires

### 3. Add `download_url` column + admin delivery flow

Migration:
```sql
ALTER TABLE public.autism_orders
  ADD COLUMN download_url text,
  ADD COLUMN delivered_at timestamptz;
```
(RLS already covers it via existing service-role and owner policies — no new GRANTs needed.)

Then in `src/pages/admin/AdminOrders.tsx`, add a "Deliver Story" action for autism orders that:
1. Prompts admin for the download URL (file is hosted wherever Coach Kay drops the PDF — Drive, Dropbox, or we can add a storage bucket later)
2. PATCHes `autism_orders` with `download_url`, `delivered_at = now()`, `status = 'delivered'`
3. Re-invokes `send-transactional-email` with `templateName: 'autism-purchase-confirmation'` and `idempotencyKey: 'autism-delivery-${id}'` so the customer gets a second email — same template, but the `downloadUrl` branch fires this time.

This means **the same template serves both the "order received" and "story ready" emails**, differentiated by whether `downloadUrl` is present. Simpler than two templates.

### 4. Update plan.md follow-ups

Add to the launch checklist:
- Build HSA itemized receipt generator
- Build Letter of Medical Necessity PDF template
- Decide PDF hosting (Supabase storage bucket vs external link)

## Files touched

- `supabase/functions/_shared/transactional-email-templates/autism-purchase-confirmation.tsx` (rewrite)
- `supabase/functions/stripe-webhook/index.ts` (extend templateData)
- New migration: add `download_url` + `delivered_at` to `autism_orders`
- `src/pages/admin/AdminOrders.tsx` (deliver action)
- `.lovable/plan.md` (follow-ups)

## Out of scope (call out if you want them in)

- Actually generating the HSA receipt PDF / LoMN template
- Setting up a storage bucket for hosted PDFs (using external URL paste-in for now)
- Rebranding non-email autism surfaces (landing, store cards)
- Second email template for "story ready" (reusing this one instead)
