create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  event text not null,
  path text,
  properties jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_event_created_idx
  on public.analytics_events (event, created_at desc);
create index if not exists analytics_events_path_created_idx
  on public.analytics_events (path, created_at desc);
create index if not exists analytics_events_user_idx
  on public.analytics_events (user_id);

alter table public.analytics_events enable row level security;

-- Anyone (anon or authed) may insert events
create policy "anyone can insert analytics events"
on public.analytics_events
for insert
to anon, authenticated
with check (true);

-- Only admins can read events
create policy "admins can read analytics events"
on public.analytics_events
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));