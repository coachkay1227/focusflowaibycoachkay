import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { PRODUCT_TIER_MAP } from "../_shared/stripe-config.ts";
import { readMetaString, UUID_RE } from "./validation.ts";
import { createLogger, recordFailureAndMaybeAlert } from "../_shared/structured-log.ts";

const SOURCE = "stripe-webhook";

const ok = (req: Request, body: Record<string, unknown> = { received: true }) =>
  new Response(JSON.stringify(body), {
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    status: 200,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const requestId = crypto.randomUUID();
  const log = createLogger(SOURCE, requestId);
  let activeEventId: string | undefined;
  let activeEventType: string | undefined;

  const fail = async (
    stage: string,
    reason: string,
    extra: { message?: string; context?: Record<string, unknown> } = {},
  ) => {
    log.error(stage, { reason, message: extra.message, ctx: extra.context, event_id: activeEventId, event_type: activeEventType });
    await recordFailureAndMaybeAlert(supabaseClient, log, {
      source: SOURCE,
      stage,
      reason,
      message: extra.message,
      eventId: activeEventId,
      eventType: activeEventType,
      context: { ...(extra.context ?? {}), request_id: requestId },
    });
  };

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
      await fail("config", "missing_webhook_secret");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!sig) {
      await fail("signature", "missing_signature_header");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 400,
      });
    }

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (e) {
      await fail("signature", "signature_verification_failed", {
        message: e instanceof Error ? e.message : String(e),
      });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 400,
      });
    }
    activeEventId = event.id;
    activeEventType = event.type;
    log.info("signature_verified", { event_id: event.id, event_type: event.type });

    // Idempotency: short-circuit if we've already processed this event id.
    const { error: insertEventErr } = await supabaseClient
      .from("processed_stripe_events")
      .insert({ event_id: event.id, event_type: event.type });
    if (insertEventErr) {
      // 23505 = unique_violation -> already processed
      if ((insertEventErr as { code?: string }).code === "23505") {
        log.info("duplicate_event_skipped", { event_id: event.id });
        return new Response(JSON.stringify({ received: true, duplicate: true }), {
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
          status: 200,
        });
      }
      log.warn("event_id_record_failed", { message: insertEventErr.message });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (!session || typeof session.id !== "string") {
        await fail("session", "malformed_session");
        return ok(req, { received: true, ignored: "malformed_session" });
      }
      log.info("checkout_session_completed", {
        ctx: { session_id: session.id, mode: session.mode, payment_status: session.payment_status },
      });

      // Only process paid sessions
      if (session.payment_status !== "paid" || session.status !== "complete") {
        log.info("session_not_paid_or_complete", {
          ctx: { payment_status: session.payment_status, status: session.status },
        });
        return ok(req);
      }

      // Book Store branch: if metadata carries a book_order_id, mark the
      // book order as paid (idempotent) and exit. Does not touch tier logic.
      const bookOrderId = readMetaString(session.metadata, "book_order_id");
      if (bookOrderId) {
        if (!UUID_RE.test(bookOrderId)) {
          await fail("book_order", "invalid_book_order_id", { context: { book_order_id: bookOrderId } });
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
          await fail("book_order", "lookup_failed", {
            message: pendingErr.message,
            context: { book_order_id: bookOrderId, session_id: session.id },
          });
          return ok(req, { received: true, ignored: "lookup_failed" });
        }
        if (!pending) {
          await fail("book_order", "no_pending_match", {
            context: { book_order_id: bookOrderId, session_id: session.id },
          });
          return ok(req);
        }
        const amountTotal = typeof session.amount_total === "number" ? session.amount_total : null;
        if (amountTotal === null || amountTotal !== pending.order_total) {
          await fail("book_order", "amount_mismatch", {
            context: { book_order_id: bookOrderId, session_amount: amountTotal, expected: pending.order_total },
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
          await fail("book_order", "update_failed", {
            message: bookErr.message,
            context: { book_order_id: bookOrderId },
          });
        } else if (!updated || updated.length === 0) {
          log.info("book_order_already_processed", {
            ctx: { book_order_id: bookOrderId, session_id: session.id },
          });
        } else {
          log.info("book_order_marked_paid", { ctx: { book_order_id: bookOrderId } });
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
              await fail("email", "paid_email_send_failed", {
                message: e instanceof Error ? e.message : String(e),
                context: { book_order_id: order.id },
              });
            }
          }
        }
        return ok(req);
      }

      // Get user ID from metadata
      const userId = readMetaString(session.metadata, "supabase_user_id");
      if (!userId || !UUID_RE.test(userId)) {
        log.info("missing_or_invalid_user_id", { ctx: { present: !!userId } });
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
        await fail("subscription", "line_items_unavailable", {
          message: e instanceof Error ? e.message : String(e),
          context: { session_id: session.id },
        });
        return ok(req, { received: true, ignored: "line_items_unavailable" });
      }

      if (!productId) {
        await fail("subscription", "missing_product_id", { context: { session_id: session.id } });
        return ok(req, { received: true, ignored: "missing_product_id" });
      }

      const mappedTier = PRODUCT_TIER_MAP[productId];
      if (!mappedTier) {
        await fail("subscription", "unknown_product", { context: { product_id: productId } });
        return ok(req, { received: true, ignored: "unknown_product" });
      }
      log.info("upgrading_user_tier", { ctx: { user_id: userId, product_id: productId, tier: mappedTier } });

      const { error: upsertError } = await supabaseClient
        .from("user_access_levels")
        .upsert({ id: userId, tier: mappedTier }, { onConflict: "id" });

      if (upsertError) {
        await fail("subscription", "tier_upsert_failed", {
          message: upsertError.message,
          context: { user_id: userId, tier: mappedTier },
        });
      } else {
        log.info("tier_upgraded", { ctx: { user_id: userId, tier: mappedTier } });
      }
    } else if (event.type === "customer.subscription.deleted") {
      // Subscription cancelled — downgrade to free
      const subscription = event.data.object as Stripe.Subscription;
      const userId = readMetaString(subscription?.metadata, "supabase_user_id");
      log.info("subscription_deleted", { ctx: { subscription_id: subscription?.id, user_id: userId } });

      if (!userId || !UUID_RE.test(userId)) {
        log.info("subscription_missing_user_id_skipping");
      } else {
        const { error: downgradeError } = await supabaseClient
          .from("user_access_levels")
          .upsert({ id: userId, tier: "free" }, { onConflict: "id" });

        if (downgradeError) {
          await fail("subscription", "downgrade_failed", {
            message: downgradeError.message,
            context: { user_id: userId },
          });
        } else {
          log.info("user_downgraded_to_free", { ctx: { user_id: userId } });
        }
      }
    } else if (event.type === "invoice.payment_failed") {
      // Payment failed — log for monitoring (user still has access until period ends)
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice?.customer === "string" ? invoice.customer : null;
      log.warn("invoice_payment_failed", {
        ctx: { invoice_id: invoice?.id, customer_id: customerId, attempt_count: invoice?.attempt_count },
      });
    }

    return ok(req);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await fail("unhandled", "exception", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
