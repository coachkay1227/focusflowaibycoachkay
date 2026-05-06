import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.23.8";
import { getCorsHeaders } from "../_shared/cors.ts";

const Body = z.object({ session_id: z.string().min(1) });

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

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (session.payment_status === "paid") {
      await admin
        .from("book_orders")
        .update({
          status: "paid",
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        })
        .eq("stripe_session_id", session.id)
        .eq("status", "pending_payment");
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
