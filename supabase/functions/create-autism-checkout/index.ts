import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.23.8";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  AUTISM_GIFT_WRAP,
  findAutismPackage,
} from "../_shared/autism-catalog.ts";

const log = (s: string, d?: Record<string, unknown>) =>
  console.log(`[CREATE-AUTISM-CHECKOUT] ${s}${d ? ` - ${JSON.stringify(d)}` : ""}`);

const BodySchema = z.object({
  client_name: z.string().trim().min(1).max(120),
  client_email: z.string().trim().email().max(255),
  client_phone: z.string().trim().max(40).optional().or(z.literal("")),
  use_case: z.enum(["parent", "therapist", "school"]),
  child_first_name: z.string().trim().max(80).optional().or(z.literal("")),
  child_age: z.string().trim().max(20).optional().or(z.literal("")),
  child_interests: z.string().trim().max(400).optional().or(z.literal("")),
  scenario_focus: z.string().trim().min(10).max(2000),
  special_requirements: z.string().trim().max(2000).optional().or(z.literal("")),
  provider_name: z.string().trim().max(120).optional().or(z.literal("")),
  provider_email: z.string().trim().email().max(255).optional().or(z.literal("")),
  package_slug: z.string().min(1),
  gift_wrap: z.boolean().default(false),
  gift_recipient: z.string().trim().max(120).optional().or(z.literal("")),
  gift_note: z.string().trim().max(500).optional().or(z.literal("")),
});

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const cors = getCorsHeaders(req);

  try {
    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parsed.error.flatten() }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }
    const body = parsed.data;

    const pkg = findAutismPackage(body.package_slug);
    if (!pkg) {
      return new Response(JSON.stringify({ error: "Unknown package" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (pkg.inquiryOnly || !pkg.priceId || pkg.priceCents <= 0) {
      return new Response(
        JSON.stringify({ error: "This package is inquiry-only and cannot be checked out." }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const giftWrapApplied = body.gift_wrap && !!pkg.giftWrapEligible;
    const addonsTotal = giftWrapApplied ? AUTISM_GIFT_WRAP.priceCents : 0;
    const orderTotal = pkg.priceCents + addonsTotal;

    // Optional auth
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const sb = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        );
        const token = authHeader.replace("Bearer ", "");
        const { data } = await sb.auth.getClaims(token);
        userId = data?.claims?.sub ?? null;
      } catch (_e) {
        // guest checkout fallback
      }
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: order, error: insertErr } = await admin
      .from("autism_orders")
      .insert({
        user_id: userId,
        client_name: body.client_name,
        client_email: body.client_email,
        client_phone: body.client_phone || null,
        use_case: body.use_case,
        child_first_name: body.child_first_name || null,
        child_age: body.child_age || null,
        child_interests: body.child_interests || null,
        scenario_focus: body.scenario_focus,
        special_requirements: body.special_requirements || null,
        provider_name: body.provider_name || null,
        provider_email: body.provider_email || null,
        package_slug: pkg.slug,
        package_name: pkg.name,
        package_price: pkg.priceCents,
        addons: giftWrapApplied ? [AUTISM_GIFT_WRAP.slug] : [],
        addons_total: addonsTotal,
        gift_wrap: giftWrapApplied,
        gift_recipient: giftWrapApplied ? (body.gift_recipient || null) : null,
        gift_note: giftWrapApplied ? (body.gift_note || null) : null,
        order_total: orderTotal,
        status: "pending_payment",
      })
      .select("id")
      .single();

    if (insertErr || !order) {
      log("Insert failed", { error: insertErr?.message });
      return new Response(JSON.stringify({ error: "Could not create order" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: pkg.priceId, quantity: 1 },
    ];
    if (giftWrapApplied) {
      lineItems.push({ price: AUTISM_GIFT_WRAP.priceId, quantity: 1 });
    }

    const origin = req.headers.get("origin") ?? "";
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: body.client_email,
        line_items: lineItems,
        success_url: `${origin}/order-success?type=autism&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/autism-social-stories#packages`,
        metadata: {
          autism_order_id: order.id,
          package_slug: pkg.slug,
          order_type: "autism",
        },
        payment_intent_data: { metadata: { autism_order_id: order.id } },
      });
    } catch (e) {
      log("Stripe session create failed, cancelling order", {
        orderId: order.id,
        error: e instanceof Error ? e.message : String(e),
      });
      await admin
        .from("autism_orders")
        .update({ status: "cancelled" })
        .eq("id", order.id)
        .eq("status", "pending_payment");
      return new Response(JSON.stringify({ error: "Could not start checkout" }), {
        status: 502, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { error: linkErr, data: linked } = await admin
      .from("autism_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id)
      .eq("status", "pending_payment")
      .is("stripe_session_id", null)
      .select("id");

    if (linkErr || !linked || linked.length === 0) {
      log("Failed to persist stripe_session_id, rolling back", {
        orderId: order.id, sessionId: session.id, error: linkErr?.message,
      });
      try { await stripe.checkout.sessions.expire(session.id); } catch (e) {
        log("Failed to expire orphan session", { error: String(e) });
      }
      await admin
        .from("autism_orders")
        .update({ status: "cancelled" })
        .eq("id", order.id)
        .eq("status", "pending_payment");
      return new Response(JSON.stringify({ error: "Could not link checkout session" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    log("Session created", { id: session.id, orderId: order.id });
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});