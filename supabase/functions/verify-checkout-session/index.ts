// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

/** Single source of truth for the post-checkout screen.
 *  Reads the real Stripe payment_status and checks whether fulfillment
 *  actually landed in the database, so the UI can never claim success
 *  before the backend finished. Public — the Stripe session id is the
 *  capability and nothing sensitive is returned. */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });

  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body.session_id === "string" ? body.session_id : "";
    if (!sessionId.startsWith("cs_") || sessionId.length > 200) {
      return json({ error: "invalid session_id" }, 400);
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Internal server error" }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (_e) {
      return json({ state: "unknown", reason: "session_not_found" });
    }

    const settled = session.payment_status === "paid" ||
      session.payment_status === "no_payment_required";

    if (!settled) {
      return json({
        state: session.status === "expired" ? "expired" : "unpaid",
        payment_status: session.payment_status,
        session_status: session.status,
      });
    }

    // Payment is settled. Now confirm the backend actually fulfilled it.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const lookups: Array<{ table: string; label: string }> = [
      { table: "business_audits", label: "AI Business Audit" },
      { table: "one_time_orders", label: "Order" },
      { table: "agent_orders", label: "Agent Build" },
      { table: "book_orders", label: "Book Order" },
      { table: "autism_orders", label: "Social Story Order" },
    ];

    let fulfilledIn: string | null = null;
    let recordId: string | null = null;
    for (const l of lookups) {
      const { data } = await supabase
        .from(l.table)
        .select("id")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();
      if (data?.id) {
        fulfilledIn = l.table;
        recordId = data.id as string;
        break;
      }
    }

    // Subscriptions fulfil by flipping the buyer's tier rather than writing
    // an order row, so treat a recorded webhook event as fulfillment there.
    let eventRecorded = false;
    if (!fulfilledIn) {
      const { data } = await supabase
        .from("processed_stripe_events")
        .select("event_id")
        .eq("event_type", "checkout.session.completed")
        .limit(1);
      eventRecorded = !!data?.length;
    }

    const fulfilled = !!fulfilledIn || (session.mode === "subscription" && eventRecorded);

    return json({
      state: fulfilled ? "confirmed" : "processing",
      payment_status: session.payment_status,
      mode: session.mode,
      amount_total: session.amount_total,
      // Pre-discount amount. The next-steps screen picks which call to offer
      // from this, not from amount_total, so a 100%-off coupon (e.g. the
      // internal FFTEST100 test) can't misclassify a real purchase as a $0 one.
      amount_subtotal: session.amount_subtotal,
      customer_email: session.customer_details?.email ?? session.customer_email ?? null,
      fulfilled_in: fulfilledIn,
      record_id: recordId,
    });
  } catch (_e) {
    return json({ error: "Internal server error" }, 500);
  }
});