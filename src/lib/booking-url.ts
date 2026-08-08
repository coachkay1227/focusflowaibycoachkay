/**
 * Builds a booking URL that carries the verified order behind it.
 *
 * Every value here must come from a backend-confirmed source: a settled Stripe
 * session or a fulfillment row read through RLS. Never pass values a visitor
 * typed or edited in the address bar, because these params show up on the
 * booking record and are used to prove which plan and session type was booked.
 */

export type BookingSessionType = "paid_strategy" | "free_clarity";

export interface BookingContext {
  /** Which call this booking is for. Drives the proof line on the record. */
  sessionType: BookingSessionType;
  /** Verified product or plan name. */
  productName?: string | null;
  /** Stripe checkout session id, or another verified order reference. */
  orderRef?: string | null;
  /** Which fulfillment record this came from (table or flow name). */
  orderSource?: string | null;
  /** Pre-discount amount in cents, as the backend recorded it. */
  amountSubtotalCents?: number | null;
  /** Amount actually charged, in cents. */
  amountTotalCents?: number | null;
  /** Stripe checkout mode: payment or subscription. */
  mode?: string | null;
  /** Receipt email, for prefill. */
  email?: string | null;
  /** Buyer name, for prefill. */
  name?: string | null;
  /** Where the click happened, e.g. order_success or start. */
  placement?: string;
}

const CALL_LABEL: Record<BookingSessionType, string> = {
  paid_strategy: "60-minute strategy session",
  free_clarity: "15-minute clarity call",
};

function centsToAmount(cents?: number | null): string | null {
  if (typeof cents !== "number" || Number.isNaN(cents)) return null;
  return (cents / 100).toFixed(2);
}

/**
 * Human-readable proof string written onto the booking, so the session record
 * itself says which plan and call type it belongs to.
 */
export function bookingProofLine(ctx: BookingContext): string {
  const parts = [CALL_LABEL[ctx.sessionType]];
  if (ctx.productName) parts.push(ctx.productName);
  const paid = centsToAmount(ctx.amountTotalCents ?? ctx.amountSubtotalCents);
  if (paid) parts.push(`$${paid}`);
  if (ctx.orderRef) parts.push(`order ${ctx.orderRef}`);
  return parts.join(" · ");
}

/**
 * Appends prefill and verified-order params to a booking URL. Existing params
 * on the configured URL are preserved. Returns the base URL unchanged if it is
 * not parseable, so a bad admin setting can never break the button.
 */
export function buildBookingUrl(baseUrl: string, ctx: BookingContext): string {
  if (!baseUrl) return baseUrl;
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    return baseUrl;
  }

  const first = ctx.name?.trim().split(/\s+/)[0] ?? null;
  const last = ctx.name?.trim().split(/\s+/).slice(1).join(" ") || null;

  const params: Record<string, string | null> = {
    // Prefill so the buyer is not retyping what we already verified.
    email: ctx.email?.trim() || null,
    first_name: first,
    last_name: last,
    // Proof of what was bought and which call this is.
    session_type: ctx.sessionType,
    call_type: CALL_LABEL[ctx.sessionType],
    plan: ctx.productName?.trim() || null,
    order_ref: ctx.orderRef?.trim() || null,
    order_source: ctx.orderSource?.trim() || null,
    order_mode: ctx.mode?.trim() || null,
    order_amount: centsToAmount(ctx.amountTotalCents),
    order_subtotal: centsToAmount(ctx.amountSubtotalCents),
    booking_proof: bookingProofLine(ctx),
    // Attribution.
    utm_source: "focusflow",
    utm_medium: ctx.placement ?? "app",
    utm_campaign: ctx.sessionType,
  };

  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  return url.toString();
}