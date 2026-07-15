import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getCorsHeaders } from "../_shared/cors.ts";

interface PriceStatus {
  id: string;
  found: boolean;
  active?: boolean;
  productId?: string;
  productName?: string;
  productActive?: boolean;
  unitAmount?: number | null;
  currency?: string;
  interval?: string | null;
  created?: number;
  expiresAt?: string | null;
  error?: string;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonError("Unauthorized", 401, corsHeaders);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return jsonError("Unauthorized", 401, corsHeaders);

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return jsonError("Forbidden", 403, corsHeaders);

    const body = await req.json().catch(() => ({}));
    const priceIds: string[] = Array.isArray(body?.priceIds)
      ? body.priceIds.filter((id: unknown): id is string => typeof id === "string" && id.startsWith("price_"))
      : [];
    if (priceIds.length === 0) return jsonError("priceIds required", 400, corsHeaders);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });

    // De-dupe, cap to 200 to bound cost.
    const unique = Array.from(new Set(priceIds)).slice(0, 200);

    const results: PriceStatus[] = await Promise.all(
      unique.map(async (id): Promise<PriceStatus> => {
        try {
          const price = await stripe.prices.retrieve(id, { expand: ["product"] });
          const product = typeof price.product === "object" ? price.product : null;
          const expiresRaw =
            (price.metadata?.expires_at as string | undefined) ||
            (product && "metadata" in product ? (product.metadata?.expires_at as string | undefined) : undefined);
          return {
            id,
            found: true,
            active: price.active,
            productId: product?.id,
            productName: product && "name" in product ? product.name ?? undefined : undefined,
            productActive: product && "active" in product ? product.active : undefined,
            unitAmount: price.unit_amount,
            currency: price.currency,
            interval: price.recurring?.interval ?? null,
            created: price.created,
            expiresAt: expiresRaw ?? null,
          };
        } catch (e) {
          return { id, found: false, error: (e as Error).message };
        }
      }),
    );

    return new Response(JSON.stringify({ prices: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("[list-payment-links-status]", e);
    return jsonError("Internal server error", 500, getCorsHeaders(req));
  }
});

function jsonError(message: string, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}