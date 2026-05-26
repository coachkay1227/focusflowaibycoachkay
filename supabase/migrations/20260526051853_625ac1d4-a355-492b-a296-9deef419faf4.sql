-- Phase 3.3 hardening: align autism_orders with book_orders/business_audits.
-- The webhook autism branch already short-circuits via processed_stripe_events,
-- but a UNIQUE constraint on stripe_session_id provides defense-in-depth and
-- matches the contract documented in the audit branch (line 274 of stripe-webhook).
ALTER TABLE public.autism_orders
  ADD CONSTRAINT autism_orders_stripe_session_id_key
  UNIQUE (stripe_session_id);