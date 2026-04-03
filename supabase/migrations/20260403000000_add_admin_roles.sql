-- Admin roles system
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Only service role can manage user_roles directly
create policy "Service role only - no direct user access"
  on public.user_roles for all using (false);

-- has_role function (security definer to allow RLS policies to use it)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Admin can read all user_roles
create policy "Admins can read user_roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
