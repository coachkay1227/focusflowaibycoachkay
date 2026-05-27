ALTER TABLE public.autism_orders
  ADD COLUMN IF NOT EXISTS download_url text,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;