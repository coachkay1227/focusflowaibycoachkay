
-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Clarity sessions table
create table public.clarity_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  module_id text not null,
  answers jsonb not null,
  insight_truth text,
  insight_pattern text,
  insight_action text,
  created_at timestamptz default now()
);
alter table public.clarity_sessions enable row level security;
create policy "Users can read own sessions" on public.clarity_sessions for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own sessions" on public.clarity_sessions for insert to authenticated with check (auth.uid() = user_id);

-- Challenge progress table
create table public.challenge_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  challenge_type text not null,
  entries jsonb default '{}'::jsonb,
  current_day integer default 1,
  started_at timestamptz default now(),
  unique (user_id, challenge_type)
);
alter table public.challenge_progress enable row level security;
create policy "Users can read own challenges" on public.challenge_progress for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own challenges" on public.challenge_progress for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own challenges" on public.challenge_progress for update to authenticated using (auth.uid() = user_id);
