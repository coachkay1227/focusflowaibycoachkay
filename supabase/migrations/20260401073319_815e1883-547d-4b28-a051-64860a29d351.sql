-- Explicitly deny all write operations on user_access_levels
-- Only service_role (server-side) can modify tiers

create policy "No direct inserts by users"
  on public.user_access_levels for insert
  to authenticated
  with check (false);

create policy "No direct updates by users"
  on public.user_access_levels for update
  to authenticated
  using (false)
  with check (false);

create policy "No direct deletes by users"
  on public.user_access_levels for delete
  to authenticated
  using (false);