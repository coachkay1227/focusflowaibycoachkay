# Book Store — Detailed Build Plan (v3, premium, no emojis)

Builds the Book Store as a fully additive layer on top of FocusFlow AI. No existing page, component, route, auth flow, design token, or nav item is removed or restyled. **No emojis anywhere** — all category and add-on indicators use thin-line Lucide icons rendered in gold to match the existing premium aesthetic.

## 0. Audit notes (verified)

- Existing nav has Coach Kay → Community → About. Book Store is inserted directly before About per spec.
- No shared Footer component exists (homepage owns its own footer). Per "do not touch existing pages", Change 8 is dropped to honor the no-touch rule.
- Stripe secrets present. `stripe-webhook` exists and will be extended with an additive branch only.
- Project uses DM Sans body + Cormorant Garamond headings; we keep the system font stack (no Inter swap) to stay on-brand.

## 1. Premium visual language (locks "no emoji, no non-premium" rule)

- Category indicators use Lucide icons (gold, 1px stroke, 18px): `BookOpen` (Children), `Palette` (Coloring), `BookMarked` (Non-Fiction).
- Add-on indicators use Lucide icons: `Megaphone` (Launch Toolkit), `Magnet` (Lead Magnet), `PhoneCall` (Strategy Call).
- All section eyebrows in tracked uppercase gold DM Sans; all headlines in Cormorant Garamond.
- Cards: `bg-card` with `border border-border/60`, hover lifts 1px and gains `border-primary/40` (pure CSS).
- Price uses Cormorant 4xl in gold; turnaround shown as a hairline gold pill (`border border-primary/40 text-primary/90 px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider`).
- Bullet rows use a thin Lucide `Check` in gold with cream text — no checkmark emoji.
- Tabs: minimal text + 1px gold underline on active, no pill backgrounds.
- Subtle radial gradient + faint grid background reused from existing tokens.
- Pure CSS animations only (per memory rule).

## 2. Database (single migration)

`book_orders` columns exactly per spec:
`id uuid pk`, `created_at`, `client_name`, `client_email`, `client_phone null`, `referral_source`, `package_slug`, `package_name`, `package_price int`, `book_purpose`, `book_vision`, `characters null`, `illustration_style`, `special_requirements null`, `addons jsonb default '[]'`, `addons_total int default 0`, `order_total int`, `status text default 'pending_payment'` (check constraint on the 5 allowed values), `stripe_session_id text unique`, `stripe_payment_intent_id null`, `admin_notes null`, `user_id uuid null`.

RLS:
- SELECT: `auth.uid() = user_id` OR `has_role(auth.uid(),'admin')`.
- INSERT/UPDATE/DELETE: blocked for end users — only edge functions via service role write.

No `book_packages` table — catalog is static in `src/lib/book-store.ts` and mirrored server-side to prevent price tampering.

## 3. Static catalog — `src/lib/book-store.ts`

Typed exports for `PACKAGES` (9 entries — Children: Mini-Story Starter $499, Storybook Pro $1,250, Premium Legacy $2,500; Coloring: Quick Sketch Starter $297, Etsy Seller Pack $597, Ultimate Creator $1,250; Non-Fiction: Outline+Draft $750, Done-for-You Expert $2,500, Booked & Branded $4,500), `ADDONS` (3 entries: Book Launch Toolkit $397, Lead Magnet Spin-Off $297, VIP Strategy Call $197). Includes `findPackage`, `findAddon`, and Zod intake schema reused on client and server.

## 4. Routes — append to `src/App.tsx`

Lazy-loaded:
- `/store` → public `Store`
- `/order-success` → public `OrderSuccess`
- `/admin/orders` → `ProtectedRoute requireAdmin` → `AdminOrders`

## 5. Navigation — append only

`src/components/DesktopNav.tsx`:
- Add `{ label: 'Book Store', path: '/store', icon: BookMarked, authOnly: false }` immediately before About.
- Add `/store`, `/order-success`, `/admin/orders` to `PRIVATE_ROUTES` so the global top nav hides on those pages (each page renders its own minimal back-link header).

`src/components/admin/AdminNav.tsx`:
- Add an "Orders" link to `/admin/orders`.

## 6. Pages & components (all new files)

```
src/pages/Store.tsx
src/pages/OrderSuccess.tsx
src/pages/admin/AdminOrders.tsx
src/components/store/Hero.tsx
src/components/store/CategoryTabs.tsx
src/components/store/PackageCard.tsx
src/components/store/AddonCard.tsx
src/components/store/IntakeFormModal.tsx
src/components/store/OrderDetailDrawer.tsx
src/components/store/StatusBadge.tsx
src/lib/book-store.ts
```

### `/store`
- Hero: gold eyebrow `THE BOOK BUILDER BLUEPRINT`, Cormorant headline "Turn Your Story Into a Published Book", cream subhead per spec, gold CTA button scrolls to packages.
- Three minimalist category tabs (icon + label) with 1px gold underline on active.
- 3-column grid (1-col mobile) of `PackageCard`s — name, turnaround pill, gold price, bullet list with thin gold checks, gold "Order This Package" CTA opening `IntakeFormModal` with `defaultPackage=slug`.
- Add-ons row below: 3 smaller cards with Lucide icon + name + price + description.

### `IntakeFormModal`
- shadcn `Dialog`, dark navy panel, full-screen on mobile.
- `react-hook-form` + Zod from `src/lib/book-store.ts`.
- Four sections per spec (About You, Your Book, Add-Ons, Agreement). "Main character(s) or subject" only renders for Children's Book packages.
- Live order total (USD-formatted) updates as add-ons are toggled.
- Both required agreement checkboxes gate the gold "Proceed to Payment" button.
- Submit: `supabase.functions.invoke('create-book-checkout')` → `window.location.href = url`.

### `/order-success`
- Reads `?session_id=`, calls `verify-book-order`.
- Pure-CSS animated gold check (SVG stroke draw), Cormorant heading "Your Book Journey Begins", cream subtext per spec, summary card (package, total, email), 4 numbered next steps in cream, two gold buttons → "Return to Dashboard" and "Join Our Community".

### `/admin/orders`
- Inside existing AdminNav shell.
- Top stats row (5 cards): Total Orders, Total Revenue, Pending Payment, In Progress, Delivered.
- Filters: status, package category, date range, search by name/email.
- Table columns per spec, status as inline dropdown calling `update-book-order`.
- Status badges (no emoji): pending_payment → muted, paid → gold, in_progress → cool blue, delivered → emerald, cancelled → destructive — all using existing token classes.
- Row click opens right-side `Sheet` drawer with full intake fields, Stripe session link, editable `admin_notes`.
- CSV export built client-side from filtered rows.

## 7. Edge functions

### `create-book-checkout` (`verify_jwt = false` — guest checkout)
- Zod-validates body using shared schema.
- Mirrored server-side catalog determines authoritative prices.
- Inserts `book_orders` row via service role, attaches `user_id` from JWT if present.
- Creates Stripe Checkout (`mode=payment`) with `price_data` line items (bespoke service work), customer_email pre-filled, metadata `{ book_order_id, package_slug }`, success/cancel URLs per spec.
- Updates row with `stripe_session_id`. Returns `{ url }`.

### `verify-book-order` (`verify_jwt = false`)
- Body `{ session_id }`. Retrieves Stripe session; if paid, idempotently sets `status='paid'` and `stripe_payment_intent_id`. Returns sanitized summary.

### `update-book-order` (`verify_jwt = false`; auth + admin checked in code)
- Validates JWT via `getClaims`, then `has_role(uid,'admin')`. Body `{ id, status?, admin_notes? }`. Service-role update. Returns row.

### `stripe-webhook` (existing — additive branch)
- On `checkout.session.completed`, if `metadata.book_order_id` exists: idempotently mark order `paid`, set `stripe_payment_intent_id`. All existing tier/subscription handling untouched.

## 8. Security

- Zod validation client + server.
- Server prices win — client-submitted prices are never trusted.
- RLS blocks direct user writes.
- Admin actions gated by server-side `has_role`, never a client flag.
- No publishable Stripe key needed (server-side Checkout redirect only); will note this to user in summary.

## 9. Out of scope / honored constraints

- No edits to Index, Kiosk, CoachKay, Auth, Onboarding, Dashboard, ClaritySession, Modules, ProgramDetail, etc.
- No changes to existing tiers, `user_access_levels`, or subscription logic.
- No global Footer change (no shared Footer component exists).
- No emojis anywhere in UI, copy, or icons.

## 10. Implementation order

1. Migration (`book_orders` + RLS).
2. `src/lib/book-store.ts` catalog + Zod schema.
3. Edge functions (`create-book-checkout`, `verify-book-order`, `update-book-order`); extend `stripe-webhook`; add the two `verify_jwt = false` blocks to `supabase/config.toml`.
4. Store page + components + IntakeFormModal.
5. OrderSuccess page.
6. AdminOrders page + drawer + CSV export.
7. Append to DesktopNav, AdminNav, App routes.
8. Smoke check via curl_edge_functions.
