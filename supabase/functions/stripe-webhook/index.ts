import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { PRODUCT_TIER_MAP } from "../_shared/stripe-config.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

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
    logStep("Webhook signature verified", { type: event.type });

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

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Checkout session completed", {
        sessionId: session.id,
        mode: session.mode,
        paymentStatus: session.payment_status,
      });

      // Only process paid sessions
      if (session.payment_status !== "paid") {
        logStep("Payment not completed, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }

      // Book Store branch: if metadata carries a book_order_id, mark the
      // book order as paid (idempotent) and exit. Does not touch tier logic.
      const bookOrderId = session.metadata?.book_order_id;
      if (bookOrderId) {
        if (!UUID_RE.test(bookOrderId)) {
          logStep("Invalid book_order_id metadata, ignoring", { bookOrderId });
          return new Response(JSON.stringify({ received: true, ignored: "invalid_book_order_id" }), {
            headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
            status: 200,
          });
        }
        const pi = typeof session.payment_intent === "string" ? session.payment_intent : null;
        // Match on session id too: ensures we only update the order this session created.
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
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }

      // Get user ID from metadata
      const userId = session.metadata?.supabase_user_id;
      if (!userId || !UUID_RE.test(userId)) {
        logStep("No supabase_user_id in metadata, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }

      // Retrieve line items to get the product ID
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
      const priceData = lineItems.data[0]?.price;
      const productId = priceData?.product as string;

      if (!productId) {
        logStep("No product ID found in line items");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }

      const tier = PRODUCT_TIER_MAP[productId] || "subscriber";
      logStep("Upgrading user tier", { userId, productId, tier });

      const { error: upsertError } = await supabaseClient
        .from("user_access_levels")
        .upsert({ id: userId, tier }, { onConflict: "id" });

      if (upsertError) {
        logStep("Failed to upsert tier", { error: upsertError.message });
      } else {
        logStep("Tier upgraded successfully", { userId, tier });
      }
    } else if (event.type === "customer.subscription.deleted") {
      // Subscription cancelled — downgrade to free
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      logStep("Subscription deleted", { subscriptionId: subscription.id, userId });

      if (userId) {
        const { error: downgradeError } = await supabaseClient
          .from("user_access_levels")
          .upsert({ id: userId, tier: "free" }, { onConflict: "id" });

        if (downgradeError) {
          logStep("Failed to downgrade tier", { error: downgradeError.message });
        } else {
          logStep("User downgraded to free", { userId });
        }
      } else {
        logStep("No supabase_user_id in subscription metadata, skipping downgrade");
      }
    } else if (event.type === "invoice.payment_failed") {
      // Payment failed — log for monitoring (user still has access until period ends)
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      logStep("Invoice payment failed", {
        invoiceId: invoice.id,
        customerId,
        attemptCount: invoice.attempt_count,
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
