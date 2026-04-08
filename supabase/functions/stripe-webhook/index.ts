import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

// Product ID → access tier mapping
const PRODUCT_TIER_MAP: Record<string, string> = {
  "prod_UFpARkX0OxZg51": "subscriber",
  "prod_UGHVIcGfn5LEoU": "cohort",
  "prod_UGHWgMWBPbxXjH": "premium",
  "prod_UGHpmJnJVVhIef": "premium",
  "prod_UGHqGWOM8Iqo3K": "premium",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    if (webhookSecret && sig) {
      // Verify webhook signature when secret is configured
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      logStep("Webhook signature verified", { type: event.type });
    } else {
      // Fallback: parse without signature verification (dev mode)
      event = JSON.parse(body) as Stripe.Event;
      logStep("Webhook received (no signature verification)", { type: event.type });
    }

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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get user ID from metadata
      const userId = session.metadata?.supabase_user_id;
      if (!userId) {
        logStep("No supabase_user_id in metadata, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Retrieve line items to get the product ID
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
      const priceData = lineItems.data[0]?.price;
      const productId = priceData?.product as string;

      if (!productId) {
        logStep("No product ID found in line items");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
