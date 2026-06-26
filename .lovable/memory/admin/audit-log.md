---
name: Admin Audit Log
description: admin_audit_log table records admin view-as-user toggle and admin write actions
type: feature
---
`public.admin_audit_log` (admin_id, action, target_table, target_id, metadata, created_at). RLS restricts SELECT/INSERT to admins via `has_role`. Service role full access. Writers: `AdminViewContext` (action `admin_view_toggle`), `manage-users` (`user_tier_update`, `content_setting_update`), `update-autism-order` (`autism_order_update`). Add new admin write surfaces here as they ship.