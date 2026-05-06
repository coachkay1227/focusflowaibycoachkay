import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { PRODUCT_TIER_MAP } from "../_shared/stripe-config.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Safely read a string field from a Stripe metadata bag.
 * Returns null when missing, non-string, empty, or longer than 500 chars.
 */
const readMetaString = (
  metadata: Stripe.Metadata | null | undefined,
  key: string,
): string | null => {
  if (!metadata || typeof metadata !== "object") return null;
  const raw = (metadata as Record<string, unknown>)[key];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 500) return null;
  return trimmed;
};

const ok = (req: Request, body: Record<string, unknown> = { received: true }) =>
  new Response(JSON.stringify(body), {
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    status: 200,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;

    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET is not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!sig) {
      logStep("ERROR: Missing stripe-signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 400,
      });
    }

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    logStep("Webhook signature verified", { type: event.type, id: event.id });

    // Idempotency: short-circuit if we've already processed this event id.
    const { error: insertEventErr } = await supabaseClient
      .from("processed_stripe_events")
      .insert({ event_id: event.id, event_type: event.type });
    if (insertEventErr) {
      // 23505 = unique_violation -> already processed
      if ((insertEventErr as { code?: string }).code === "23505") {
        logStep("Duplicate event, skipping", { eventId: event.id });
        return new Response(JSON.stringify({ received: true, duplicate: true }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
          status: 200,
        });
      }
      logStep("Failed to record event id, continuing", { error: insertEventErr.message });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (!session || typeof session.id !== "string") {
        logStep("Malformed checkout.session payload, ignoring");
        return ok(req, { received: true, ignored: "malformed_session" });
      }
      logStep("Checkout session completed", {
        sessionId: session.id,
        mode: session.mode,
        paymentStatus: session.payment_status,
      });

      // Only process paid sessions
      if (session.payment_status !== "paid" || session.status !== "complete") {
        logStep("Session not paid/complete, skipping", {
          paymentStatus: session.payment_status,
          status: session.status,
        });
        return ok(req);
      }

      // Book Store branch: if metadata carries a book_order_id, mark the
      // book order as paid (idempotent) and exit. Does not touch tier logic.
      const bookOrderId = readMetaString(session.metadata, "book_order_id");
      if (bookOrderId) {
        if (!UUID_RE.test(bookOrderId)) {
          logStep("Invalid book_order_id metadata, ignoring", { bookOrderId });
          return ok(req, { received: true, ignored: "invalid_book_order_id" });
        }
        const pi = typeof session.payment_intent === "string" ? session.payment_intent : null;
        // Cross-check amount before flipping to paid: prevents a tampered
        // metadata id from upgrading a different-priced order.
        const { data: pending, error: pendingErr } = await supabaseClient
          .from("book_orders")
          .select("id, order_total")
          .eq("id", bookOrderId)
          .eq("stripe_session_id", session.id)
          .eq("status", "pending_payment")
          .maybeSingle();
        if (pendingErr) {
          logStep("Failed to look up pending book order", { error: pendingErr.message });
          return ok(req, { received: true, ignored: "lookup_failed" });
        }
        if (!pending) {
          logStep("No pending order matches book_order_id+session, no-op", {
            bookOrderId,
            sessionId: session.id,
          });
          return ok(req);
        }
        const amountTotal = typeof session.amount_total === "number" ? session.amount_total : null;
        if (amountTotal === null || amountTotal !== pending.order_total) {
          logStep("Amount mismatch, refusing to mark paid", {
            bookOrderId,
            sessionAmount: amountTotal,
            expected: pending.order_total,
          });
          return ok(req, { received: true, ignored: "amount_mismatch" });
        }
        const { data: updated, error: bookErr } = await supabaseClient
          .from("book_orders")
          .update({ status: "paid", stripe_payment_intent_id: pi })
          .eq("id", bookOrderId)
          .eq("stripe_session_id", session.id)
          .eq("status", "pending_payment")
          .select("id, client_email, client_name, package_name, order_total");
        if (bookErr) {
          logStep("Failed to update book order", { error: bookErr.message });
        } else if (!updated || updated.length === 0) {
          logStep("Book order not in pending_payment state or session mismatch, no-op", { bookOrderId, sessionId: session.id });
        } else {
          logStep("Book order marked paid", { bookOrderId });
          const order = updated[0];
          if (order.client_email) {
            try {
              const totalStr = typeof order.order_total === "number"
                ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(order.order_total / 100)
                : undefined;
              await supabaseClient.functions.invoke("send-transactional-email", {
                body: {
                  templateName: "book-order-paid",
                  recipientEmail: order.client_email,
                  idempotencyKey: `book-order-paid-${order.id}`,
                  templateData: {
                    name: order.client_name,
                    packageName: order.package_name,
                    orderTotal: totalStr,
                    orderId: order.id,
                  },
                },
              });
            } catch (e) {
              logStep("Failed to send paid email", { error: String(e) });
            }
          }
        }
        return ok(req);
      }

      // Get user ID from metadata
      const userId = readMetaString(session.metadata, "supabase_user_id");
      if (!userId || !UUID_RE.test(userId)) {
        logStep("No/invalid supabase_user_id in metadata, skipping", {
          present: !!userId,
        });
        return ok(req, { received: true, ignored: "missing_or_invalid_user_id" });
      }

      // Retrieve line items to get the product ID
      let productId: string | null = null;
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const priceData = lineItems.data?.[0]?.price;
        const product = priceData?.product;
        if (typeof product === "string" && product.length > 0) {
          productId = product;
        } else if (product && typeof product === "object" && typeof (product as { id?: unknown }).id === "string") {
          productId = (product as { id: string }).id;
        }
      } catch (e) {
        logStep("Failed to list line items, skipping tier upgrade", { error: String(e) });
        return ok(req, { received: true, ignored: "line_items_unavailable" });
      }

      if (!productId) {
        logStep("No product ID found in line items");
        return ok(req, { received: true, ignored: "missing_product_id" });
      }

      const mappedTier = PRODUCT_TIER_MAP[productId];
      if (!mappedTier) {
        logStep("Unknown product ID, no tier mapping found, skipping", { productId });
        return ok(req, { received: true, ignored: "unknown_product" });
      }
      logStep("Upgrading user tier", { userId, productId, tier: mappedTier });

      const { error: upsertError } = await supabaseClient
        .from("user_access_levels")
        .upsert({ id: userId, tier: mappedTier }, { onConflict: "id" });

      if (upsertError) {
        logStep("Failed to upsert tier", { error: upsertError.message });
      } else {
        logStep("Tier upgraded successfully", { userId, tier: mappedTier });
      }
    } else if (event.type === "customer.subscription.deleted") {
      // Subscription cancelled — downgrade to free
      const subscription = event.data.object as Stripe.Subscription;
      const userId = readMetaString(subscription?.metadata, "supabase_user_id");
      logStep("Subscription deleted", { subscriptionId: subscription?.id, userId });

      if (!userId || !UUID_RE.test(userId)) {
        logStep("No/invalid supabase_user_id in subscription metadata, skipping downgrade");
      } else {
        const { error: downgradeError } = await supabaseClient
          .from("user_access_levels")
          .upsert({ id: userId, tier: "free" }, { onConflict: "id" });

        if (downgradeError) {
          logStep("Failed to downgrade tier", { error: downgradeError.message });
        } else {
          logStep("User downgraded to free", { userId });
        }
      }
    } else if (event.type === "invoice.payment_failed") {
      // Payment failed — log for monitoring (user still has access until period ends)
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice?.customer === "string" ? invoice.customer : null;
      logStep("Invoice payment failed", {
        invoiceId: invoice?.id,
        customerId,
        attemptCount: invoice?.attempt_count,
      });
    }

    return ok(req);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
