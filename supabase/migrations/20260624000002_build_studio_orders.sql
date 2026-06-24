-- One-time (non-subscription-tier) paid orders table
-- Captures Build Studio quick-wins/care plans AND advisory/intensive purchases.
-- admin page: /admin/build-orders

create table if not exists public.one_time_orders (
  id                uuid        primary key default gen_random_uuid(),
  stripe_session_id text        unique not null,
  user_id           uuid        references auth.users(id) on delete set null,
  guest_email       text,
  guest_name        text,
  product_id        text        not null,
  product_name      text        not null,
  price_cents       int         not null default 0,
  product_type      text        not null default 'build_studio' check (product_type in ('build_studio', 'advisory')),
  order_type        text        not null default 'one_time' check (order_type in ('one_time', 'subscription')),
  status            text        not null default 'confirmed' check (status in ('confirmed', 'in_progress', 'delivered', 'cancelled')),
  intake            jsonb,
  created_at        timestamptz not null default now()
);

alter table public.one_time_orders enable row level security;

-- Admins can read/update all rows (service-role key used from edge functions)
create policy "service_role_all" on public.one_time_orders
  for all to service_role using (true) with check (true);

-- Authenticated buyers can read their own rows
create policy "owner_read" on public.one_time_orders
  for select to authenticated using (user_id = auth.uid());

create index if not exists one_time_orders_user_id_idx on public.one_time_orders (user_id);
create index if not exists one_time_orders_created_at_idx on public.one_time_orders (created_at desc);
create index if not exists one_time_orders_product_type_idx on public.one_time_orders (product_type);
