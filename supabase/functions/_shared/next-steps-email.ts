// Sends the "what to do now" email immediately after a fulfilled checkout.
// One helper, called once from the webhook, so every product path gets the
// same links and the same timeline.

import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { getBookingLinks } from "./booking-links.ts";

const PAID_CALL_THRESHOLD_CENTS = 29700;
const DEFAULT_SITE = "https://coachkayai.life";

export interface NextStepsEmailInput {
  sessionId: string;
  email: string | null;
  name?: string | null;
  productName?: string | null;
  /** Pre-discount subtotal in cents. Discounts must not change the call tier. */
  subtotalCents?: number | null;
  origin?: string | null;
  /** True when an AI report is still generating for this order. */
  reportPending?: boolean;
}

export async function sendNextStepsEmail(
  client: SupabaseClient,
  input: NextStepsEmailInput,
): Promise<void> {
  if (!input.email) return;
  const origin = input.origin || DEFAULT_SITE;
  const { freeClarityUrl, paidStrategyUrl } = await getBookingLinks(client);
  const earnedPaidCall = (input.subtotalCents ?? 0) >= PAID_CALL_THRESHOLD_CENTS;

  const params = new URLSearchParams({
    session_type: earnedPaidCall ? "paid_strategy" : "free_clarity",
    order_ref: input.sessionId,
    placement: "next_steps_email",
  });
  if (input.productName) params.set("product", input.productName);
  const base = earnedPaidCall ? paidStrategyUrl : freeClarityUrl;
  const bookingUrl = `${base}${base.includes("?") ? "&" : "?"}${params.toString()}`;

  await client.functions.invoke("send-transactional-email", {
    body: {
      templateName: "purchase-next-steps",
      recipientEmail: input.email,
      idempotencyKey: `next-steps-${input.sessionId}`,
      templateData: {
        name: input.name ?? null,
        productName: input.productName ?? null,
        bookingUrl,
        bookingLabel: earnedPaidCall
          ? "Book your 60-minute strategy session"
          : "Book your free 15-minute clarity call",
        bookingWindow: earnedPaidCall ? "within 72 hours" : "in the next 48 hours",
        startUrl: `${origin}/start`,
        challengesUrl: `${origin}/challenges`,
        dashboardUrl: `${origin}/dashboard`,
        reportPending: input.reportPending ?? false,
      },
    },
  });
}
