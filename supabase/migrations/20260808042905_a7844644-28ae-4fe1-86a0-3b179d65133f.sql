ALTER TABLE public.admin_audit_log ALTER COLUMN admin_id DROP NOT NULL;

COMMENT ON COLUMN public.admin_audit_log.admin_id IS 'The admin who performed the action, or NULL for system-recorded events such as verified order fulfillment and buyer next-step choices.';