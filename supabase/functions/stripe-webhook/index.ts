import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { PRODUCT_TIER_MAP, NO_TIER_PRODUCTS, PROTECTED_TIERS, TRANSFORMATION_PROGRAM_MAP, AGENT_BUILD_PRODUCTS, BUILD_STUDIO_PRODUCTS, ADVISORY_PRODUCTS } from "../_shared/stripe-config.ts";
import { readMetaString, UUID_RE } from "./validation.ts";
import { createLogger, recordFailureAndMaybeAlert } from "../_shared/structured-log.ts";

const SOURCE = "stripe-webhook";

const ok = (req: Request, body: Record<string, unknown> = { received: true }) =>
  new Response(JSON.stringify(body), {
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    status: 200,
  });

/** Fires cancellation email + GHL event after a successful subscription downgrade.
 *  Resolves the user's email from Stripe customer data (most reliable source). */
async function _fireCancellationNotifications(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  subscription: Stripe.Subscription,
  userId: string,
  fromTier: string | null,
  log: ReturnType<typeof createLogger>,
) {
  try {
    const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
    if (!customerId) return;
    const customer = await stripe.customers.retrieve(customerId);
    const cancelEmail = !customer.deleted && customer.email ? customer.email : null;
    if (!cancelEmail) return;
    supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "subscription-cancelled",
        recipientEmail: cancelEmail,
        idempotencyKey: `sub-cancelled-${subscription.id}`,
        templateData: { name: !customer.deleted ? customer.name : null },
      },
    }).catch(() => {});
    supabase.functions.invoke("ghl-webhook", {
      body: {
        event: "subscription_cancelled",
        payload: { email: cancelEmail, user_id: userId, from_tier: fromTier },
      },
    }).catch(() => {});
    log.info("cancellation_notifications_sent", { ctx: { user_id: userId, from_tier: fromTier } });
  } catch (e) {
    log.warn("cancellation_notification_error", {
      message: e instanceof Error ? e.message : String(e),
    });
  }
}

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
            supabaseClient.functions.invoke("ghl-webhook", {
              body: {
                event: "purchase",
                payload: {
                  email: order.client_email,
                  tier: "book_product",
                  product: order.package_name,
                  amount: order.order_total ?? null,
                },
              },
            }).catch(() => {});
          }
        }
        return ok(req);
      }

      // Autism Studio branch: if metadata carries an autism_order_id, mark the
      // autism order as paid (idempotent) and exit. Does not touch tier logic.
      const autismOrderId = readMetaString(session.metadata, "autism_order_id");
      if (autismOrderId) {
        if (!UUID_RE.test(autismOrderId)) {
          await fail("autism_order", "invalid_autism_order_id", { context: { autism_order_id: autismOrderId } });
          return ok(req, { received: true, ignored: "invalid_autism_order_id" });
        }
        const pi = typeof session.payment_intent === "string" ? session.payment_intent : null;
        const { data: pending, error: pendingErr } = await supabaseClient
          .from("autism_orders")
          .select("id, order_total, client_email, client_name, package_name, package_slug, child_first_name, scenario_focus, gift_wrap, gift_recipient, download_url")
          .eq("id", autismOrderId)
          .eq("stripe_session_id", session.id)
          .eq("status", "pending_payment")
          .maybeSingle();
        if (pendingErr) {
          await fail("autism_order", "lookup_failed", {
            message: pendingErr.message,
            context: { autism_order_id: autismOrderId, session_id: session.id },
          });
          return ok(req, { received: true, ignored: "lookup_failed" });
        }
        if (!pending) {
          await fail("autism_order", "no_pending_match", {
            context: { autism_order_id: autismOrderId, session_id: session.id },
          });
          return ok(req);
        }
        const amountTotal = typeof session.amount_total === "number" ? session.amount_total : null;
        if (amountTotal === null || amountTotal !== pending.order_total) {
          await fail("autism_order", "amount_mismatch", {
            context: { autism_order_id: autismOrderId, session_amount: amountTotal, expected: pending.order_total },
          });
          return ok(req, { received: true, ignored: "amount_mismatch" });
        }
        const { data: updated, error: autismErr } = await supabaseClient
          .from("autism_orders")
          .update({ status: "paid", stripe_payment_intent_id: pi })
          .eq("id", autismOrderId)
          .eq("stripe_session_id", session.id)
          .eq("status", "pending_payment")
          .select("id");
        if (autismErr) {
          await fail("autism_order", "update_failed", {
            message: autismErr.message,
            context: { autism_order_id: autismOrderId },
          });
        } else if (!updated || updated.length === 0) {
          log.info("autism_order_already_processed", {
            ctx: { autism_order_id: autismOrderId, session_id: session.id },
          });
        } else {
          log.info("autism_order_marked_paid", { ctx: { autism_order_id: autismOrderId } });
          if (pending.client_email) {
            try {
              const totalStr = typeof pending.order_total === "number"
                ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(pending.order_total / 100)
                : undefined;
              await supabaseClient.functions.invoke("send-transactional-email", {
                body: {
                  templateName: "autism-purchase-confirmation",
                  recipientEmail: pending.client_email,
                  idempotencyKey: `autism-purchase-${pending.id}`,
                  templateData: {
                    name: pending.client_name,
                    packageName: pending.package_name,
                    orderTotal: totalStr,
                    orderId: pending.id,
                    childFirstName: pending.child_first_name,
                    scenarioFocus: pending.scenario_focus,
                    isGift: !!pending.gift_wrap,
                    giftRecipient: pending.gift_recipient,
                    deliveryMethod: typeof pending.package_slug === "string" && pending.package_slug.includes("illustrated")
                      ? "custom-illustrated PDF"
                      : "print-ready PDF",
                    storyCount: 1,
                    includesHsaReceipt: true,
                    downloadUrl: pending.download_url ?? null,
                  },
                },
              });
            } catch (e) {
              await fail("email", "autism_confirm_email_failed", {
                message: e instanceof Error ? e.message : String(e),
                context: { autism_order_id: pending.id },
              });
            }
            supabaseClient.functions.invoke("ghl-webhook", {
              body: {
                event: "purchase",
                payload: {
                  email: pending.client_email,
                  tier: "autism_product",
                  product: pending.package_name,
                  amount: pending.order_total ?? null,
                },
              },
            }).catch(() => {});
          }
        }
        return ok(req);
      }

      // AI Business Audit branch ($47 one-time, prod_U91GXGNgo01tYp).
      // Runs BEFORE the user_id requirement so guest checkouts also work.
      // Creates a business_audits row + a 90-day magic-link token, then
      // fires the audit-purchase-confirmation email. Idempotency is
      // guaranteed by both processed_stripe_events AND the UNIQUE
      // constraint on business_audits.stripe_session_id.
      try {
        const liForAudit = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const productRef = liForAudit.data?.[0]?.price?.product;
        const productIdForAudit = typeof productRef === "string"
          ? productRef
          : (productRef && typeof productRef === "object" && typeof (productRef as { id?: unknown }).id === "string")
            ? (productRef as { id: string }).id
            : null;

        if (productIdForAudit === "prod_U91GXGNgo01tYp") {
          const auditUserId = readMetaString(session.metadata, "supabase_user_id");
          const customerEmail =
            (typeof session.customer_details?.email === "string" && session.customer_details!.email) ||
            (typeof session.customer_email === "string" && session.customer_email) ||
            "";
          const customerName =
            (typeof session.customer_details?.name === "string" && session.customer_details!.name) || null;

          const { data: existing } = await supabaseClient
            .from("business_audits")
            .select("id")
            .eq("stripe_session_id", session.id)
            .maybeSingle();

          if (existing?.id) {
            log.info("audit_already_created", { ctx: { audit_id: existing.id, session_id: session.id } });
            return ok(req, { received: true, audit_created: false, audit_id: existing.id });
          }

          const { data: inserted, error: insertErr } = await supabaseClient
            .from("business_audits")
            .insert({
              user_id: auditUserId && UUID_RE.test(auditUserId) ? auditUserId : null,
              guest_email: customerEmail || null,
              guest_name: customerName,
              stripe_session_id: session.id,
              intake: {},
            })
            .select("id")
            .single();

          if (insertErr || !inserted?.id) {
            await fail("audit", "audit_insert_failed", {
              message: insertErr?.message,
              context: { session_id: session.id },
            });
            return ok(req, { received: true, ignored: "audit_insert_failed" });
          }

          const token = `aud_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
          const { error: tokenErr } = await supabaseClient
            .from("audit_tokens")
            .insert({
              token,
              audit_id: inserted.id,
              email: customerEmail || "",
            });
          if (tokenErr) {
            await fail("audit", "audit_token_insert_failed", {
              message: tokenErr.message,
              context: { audit_id: inserted.id },
            });
          }

          // Magic link uses the request origin if available, falling back to live host.
          const origin = req.headers.get("origin") || "https://coachkayai.life";
          const magicLink = `${origin}/audit/intake?token=${encodeURIComponent(token)}`;

          if (customerEmail) {
            try {
              await supabaseClient.functions.invoke("send-transactional-email", {
                body: {
                  templateName: "audit-purchase-confirmation",
                  recipientEmail: customerEmail,
                  idempotencyKey: `audit-confirm-${inserted.id}`,
                  templateData: {
                    name: customerName,
                    audit_id: inserted.id,
                    token,
                    magic_link: magicLink,
                  },
                },
              });
            } catch (e) {
              await fail("email", "audit_confirm_email_failed", {
                message: e instanceof Error ? e.message : String(e),
                context: { audit_id: inserted.id },
              });
            }
          }

          // GHL: fire purchase event for the audit (best-effort, fire-and-forget)
          supabaseClient.functions.invoke("ghl-webhook", {
            body: {
              event: "purchase",
              payload: {
                email: customerEmail || null,
                user_id: auditUserId || null,
                tier: "audit",
                product: "AI Business Audit",
                amount: session.amount_total ?? null,
              },
            },
          }).catch(() => {});

          log.info("audit_purchase_processed", {
            ctx: { audit_id: inserted.id, session_id: session.id, has_user: !!auditUserId },
          });
          return ok(req, { received: true, audit_created: true, audit_id: inserted.id });
        }
      } catch (e) {
        await fail("audit", "audit_branch_exception", {
          message: e instanceof Error ? e.message : String(e),
          context: { session_id: session.id },
        });
        // fall through to default behavior
      }

      // Agent Build branch — GPT Agent & Claude Project Agent purchases.
      // Creates agent_orders row + fires intake confirmation email + GHL event.
      // Runs before user_id check so guest checkouts also work.
      try {
        const liForAgent = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const agentProductRef = liForAgent.data?.[0]?.price?.product;
        const agentProductId = typeof agentProductRef === "string"
          ? agentProductRef
          : (agentProductRef && typeof agentProductRef === "object" && typeof (agentProductRef as { id?: unknown }).id === "string")
            ? (agentProductRef as { id: string }).id
            : null;

        if (agentProductId && AGENT_BUILD_PRODUCTS.has(agentProductId)) {
          const agentUserId = readMetaString(session.metadata, "supabase_user_id");
          const agentEmail =
            (typeof session.customer_details?.email === "string" && session.customer_details!.email) ||
            (typeof session.customer_email === "string" && session.customer_email) ||
            "";
          const agentName =
            (typeof session.customer_details?.name === "string" && session.customer_details!.name) || null;
          const agentType = agentProductId === "prod_Ul02esdwy10Ylm" ? "claude" : "gpt";
          const priceId = readMetaString(session.metadata, "price_id") ?? "";
          const isHosted = priceId.startsWith("price_1TlU2t") || priceId.startsWith("price_1TlU2v") || priceId.startsWith("price_1TlU33");
          const agentTier = "single";

          const { data: existingAgent } = await supabaseClient
            .from("agent_orders")
            .select("id")
            .eq("stripe_session_id", session.id)
            .maybeSingle();

          if (!existingAgent?.id) {
            const { data: insertedAgent, error: agentInsertErr } = await supabaseClient
              .from("agent_orders")
              .insert({
                user_id: agentUserId && UUID_RE.test(agentUserId) ? agentUserId : null,
                guest_email: agentEmail || null,
                agent_type: agentType,
                agent_tier: agentTier,
                agent_count: 1,
                ownership_pref: isHosted ? "hosted" : "own",
                stripe_session_id: session.id,
                status: "pending",
                quoted_price_cents: session.amount_total ?? null,
              })
              .select("id")
              .single();

            if (agentInsertErr) {
              await fail("agent_order", "insert_failed", { message: agentInsertErr.message, context: { session_id: session.id } });
            } else if (insertedAgent?.id && agentEmail) {
              const origin = req.headers.get("origin") || "https://coachkayai.life";
              await supabaseClient.functions.invoke("send-transactional-email", {
                body: {
                  templateName: "agent-order-confirmation",
                  recipientEmail: agentEmail,
                  idempotencyKey: `agent-confirm-${insertedAgent.id}`,
                  templateData: {
                    name: agentName,
                    agentType: agentType === "claude" ? "Claude Project Agent" : "Custom GPT Agent",
                    intakeUrl: `${origin}/agent-intake`,
                    orderId: insertedAgent.id,
                  },
                },
              }).catch(() => {});

              supabaseClient.functions.invoke("ghl-webhook", {
                body: {
                  event: "purchase",
                  payload: {
                    email: agentEmail,
                    user_id: agentUserId || null,
                    tier: "agent_build",
                    product: agentType === "claude" ? "Claude Project Agent" : "Custom GPT Agent",
                    amount: session.amount_total ?? null,
                  },
                },
              }).catch(() => {});

              log.info("agent_order_created", { ctx: { agent_id: insertedAgent.id, agent_type: agentType } });
            }
          }
          return ok(req, { received: true, agent_order: true });
        }
      } catch (e) {
        await fail("agent_order", "agent_branch_exception", {
          message: e instanceof Error ? e.message : String(e),
          context: { session_id: session.id },
        });
      }

      // Build Studio branch — one-time quick-win builds + recurring care plans.
      // Runs before the user_id check so guest checkouts also get an email + GHL event.
      try {
        const liForBs = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const bsProductRef = liForBs.data?.[0]?.price?.product;
        const bsProductId = typeof bsProductRef === "string"
          ? bsProductRef
          : (bsProductRef && typeof bsProductRef === "object" && typeof (bsProductRef as { id?: unknown }).id === "string")
            ? (bsProductRef as { id: string }).id
            : null;

        if (bsProductId && BUILD_STUDIO_PRODUCTS[bsProductId]) {
          const bsProductName = BUILD_STUDIO_PRODUCTS[bsProductId];
          const bsEmail =
            (typeof session.customer_details?.email === "string" && session.customer_details!.email) ||
            (typeof session.customer_email === "string" && session.customer_email) ||
            "";
          const bsName =
            (typeof session.customer_details?.name === "string" && session.customer_details!.name) || null;
          const bsIsSubscription = session.mode === "subscription";

          if (bsEmail) {
            supabaseClient.functions.invoke("send-transactional-email", {
              body: {
                templateName: "build-studio-order-confirmation",
                recipientEmail: bsEmail,
                idempotencyKey: `bs-confirm-${session.id}`,
                templateData: {
                  name: bsName,
                  productName: bsProductName,
                  orderType: bsIsSubscription ? "subscription" : "one-time",
                },
              },
            }).catch(() => {});
          }

          supabaseClient.functions.invoke("ghl-webhook", {
            body: {
              event: "purchase",
              payload: {
                email: bsEmail || null,
                tier: "build_studio",
                product: bsProductName,
                amount: session.amount_total ?? null,
              },
            },
          }).catch(() => {});

          // Persist order record for admin visibility and future intake
          supabaseClient.from("one_time_orders").upsert({
            stripe_session_id: session.id,
            user_id: readMetaString(session.metadata, "supabase_user_id") || null,
            guest_email: bsEmail || null,
            guest_name: bsName || null,
            product_id: bsProductId,
            product_name: bsProductName,
            price_cents: session.amount_total ?? 0,
            product_type: "build_studio",
            order_type: bsIsSubscription ? "subscription" : "one_time",
          }, { onConflict: "stripe_session_id" }).then(() => {}).catch(() => {});

          log.info("build_studio_purchase_processed", {
            ctx: { product_id: bsProductId, product_name: bsProductName, session_id: session.id, is_subscription: bsIsSubscription },
          });
          return ok(req, { received: true, build_studio: true });
        }
      } catch (e) {
        await fail("build_studio", "build_studio_branch_exception", {
          message: e instanceof Error ? e.message : String(e),
          context: { session_id: session.id },
        });
        // fall through to tier logic
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
        // Advisory / intensive products — send confirmation email + GHL, no tier change
        if (ADVISORY_PRODUCTS.has(productId)) {
          const advEmail =
            (typeof session.customer_details?.email === "string" && session.customer_details.email) ||
            (typeof session.customer_email === "string" && session.customer_email) ||
            "";
          const advName =
            (typeof session.customer_details?.name === "string" && session.customer_details.name) || null;
          if (advEmail) {
            supabaseClient.functions.invoke("send-transactional-email", {
              body: {
                templateName: "advisory-purchase-confirmation",
                recipientEmail: advEmail,
                idempotencyKey: `advisory-confirm-${session.id}`,
                templateData: {
                  name: advName,
                  productName: "AI Strategy Intensive",
                  bookingUrl: "https://call.coachkayelevates.org/widget/bookings/60min-discover-call",
                },
              },
            }).catch(() => {});
          }
          supabaseClient.functions.invoke("ghl-webhook", {
            body: {
              event: "advisory_intake_purchased",
              payload: {
                email: advEmail || null,
                product: "AI Strategy Intensive",
                amount: session.amount_total ?? null,
                user_id: userId || null,
              },
            },
          }).catch(() => {});
          // Persist advisory order for admin visibility
          supabaseClient.from("one_time_orders").upsert({
            stripe_session_id: session.id,
            user_id: userId || null,
            guest_email: advEmail || null,
            guest_name: advName || null,
            product_id: productId,
            product_name: "AI Strategy Intensive",
            price_cents: session.amount_total ?? 0,
            product_type: "advisory",
            order_type: "one_time",
          }, { onConflict: "stripe_session_id" }).then(() => {}).catch(() => {});
          log.info("advisory_purchase_processed", { ctx: { product_id: productId, session_id: session.id } });
          return ok(req, { received: true, advisory: true });
        }

        // One-time non-tier products (AI Business Audit, Build Studio)
        // don't change the buyer's access level. Acknowledge silently.
        if (NO_TIER_PRODUCTS.has(productId)) {
          log.info("one_time_product_no_tier_change", { ctx: { product_id: productId, user_id: userId } });
          return ok(req, { received: true, no_tier_change: true });
        }
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
        // Transformation-path welcome email (best-effort, idempotent via key).
        const program = TRANSFORMATION_PROGRAM_MAP[productId];
        if (program) {
          try {
            const recipientEmail =
              (typeof session.customer_details?.email === "string" && session.customer_details!.email) ||
              (typeof session.customer_email === "string" && session.customer_email) ||
              null;
            const recipientName =
              (typeof session.customer_details?.name === "string" && session.customer_details!.name) || null;
            if (recipientEmail) {
              const origin = req.headers.get("origin") || "https://coachkayai.life";
              await supabaseClient.functions.invoke("send-transactional-email", {
                body: {
                  templateName: program.template,
                  recipientEmail,
                  idempotencyKey: `${program.template}-${session.id}`,
                  templateData: {
                    name: recipientName,
                    programName: program.programName,
                    dashboardUrl: `${origin}/dashboard?welcome=program`,
                  },
                },
              });
              log.info("transformation_welcome_sent", { ctx: { user_id: userId, template: program.template } });
            }
          } catch (e) {
            await fail("email", "transformation_welcome_failed", {
              message: e instanceof Error ? e.message : String(e),
              context: { user_id: userId, product_id: productId },
            });
          }
        }

        // Rent-an-Agent welcome email — fires when mappedTier is rent_agent.
        // Transformation paths (reset_30, transformation_90) are handled by
        // TRANSFORMATION_PROGRAM_MAP above; rent_agent needs its own onboarding.
        if (mappedTier === "rent_agent") {
          const rentEmail =
            (typeof session.customer_details?.email === "string" && session.customer_details!.email) ||
            (typeof session.customer_email === "string" && session.customer_email) ||
            null;
          const rentName =
            (typeof session.customer_details?.name === "string" && session.customer_details!.name) || null;
          if (rentEmail) {
            supabaseClient.functions.invoke("send-transactional-email", {
              body: {
                templateName: "rent-agent-welcome",
                recipientEmail: rentEmail,
                idempotencyKey: `rent-agent-welcome-${session.id}`,
                templateData: {
                  name: rentName,
                  planName: null,
                  dashboardUrl: `${origin}/dashboard?welcome=rent-agent`,
                  intakeUrl: `${origin}/agent-intake`,
                },
              },
            }).catch(() => {});
            log.info("rent_agent_welcome_sent", { ctx: { user_id: userId } });
          }
        }

        // GHL: fire purchase event for tier upgrades (best-effort, fire-and-forget)
        const purchaseEmail =
          (typeof session.customer_details?.email === "string" && session.customer_details!.email) ||
          (typeof session.customer_email === "string" && session.customer_email) ||
          null;
        supabaseClient.functions.invoke("ghl-webhook", {
          body: {
            event: "purchase",
            payload: {
              email: purchaseEmail,
              user_id: userId,
              tier: mappedTier,
              product: productId,
              amount: session.amount_total ?? null,
            },
          },
        }).catch(() => {});
      }
    } else if (event.type === "customer.subscription.deleted") {
      // Subscription cancelled — downgrade to free
      const subscription = event.data.object as Stripe.Subscription;
      const userId = readMetaString(subscription?.metadata, "supabase_user_id");
      log.info("subscription_deleted", { ctx: { subscription_id: subscription?.id, user_id: userId } });

      if (!userId || !UUID_RE.test(userId)) {
        log.info("subscription_missing_user_id_skipping");
      } else {
        // Read current tier before mutating. Manually elevated tiers
        // (cohort, premium, rent_agent, corporate) must NEVER be silently
        // downgraded when an unrelated subscription ends.
        const { data: current, error: readErr } = await supabaseClient
          .from("user_access_levels")
          .select("tier")
          .eq("id", userId)
          .maybeSingle();

        if (readErr) {
          await fail("subscription", "tier_read_failed", {
            message: readErr.message,
            context: { user_id: userId },
          });
        } else if (current && PROTECTED_TIERS.includes(current.tier)) {
          // Only `rent_agent` is subscription-tied; allow it to downgrade
          // (it's the subscription that just ended). All other PROTECTED
          // tiers represent manual elevation and must be preserved.
          if (current.tier === "rent_agent") {
            const { error: downgradeError } = await supabaseClient
              .from("user_access_levels")
              .upsert({ id: userId, tier: "free" }, { onConflict: "id" });
            if (downgradeError) {
              await fail("subscription", "downgrade_failed", {
                message: downgradeError.message,
                context: { user_id: userId, from_tier: current.tier },
              });
            } else {
              log.info("rent_agent_downgraded_to_free", { ctx: { user_id: userId } });
              await _fireCancellationNotifications(supabaseClient, stripe, subscription, userId, current.tier, log);
            }
          } else {
            log.info("protected_tier_downgrade_skipped", {
              ctx: { user_id: userId, current_tier: current.tier, reason: "manual_elevation_preserved" },
            });
          }
        } else {
          // Free / subscriber / unknown — safe to set free.
          const { error: downgradeError } = await supabaseClient
            .from("user_access_levels")
            .upsert({ id: userId, tier: "free" }, { onConflict: "id" });
          if (downgradeError) {
            await fail("subscription", "downgrade_failed", {
              message: downgradeError.message,
              context: { user_id: userId, from_tier: current?.tier ?? null },
            });
          } else {
            log.info("user_downgraded_to_free", { ctx: { user_id: userId, from_tier: current?.tier ?? null } });
            await _fireCancellationNotifications(supabaseClient, stripe, subscription, userId, current?.tier ?? null, log);
          }
        }
      }
    } else if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice?.customer === "string" ? invoice.customer : null;
      log.warn("invoice_payment_failed", {
        ctx: { invoice_id: invoice?.id, customer_id: customerId, attempt_count: invoice?.attempt_count },
      });
      // Notify user so they can update their card before Stripe auto-cancels.
      if (customerId) {
        try {
          const customer = await stripe.customers.retrieve(customerId);
          const failEmail = !customer.deleted && customer.email ? customer.email : null;
          if (failEmail) {
            const nextRetryDate = typeof (invoice as any).next_payment_attempt === "number"
              ? new Date((invoice as any).next_payment_attempt * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric" })
              : null;
            supabaseClient.functions.invoke("send-transactional-email", {
              body: {
                templateName: "payment-failed",
                recipientEmail: failEmail,
                idempotencyKey: `payment-failed-${invoice.id}`,
                templateData: {
                  attemptCount: invoice.attempt_count ?? 1,
                  nextRetryDate,
                },
              },
            }).catch(() => {});
            supabaseClient.functions.invoke("ghl-webhook", {
              body: {
                event: "payment_failed",
                payload: {
                  email: failEmail,
                  customer_id: customerId,
                  attempt: invoice.attempt_count ?? 1,
                },
              },
            }).catch(() => {});
            log.info("payment_failed_notifications_sent", {
              ctx: { customer_id: customerId, attempt: invoice.attempt_count },
            });
          }
        } catch (e) {
          log.warn("payment_failed_notification_error", {
            message: e instanceof Error ? e.message : String(e),
          });
        }
      }
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
