-- Build Studio paid orders table
-- Captures every completed Stripe checkout for Build Studio quick-wins and care plans.
-- admin page: /admin/build-orders

create table if not exists public.build_studio_orders (
  id                uuid        primary key default gen_random_uuid(),
  stripe_session_id text        unique not null,
  user_id           uuid        references auth.users(id) on delete set null,
  guest_email       text,
  guest_name        text,
  product_id        text        not null,
  product_name      text        not null,
  price_cents       int         not null default 0,
  order_type        text        not null default 'one_time' check (order_type in ('one_time', 'subscription')),
  status            text        not null default 'confirmed' check (status in ('confirmed', 'in_progress', 'delivered', 'cancelled')),
  intake            jsonb,
  created_at        timestamptz not null default now()
);

alter table public.build_studio_orders enable row level security;

-- Admins can read/update all rows (service-role key used from edge functions)
create policy "service_role_all" on public.build_studio_orders
  for all to service_role using (true) with check (true);

-- Authenticated buyers can read their own rows
create policy "owner_read" on public.build_studio_orders
  for select to authenticated using (user_id = auth.uid());

create index if not exists build_studio_orders_user_id_idx on public.build_studio_orders (user_id);
create index if not exists build_studio_orders_created_at_idx on public.build_studio_orders (created_at desc);
