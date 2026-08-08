/**
 * Records the next action a buyer chose after a verified purchase, plus the
 * exact link they were sent to, on the admin audit trail.
 *
 * Only backend-confirmed values belong here. The edge function re-verifies the
 * order before writing, so nothing a visitor edits in the address bar can
 * create a row. Fire-and-forget: a failed log never blocks a click.
 */
import { supabase } from "@/integrations/supabase/client";

export type OrderNextStepAction =
  | "book_call"
  | "start_challenge"
  | "start_here"
  | "view_offer"
  | "join_community"
  | "join_waitlist"
  | "open_dashboard";

export interface OrderNextStepLog {
  action: OrderNextStepAction;
  /** Stripe checkout session id, when the screen was confirmed by one. */
  sessionId?: string | null;
  /** Fulfillment row id, when there is no session id to hand. */
  orderId?: string | null;
  /** Where the click sends them. */
  linkTarget?: string | null;
  sessionType?: "paid_strategy" | "free_clarity" | null;
  productName?: string | null;
  amountSubtotalCents?: number | null;
  placement?: string;
}

export function logOrderNextStep(entry: OrderNextStepLog): void {
  if (!entry.sessionId && !entry.orderId) return;
  void supabase.functions
    .invoke("log-order-next-step", {
      body: {
        action: entry.action,
        session_id: entry.sessionId ?? null,
        order_id: entry.orderId ?? null,
        link_target: entry.linkTarget ?? null,
        session_type: entry.sessionType ?? null,
        product_name: entry.productName ?? null,
        amount_subtotal_cents: entry.amountSubtotalCents ?? null,
        placement: entry.placement ?? null,
      },
    })
    .catch(() => {
      /* audit logging is best-effort */
    });
}