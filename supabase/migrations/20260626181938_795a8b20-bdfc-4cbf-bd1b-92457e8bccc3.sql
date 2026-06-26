ALTER TABLE public.autism_orders   ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.book_orders     ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.agent_orders    ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.one_time_orders ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.business_audits ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_autism_orders_is_test   ON public.autism_orders   (is_test) WHERE is_test = true;
CREATE INDEX IF NOT EXISTS idx_book_orders_is_test     ON public.book_orders     (is_test) WHERE is_test = true;
CREATE INDEX IF NOT EXISTS idx_agent_orders_is_test    ON public.agent_orders    (is_test) WHERE is_test = true;
CREATE INDEX IF NOT EXISTS idx_one_time_orders_is_test ON public.one_time_orders (is_test) WHERE is_test = true;
CREATE INDEX IF NOT EXISTS idx_business_audits_is_test ON public.business_audits (is_test) WHERE is_test = true;

COMMENT ON COLUMN public.autism_orders.is_test   IS 'True for admin/owner demo purchases. Exclude from revenue reports.';
COMMENT ON COLUMN public.book_orders.is_test     IS 'True for admin/owner demo purchases. Exclude from revenue reports.';
COMMENT ON COLUMN public.agent_orders.is_test    IS 'True for admin/owner demo purchases. Exclude from revenue reports.';
COMMENT ON COLUMN public.one_time_orders.is_test IS 'True for admin/owner demo purchases. Exclude from revenue reports.';
COMMENT ON COLUMN public.business_audits.is_test IS 'True for admin/owner demo purchases. Exclude from revenue reports.';