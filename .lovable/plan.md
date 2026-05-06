# Book Store Feature Plan

Build a self-contained Book Store module that plugs into the existing FocusFlow AI app without touching any existing pages. It reuses the dark navy + gold design system, DM Sans / Cormorant Garamond typography, and the existing Lovable Cloud + Stripe pipeline.

## 1. Navigation (additive only)

Edit `src/components/DesktopNav.tsx`:
- Add `{ label: "Book Store", path: "/store", icon: BookMarked, authOnly: false }` to `navItems`.
- Add `/store`, `/order-success`, `/admin/orders` to `PRIVATE_ROUTES` so the top nav hides on those pages (keeps current convention — those pages render their own back link / brand).

Edit `src/components/admin/AdminNav.tsx`:
- Add an "Orders" link to `/admin/orders`.

No other existing pages are modified.

## 2. Routes (additive in `src/App.tsx`)

Add three lazy-loaded routes:
- `/store` → public `Store` page
- `/order-success` → public `OrderSuccess` page (reads `?session_id=...`)
- `/admin/orders` → `AdminOrders` wrapped in `ProtectedRoute requireAdmin`

## 3. Database (migration)

New `book_packages` table (catalog, admin-managed, publicly readable):
- `id uuid pk`, `slug text unique`, `category text` (`children` | `coloring` | `nonfiction`), `name text`, `tagline text`, `description text`, `features jsonb`, `price_cents int`, `currency text default 'usd'`, `stripe_price_id text`, `sort_order int`, `active bool default true`, `created_at`, `updated_at`.
- RLS: `SELECT` allowed to anon + authenticated where `active = true`; all writes blocked (admin manages via Stripe + seed migration / future admin UI).

New `book_orders` table:
- `id uuid pk`, `user_id uuid null` (guest checkout allowed), `package_id uuid references book_packages`, `stripe_session_id text unique`, `stripe_payment_intent text`, `amount_cents int`, `currency text`, `status text default 'pending'` (`pending` | `paid` | `failed` | `refunded`), `customer_email text`, `intake jsonb` (form responses), `notes text`, `created_at`, `updated_at`.
- RLS:
  - `SELECT`: user can read their own (`auth.uid() = user_id`); admins via `has_role(auth.uid(),'admin')`.
  - `INSERT` / `UPDATE` / `DELETE`: blocked for users — only edge functions using the service role write.

Seed three starter packages (one per tab) so the page renders before Stripe products are wired; `stripe_price_id` left null until the user creates them.

## 4. Edge functions

All deployed automatically; ESM imports per project rule.

**`create-book-checkout`** (`verify_jwt = false`, accepts both auth and guest):
- Input: `{ packageId: string, intake: {...}, email?: string }` validated with Zod.
- Looks up `book_packages` row by id (must be `active`, must have `stripe_price_id`).
- Optionally resolves `user_id` from JWT if present.
- Inserts `book_orders` row with `status='pending'` and the intake payload via service role.
- Creates Stripe Checkout session (`mode: 'payment'`) with that `stripe_price_id`, `success_url=${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`, `cancel_url=${origin}/store?checkout=cancelled`, metadata `{ order_id, package_id, supabase_user_id? }`.
- Updates the order row with `stripe_session_id`. Returns `{ url }`.

**`verify-book-order`** (`verify_jwt = false`):
- Input: `{ session_id }`. Retrieves Stripe session, if `payment_status === 'paid'` updates the matching order to `status='paid'` and stores `stripe_payment_intent` + `customer_email`. Returns sanitized order summary for the success page.

**Extend `stripe-webhook`** (already in repo): on `checkout.session.completed` for sessions whose metadata contains `order_id`, mark that order row `paid` (idempotent — verify-book-order may have already done it). No changes to existing tier/subscription handling.

## 5. Frontend pages & components (all new files)

```
src/pages/Store.tsx
src/pages/OrderSuccess.tsx
src/pages/admin/AdminOrders.tsx
src/components/store/PackageTabs.tsx
src/components/store/PackageCard.tsx
src/components/store/IntakeFormModal.tsx
src/lib/book-store.ts        // types, category labels, intake schemas
```

### `/store`
- Hero: Cormorant Garamond headline "Coach Kay Book Store", gold underline accent, navy bg, subtle FloatingOrbs (already in project).
- Tabs (shadcn or simple buttons) for the three categories. Active tab uses gold border + bg `primary/10`.
- Grid of `PackageCard`s fetched from `book_packages` filtered by category.
- Each card: name, tagline, price formatted from `price_cents`, feature list (checkmarks), gold "Order Now" CTA → opens `IntakeFormModal`.

### `IntakeFormModal`
Built with existing `Dialog` + `react-hook-form` + Zod. Fields per category:
- **Children's Books**: child's name, age, themes/values, dedication, cover preference, delivery email.
- **Coloring Books**: theme, target age range, page count preference, custom illustrations notes, delivery email.
- **Non-Fiction Authority**: author name, niche, working title, book goal, target audience, timeline, delivery email.
Common fields: full name, email (prefilled from auth if logged in), phone (optional), notes.
On submit → `supabase.functions.invoke('create-book-checkout', { body })` → `window.location.href = url`.

### `/order-success`
- Reads `session_id`, calls `verify-book-order`, shows confirmation card (package name, amount, "we'll email you within 1 business day"), gold "Back to Store" + "Go Home" buttons.

### `/admin/orders`
- Table of all orders (newest first) via `supabase.from('book_orders').select('*, book_packages(name,category)')`.
- Filters: status, category, search by email.
- Row click opens detail drawer showing intake JSON formatted, Stripe session id with link to Stripe dashboard, status badge, internal notes textarea (saves via service-role edge function `update-book-order-notes` — admin-only via `has_role` check inside the function).
- Uses `AdminNav` shell to match other admin pages.

## 6. Stripe products

After the migration runs, create one Stripe product + price per package using the available Stripe tooling, then update the `book_packages` rows with their `stripe_price_id` (insert tool, since this is data not schema). The plan covers wiring; the user will be asked to confirm the three prices (or supply their own) at implementation time.

## 7. Design tokens

Reuse existing tokens only — `bg-background`, `text-foreground`, `border-border`, `text-primary` (gold), `font-heading` (Cormorant), `font-sans` (DM Sans). No new colors. No external animation libs (per memory rule). Subtle CSS-only fade/slide on tab change.

## 8. Out of scope (explicit)

- No edits to Index, Kiosk, CoachKay, Modules, Dashboard, ClaritySession, etc.
- No changes to existing tiers, `user_access_levels`, or subscription logic.
- No physical-shipping flow — orders are digital/service deliverables tracked manually by admin.

## Technical notes

- Guest checkout supported because intake form already collects email; `book_orders.user_id` is nullable.
- `verify_jwt = false` on the two new functions requires explicit blocks in `supabase/config.toml`.
- Webhook already verifies signatures; we only branch on `metadata.order_id` to avoid colliding with existing tier logic.
- `PackageCard` price formatter: `new Intl.NumberFormat('en-US',{style:'currency',currency}).format(price_cents/100)`.
- All inputs validated client-side (Zod + react-hook-form) AND server-side (Zod in edge function) per project security rules.
