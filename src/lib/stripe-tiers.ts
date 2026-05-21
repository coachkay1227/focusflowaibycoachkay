import type { AccessTier } from "@/hooks/use-access-level";

export interface TierConfig {
  price_id: string;
  product_id: string;
  name: string;
  price: number; // in dollars
  interval: "month" | "one_time";
}

export const STRIPE_TIERS: Partial<Record<AccessTier, TierConfig[]>> = {
  subscriber: [
    {
      price_id: "price_1THJVvBReje0oFcLhkxCXesA",
      product_id: "prod_UFpARkX0OxZg51",
      name: "Subscriber",
      price: 27,
      interval: "month",
    },
  ],
  // LEGACY — these price IDs are NOT sold publicly anymore. They remain
  // in Stripe and in this map so historical customers, webhook idempotency,
  // and the customer portal continue to work. The new public offers
  // (30-/90-Day Resets + 6-Month Partnership) route through ApplyNowDialog.
  cohort: [
    {
      price_id: "price_1THkwQBReje0oFcL8i3WGwS0",
      product_id: "prod_UGHVIcGfn5LEoU",
      name: "8-Week Life Transformation Cohort (legacy)",
      price: 997,
      interval: "one_time",
    },
  ],
  premium: [
    {
      price_id: "price_1THkx7BReje0oFcLRrF38PA8",
      product_id: "prod_UGHWgMWBPbxXjH",
      name: "30-Day F.O.C.U.S. Reset (legacy)",
      price: 297,
      interval: "one_time",
    },
    {
      price_id: "price_1THlFpBReje0oFcLuNY16veh",
      product_id: "prod_UGHpmJnJVVhIef",
      name: "30-Day Intensive (legacy)",
      price: 497,
      interval: "one_time",
    },
    {
      price_id: "price_1THlGgBReje0oFcLu5PGmZih",
      product_id: "prod_UGHqGWOM8Iqo3K",
      name: "12-Week Mastery Program (legacy)",
      price: 1997,
      interval: "one_time",
    },
  ],
};

/** All product IDs mapped to their tier */
const PRODUCT_TIER_MAP: Record<string, AccessTier> = {};
for (const [tier, configs] of Object.entries(STRIPE_TIERS)) {
  for (const config of configs ?? []) {
    PRODUCT_TIER_MAP[config.product_id] = tier as AccessTier;
  }
}

/** Map a Stripe product ID back to an access tier */
export function productIdToTier(productId: string): AccessTier {
  return PRODUCT_TIER_MAP[productId] ?? "free";
}

/** Find the price config for a given price ID */
export function findPriceConfig(priceId: string): (TierConfig & { tier: AccessTier }) | null {
  for (const [tier, configs] of Object.entries(STRIPE_TIERS)) {
    for (const config of configs ?? []) {
      if (config.price_id === priceId) return { ...config, tier: tier as AccessTier };
    }
  }
  return null;
}
