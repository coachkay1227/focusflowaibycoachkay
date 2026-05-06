CREATE UNIQUE INDEX IF NOT EXISTS book_orders_stripe_session_id_unique
  ON public.book_orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS book_orders_status_idx
  ON public.book_orders (status);