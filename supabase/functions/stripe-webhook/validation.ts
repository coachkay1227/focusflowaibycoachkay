// Pure validation helpers extracted for unit testing.
// Keep this file dependency-free so it can be imported in Deno tests
// without pulling in Stripe / Supabase clients.

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type MetaBag = Record<string, unknown> | null | undefined;

/**
 * Safely read a string field from a Stripe metadata bag.
 * Returns null when missing, non-string, empty, or longer than 500 chars.
 */
export function readMetaString(metadata: MetaBag, key: string): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const raw = (metadata as Record<string, unknown>)[key];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 500) return null;
  return trimmed;
}

export interface SessionLike {
  payment_status?: string | null;
  status?: string | null;
  amount_total?: number | null;
  metadata?: MetaBag;
}

export interface PendingOrder {
  id: string;
  order_total: number;
}

export type EligibilityResult =
  | { eligible: true }
  | {
      eligible: false;
      reason:
        | "not_paid"
        | "not_complete"
        | "missing_book_order_id"
        | "invalid_book_order_id"
        | "metadata_mismatch"
        | "amount_mismatch";
    };

/**
 * Decide whether a Stripe Checkout Session is eligible to flip a pending
 * book order to "paid". All checks short-circuit safely.
 */
export function evaluateBookOrderEligibility(
  session: SessionLike,
  pending: PendingOrder | null,
): EligibilityResult {
  if (session.payment_status !== "paid") return { eligible: false, reason: "not_paid" };
  if (session.status !== "complete") return { eligible: false, reason: "not_complete" };

  const metaId = readMetaString(session.metadata ?? null, "book_order_id");
  if (!metaId) return { eligible: false, reason: "missing_book_order_id" };
  if (!UUID_RE.test(metaId)) return { eligible: false, reason: "invalid_book_order_id" };

  if (!pending || pending.id !== metaId) {
    return { eligible: false, reason: "metadata_mismatch" };
  }

  const amount = typeof session.amount_total === "number" ? session.amount_total : null;
  if (amount === null || amount !== pending.order_total) {
    return { eligible: false, reason: "amount_mismatch" };
  }

  return { eligible: true };
}