
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.book_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NULL,
  referral_source TEXT NOT NULL,
  package_slug TEXT NOT NULL,
  package_name TEXT NOT NULL,
  package_price INTEGER NOT NULL,
  book_purpose TEXT NOT NULL,
  book_vision TEXT NOT NULL,
  characters TEXT NULL,
  illustration_style TEXT NOT NULL,
  special_requirements TEXT NULL,
  addons JSONB NOT NULL DEFAULT '[]'::jsonb,
  addons_total INTEGER NOT NULL DEFAULT 0,
  order_total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment','paid','in_progress','delivered','cancelled')),
  stripe_session_id TEXT NULL UNIQUE,
  stripe_payment_intent_id TEXT NULL,
  admin_notes TEXT NULL
);

CREATE INDEX idx_book_orders_user_id ON public.book_orders(user_id);
CREATE INDEX idx_book_orders_status ON public.book_orders(status);
CREATE INDEX idx_book_orders_created_at ON public.book_orders(created_at DESC);

ALTER TABLE public.book_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own book orders"
  ON public.book_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all book orders"
  ON public.book_orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_book_orders_updated_at
  BEFORE UPDATE ON public.book_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
