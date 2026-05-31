import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { PRODUCT_TIER_MAP, PROTECTED_TIERS, NO_TIER_PRODUCTS } from "../_shared/stripe-config.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[CHECK-SUBSCRIPTION] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check current tier in DB
    const { data: accessRow } = await supabaseClient
      .from("user_access_levels")
      .select("tier")
      .eq("id", user.id)
      .maybeSingle();

    const currentTier = accessRow?.tier ?? "free";
    logStep("Current tier", { currentTier });

    // Protected tiers are never overwritten by Stripe polling
    if (PROTECTED_TIERS.includes(currentTier)) {
      logStep("Protected tier — skipping Stripe check", { currentTier });
      return new Response(
        JSON.stringify({ subscribed: false, product_id: null, subscription_end: null, tier: currentTier }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 200 }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // 1. Check active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let productId: string | null = null;
    let subscriptionEnd: string | null = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      productId = subscription.items.data[0].price.product as string;
      logStep("Active subscription found", { productId, subscriptionEnd });

      // Care-plan / no-tier subscriptions (Site Care, Collective Membership,
      // Agent Care, Monthly Build Credits) must NOT change access tier.
      if (NO_TIER_PRODUCTS.has(productId)) {
        logStep("Active sub is NO_TIER product — preserving current tier", { productId, currentTier });
      } else {
        const tier = PRODUCT_TIER_MAP[productId] || "subscriber";
        await supabaseClient
          .from("user_access_levels")
          .upsert({ id: user.id, tier }, { onConflict: "id" });
        logStep("Tier synced from subscription", { tier });
      }
    } else {
      // 2. Check completed one-time checkout sessions
      const sessions = await stripe.checkout.sessions.list({
        customer: customerId,
        status: "complete",
        limit: 25,
      });

      // Iterate paid one-time sessions and pick the first whose product is in
      // PRODUCT_TIER_MAP — skips no-tier purchases (audit/book/autism) that
      // would otherwise mask a real transformation_90 / reset_30 upgrade.
      const paidOneTimes = sessions.data.filter(
        (s: { mode: string; payment_status: string }) => s.mode === "payment" && s.payment_status === "paid"
      );

      let upgraded = false;
      for (const s of paidOneTimes) {
        const lineItems = await stripe.checkout.sessions.listLineItems(s.id, { limit: 1 });
        const oneTimeProductId = lineItems.data[0]?.price?.product as string | undefined;
        if (oneTimeProductId && PRODUCT_TIER_MAP[oneTimeProductId]) {
          const tier = PRODUCT_TIER_MAP[oneTimeProductId];
          productId = oneTimeProductId;
          logStep("Tier-bearing one-time purchase found", { productId, tier });
          await supabaseClient
            .from("user_access_levels")
            .upsert({ id: user.id, tier }, { onConflict: "id" });
          upgraded = true;
          break;
        }
      }

      if (!upgraded && currentTier === "subscriber") {
        logStep("Stripe sub lapsed — downgrading subscriber to free");
        await supabaseClient
          .from("user_access_levels")
          .upsert({ id: user.id, tier: "free" }, { onConflict: "id" });
      } else if (!upgraded) {
        logStep("No active subscription — preserving existing tier", { currentTier });
      }
    }

    return new Response(
      JSON.stringify({
        subscribed: hasActiveSub,
        product_id: productId,
        subscription_end: subscriptionEnd,
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
