import { supabase } from "@/integrations/supabase/client";
import { trackCheckoutStart } from "@/lib/gtag";

export const PENDING_CHECKOUT_KEY = "pending_checkout_price";

/** Kick off a Stripe Checkout session for a transformation-path price.
 *  Throws if the edge function fails or returns no URL. */
export async function startProgramCheckout(
  priceId: string,
  opts: { title: string; price: number; successPath?: string; cancelPath?: string },
): Promise<void> {
  trackCheckoutStart(opts.title, opts.price);
  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: {
      priceId,
      successPath: opts.successPath ?? "/dashboard?welcome=program",
      cancelPath: opts.cancelPath ?? "/modules",
    },
  });
  if (error) throw error;
  const url = (data as { url?: string } | null)?.url;
  if (!url) throw new Error("No checkout URL returned");
  window.location.href = url;
}