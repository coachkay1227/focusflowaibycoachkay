import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.23.8";
import { getCorsHeaders } from "../_shared/cors.ts";
import { findAddon, findPackage } from "../_shared/book-catalog.ts";

const log = (s: string, d?: Record<string, unknown>) =>
  console.log(`[CREATE-BOOK-CHECKOUT] ${s}${d ? ` - ${JSON.stringify(d)}` : ""}`);

const BodySchema = z.object({
  client_name: z.string().trim().min(1).max(120),
  client_email: z.string().trim().email().max(255),
  client_phone: z.string().trim().max(40).optional().or(z.literal("")),
  referral_source: z.string().min(1).max(50),
  package_slug: z.string().min(1),
  book_title: z.string().trim().max(200).optional().or(z.literal("")),
  book_purpose: z.string().min(1).max(80),
  book_vision: z.string().trim().min(50).max(4000),
  characters: z.string().trim().max(500).optional().or(z.literal("")),
  illustration_style: z.string().min(1).max(60),
  special_requirements: z.string().trim().max(2000).optional().or(z.literal("")),
  addons: z.array(z.string()).default([]),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  const cors = getCorsHeaders(req);

  try {
    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid input", details: parsed.error.flatten() }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const body = parsed.data;

    const pkg = findPackage(body.package_slug);
    if (!pkg) {
      return new Response(JSON.stringify({ error: "Unknown package" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const addons = body.addons
      .map((s) => findAddon(s))
      .filter((a): a is NonNullable<typeof a> => !!a);
    const addonsTotal = addons.reduce((s, a) => s + a.priceCents, 0);
    const orderTotal = pkg.priceCents + addonsTotal;

    // Optional auth
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const sb = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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
      { auth: { persistSession: false } }
    );

    const { data: order, error: insertErr } = await admin
      .from("book_orders")
      .insert({
        user_id: userId,
        client_name: body.client_name,
        client_email: body.client_email,
        client_phone: body.client_phone || null,
        referral_source: body.referral_source,
        package_slug: pkg.slug,
        package_name: pkg.name,
        package_price: pkg.priceCents,
        book_purpose: body.book_purpose,
        book_vision: body.book_vision,
        characters: body.characters || null,
        illustration_style: body.illustration_style,
        special_requirements: body.special_requirements || null,
        addons: addons.map((a) => a.slug),
        addons_total: addonsTotal,
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
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: pkg.priceCents,
          product_data: { name: pkg.name },
        },
      },
      ...addons.map((a) => ({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: a.priceCents,
          product_data: { name: a.name },
        },
      })),
    ];

    const origin = req.headers.get("origin") ?? "";
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: body.client_email,
        line_items: lineItems,
        success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/store?cancelled=1`,
        metadata: { book_order_id: order.id, package_slug: pkg.slug },
        payment_intent_data: { metadata: { book_order_id: order.id } },
      });
    } catch (e) {
      // Stripe failed -> the order is unreachable (no session id). Cancel it
      // so it never becomes a dangling pending_payment row.
      log("Stripe session create failed, cancelling order", {
        orderId: order.id,
        error: e instanceof Error ? e.message : String(e),
      });
      await admin
        .from("book_orders")
        .update({ status: "cancelled" })
        .eq("id", order.id)
        .eq("status", "pending_payment");
      return new Response(JSON.stringify({ error: "Could not start checkout" }), {
        status: 502, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Persist stripe_session_id BEFORE returning. Required by the webhook
    // and verify-book-order to match the session against the right order.
    const { error: linkErr, data: linked } = await admin
      .from("book_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id)
      .eq("status", "pending_payment")
      .is("stripe_session_id", null)
      .select("id");

    if (linkErr || !linked || linked.length === 0) {
      // Couldn't attach the session id. Expire the Stripe session and
      // cancel the order so we never leave the system in a half-paid state.
      log("Failed to persist stripe_session_id, rolling back", {
        orderId: order.id,
        sessionId: session.id,
        error: linkErr?.message,
      });
      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch (e) {
        log("Failed to expire orphan session", { error: String(e) });
      }
      await admin
        .from("book_orders")
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
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
