/** Centralized Stripe product/price configuration for all edge functions */

export const PRODUCT_TIER_MAP: Record<string, string> = {
  "prod_UFpARkX0OxZg51": "subscriber",
  "prod_UGHVIcGfn5LEoU": "cohort",
  "prod_UGHWgMWBPbxXjH": "premium",
  "prod_UGHpmJnJVVhIef": "premium",
  "prod_UGHqGWOM8Iqo3K": "premium",
};

export const PRICE_MODE_MAP: Record<string, "subscription" | "payment"> = {
  "price_1THJVvBReje0oFcLhkxCXesA": "subscription", // Subscriber $27/mo
  "price_1THkwQBReje0oFcL8i3WGwS0": "payment",      // 8-Week Cohort $997
  "price_1THkx7BReje0oFcLRrF38PA8": "payment",      // 30-Day F.O.C.U.S. $297
  "price_1THlFpBReje0oFcLuNY16veh": "payment",      // 30-Day Intensive $497
  "price_1THlGgBReje0oFcLu5PGmZih": "payment",      // 12-Week Mastery $1997
};

export const PROTECTED_TIERS = ["cohort", "premium", "corporate"];
