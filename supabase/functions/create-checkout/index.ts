import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { PRICE_MODE_MAP } from "../_shared/stripe-config.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[CREATE-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    logStep("Function started");

    // Auth is now optional — attempt to get user if token provided
    let userEmail: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        if (data?.user?.email) {
          userEmail = data.user.email;
          logStep("User authenticated", { email: userEmail });
        }
      } catch (_e) {
        // Auth failed — proceed as guest, Stripe will collect email
        logStep("Auth skipped — proceeding as guest");
      }
    } else {
      logStep("No auth header — proceeding as guest");
    }

    const { priceId, successPath, cancelPath, customerEmail } = await req.json();
    if (!priceId) throw new Error("priceId is required");

    // Use authenticated email, or email passed from body, or let Stripe collect it
    const emailToUse = userEmail || customerEmail || null;

    // Restrict redirect targets to same-origin internal paths. Allows
    // percent-encoded query strings and common URL-safe punctuation so
    // callers can pass human-readable context (e.g. ?tier=...).
    const safePath = (p: unknown, fallback: string): string =>
      typeof p === "string" && /^\/[A-Za-z0-9\-\/\_.():~]+$/.test(p) ? p : fallback;
    const rawSuccess = safePath(successPath, "/dashboard?checkout=success");
    // Ensure Stripe substitutes its session id into the redirect so the
    // success page can verify/inspect the order. Preserve any existing
    // query string with `&`, otherwise start one with `?`.
    const successWithSession = rawSuccess.includes("session_id=")
      ? rawSuccess
      : `${rawSuccess}${rawSuccess.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;
    const successUrl = `${req.headers.get("origin")}${successWithSession}`;
    const cancelUrl = `${req.headers.get("origin")}${safePath(cancelPath, "/modules?checkout=cancelled")}`;

    // Validate priceId against known prices
    const mode = PRICE_MODE_MAP[priceId];
    if (!mode) {
      throw new Error(`Invalid priceId: ${priceId}. Not a recognized product price.`);
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe secret key not configured");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    logStep("Creating Stripe session", { priceId, emailToUse });

    // Check for existing Stripe customer by email
    let customerId: string | undefined;
    if (emailToUse) {
      const existingCustomers = await stripe.customers.list({ email: emailToUse, limit: 1 });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
        logStep("Found existing customer", { customerId });
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : emailToUse || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        price_id: priceId,
        user_email: emailToUse || "guest",
      },
      allow_promotion_codes: true,
    });

    logStep("Checkout session created", { sessionId: session.id });
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
