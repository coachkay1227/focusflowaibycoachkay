
create type public.access_tier as enum ('free', 'subscriber', 'cohort', 'premium', 'corporate');

create table public.user_access_levels (
  id uuid primary key references auth.users(id) on delete cascade,
  tier access_tier not null default 'free',
  created_at timestamptz default now()
);

alter table public.user_access_levels enable row level security;

create policy "Users can read own access level"
  on public.user_access_levels for select
  to authenticated
  using (auth.uid() = id);

create or replace function public.get_user_tier(_user_id uuid)
returns access_tier
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    (select tier from public.user_access_levels where id = _user_id),
    'free'::access_tier
  )
$$;

-- Auto-create a free-tier row for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '')
  );
  insert into public.user_access_levels (id, tier)
  values (new.id, 'free');
  return new;
end;
$$;
