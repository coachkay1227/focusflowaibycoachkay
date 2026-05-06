import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.23.8";
import { getCorsHeaders } from "../_shared/cors.ts";

const Body = z.object({ session_id: z.string().min(1).max(255) });

const log = (step: string, details?: Record<string, unknown>) => {
  console.log(`[VERIFY-BOOK-ORDER] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const cors = getCorsHeaders(req);
  try {
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const session = await stripe.checkout.sessions.retrieve(parsed.data.session_id);

    // Sanity: session must look like a Checkout Session and be in payment mode.
    if (!session || typeof session.id !== "string" || session.object !== "checkout.session") {
      log("Malformed session payload");
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (session.mode !== "payment") {
      log("Unexpected session mode", { mode: session.mode });
      return new Response(JSON.stringify({ error: "Invalid session mode" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Look up the pending order BEFORE we trust the session, so we can
    // cross-check ownership (book_order_id metadata) and amount.
    const { data: existing, error: lookupErr } = await admin
      .from("book_orders")
      .select("id, package_name, order_total, client_email, status, stripe_session_id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    if (lookupErr) {
      log("Order lookup failed", { error: lookupErr.message });
      return new Response(JSON.stringify({ error: "Lookup failed" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (!existing) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Validate session is fully paid AND complete, with metadata pointing
    // at this exact order, and an amount that matches what we expect.
    const isPaid = session.payment_status === "paid";
    const isComplete = session.status === "complete";
    const metaOrderId = typeof session.metadata?.book_order_id === "string"
      ? session.metadata.book_order_id
      : null;
    const metaMatches = metaOrderId === existing.id;
    const amountTotal = typeof session.amount_total === "number" ? session.amount_total : null;
    const amountMatches = amountTotal !== null && amountTotal === existing.order_total;

    if (isPaid && isComplete && metaMatches && amountMatches) {
      const pi = typeof session.payment_intent === "string" ? session.payment_intent : null;
      const { error: updErr } = await admin
        .from("book_orders")
        .update({ status: "paid", stripe_payment_intent_id: pi })
        .eq("id", existing.id)
        .eq("stripe_session_id", session.id)
        .eq("status", "pending_payment");
      if (updErr) {
        log("Failed to mark order paid", { error: updErr.message, orderId: existing.id });
      } else {
        log("Order marked paid", { orderId: existing.id });
      }
    } else {
      log("Session not eligible to mark order paid", {
        isPaid,
        isComplete,
        metaMatches,
        amountMatches,
        sessionStatus: session.status,
        paymentStatus: session.payment_status,
      });
    }

    const { data: order } = await admin
      .from("book_orders")
      .select("package_name, order_total, client_email, status")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(order), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
