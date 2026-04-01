import type { AccessTier } from "@/hooks/use-access-level";

export interface TierConfig {
  price_id: string;
  product_id: string;
  name: string;
  price: number; // in dollars
  interval: "month";
}

export const STRIPE_TIERS: Partial<Record<AccessTier, TierConfig>> = {
  subscriber: {
    price_id: "price_1THJVvBReje0oFcLhkxCXesA",
    product_id: "prod_UFpARkX0OxZg51",
    name: "Subscriber",
    price: 27,
    interval: "month",
  },
};

/** Map a Stripe product ID back to an access tier */
export function productIdToTier(productId: string): AccessTier {
  for (const [tier, config] of Object.entries(STRIPE_TIERS)) {
    if (config?.product_id === productId) return tier as AccessTier;
  }
  return "free";
}
