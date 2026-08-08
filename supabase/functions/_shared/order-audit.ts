// Order audit trail. One writer for every row an admin later reads on
// /admin/audit-log, so fulfillment and next-step rows always share a shape.
//
// Rows written here have admin_id = null: they record what the SYSTEM verified
// or what a BUYER chose, not an admin action. Only the service role can insert
// them, so a client can never forge one.

export const ORDER_AUDIT_ACTIONS = {
  fulfillmentVerified: "order_fulfillment_verified",
  nextStepChosen: "order_next_step_chosen",
} as const;

interface AuditClient {
  from: (table: string) => {
    insert: (rows: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
}

export interface OrderAuditEntry {
  action: string;
  /** Where the order lives, e.g. business_audits or one_time_orders. */
  targetTable?: string | null;
  /** The order reference admins search by — the Stripe session id. */
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}

/** Never throws. An audit write must not be able to break fulfillment. */
export async function logOrderAudit(
  client: AuditClient,
  entry: OrderAuditEntry,
): Promise<boolean> {
  try {
    const { error } = await client.from("admin_audit_log").insert({
      admin_id: null,
      action: entry.action,
      target_table: entry.targetTable ?? null,
      target_id: entry.targetId ?? null,
      metadata: entry.metadata ?? {},
    });
    return !error;
  } catch {
    return false;
  }
}