import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[CUSTOMER-PORTAL] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Primary: look up by auth email
    let stripeCustomer: { id: string } | null = null;
    const byEmail = await stripe.customers.list({ email: user.email, limit: 1 });
    if (byEmail.data.length > 0) {
      stripeCustomer = byEmail.data[0];
      logStep("Found customer by email", { customerId: stripeCustomer.id });
    } else {
      // Fallback: search by supabase_user_id metadata (set on all new checkouts)
      try {
        const byMeta = await stripe.customers.search({
          query: `metadata['supabase_user_id']:'${user.id}'`,
          limit: 1,
        });
        if (byMeta.data.length > 0) {
          stripeCustomer = byMeta.data[0];
          logStep("Found customer by metadata fallback", { customerId: stripeCustomer.id });
        }
      } catch (_e) {
        // search API not available — fall through to error
      }
    }

    if (!stripeCustomer) {
      throw new Error("No Stripe customer found for this user");
    }

    const customerId = stripeCustomer.id;
    logStep("Found customer", { customerId });

    const origin = req.headers.get("origin") || "https://coachkayai.life";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });

    logStep("Portal session created", { url: portalSession.url });

    return new Response(JSON.stringify({ url: portalSession.url }), {
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
