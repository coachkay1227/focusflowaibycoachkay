/**
 * Purchases at or above this pre-discount amount get the paid 60-minute
 * strategy session. Smaller one-off buys (the $47 audit) get the free
 * 15-minute clarity call.
 *
 * Always compare against Stripe's `amount_subtotal`, never `amount_total`, so
 * a coupon or an internal $0 test run cannot misclassify a real purchase.
 *
 * Shared by the order-success panel and the buyer onboarding flow so the two
 * screens cannot offer different calls for the same purchase.
 */
export const STRATEGY_CALL_THRESHOLD_CENTS = 29700;

/** True when this purchase earns the paid strategy session. */
export function wantsStrategyCall(opts: {
  amountSubtotalCents?: number | null;
  /** Stripe checkout mode. Subscriptions always get the strategy session. */
  mode?: string | null;
}): boolean {
  if (opts.mode === "subscription") return true;
  return (
    typeof opts.amountSubtotalCents === "number" &&
    opts.amountSubtotalCents >= STRATEGY_CALL_THRESHOLD_CENTS
  );
}