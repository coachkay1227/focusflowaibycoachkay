/** Centralized Stripe product/price configuration for all edge functions.
 *  Entries fall into 3 buckets:
 *    1. LEGACY public SKUs (8-Week Cohort, 30-Day F.O.C.U.S., etc.) —
 *       no longer sold publicly; kept for historical customers / portal.
 *    2. Active Rent-an-Agent subscriptions — current public SKUs that
 *       grant the `premium` access tier when paid.
 *    3. One-time payments (AI Business Audit, Strategy Intensive) —
 *       recorded in `orders` but do NOT change tier. Listed in
 *       NO_TIER_PRODUCTS so the webhook short-circuits without alerting. */

export const PRODUCT_TIER_MAP: Record<string, string> = {
  "prod_UFpARkX0OxZg51": "subscriber",
  "prod_UGHVIcGfn5LEoU": "cohort",
  "prod_UGHWgMWBPbxXjH": "premium",
  "prod_UGHpmJnJVVhIef": "premium",
  "prod_UGHqGWOM8Iqo3K": "premium",
  // Rent-an-Agent — Founding + Standard, Starter → Dream Team (all grant `premium`)
  "prod_UI3bHaM3iNOTJd": "rent_agent", // Starter Founding $297/mo
  "prod_UI3bn3UaV9XD4q": "rent_agent", // Starter Standard $497/mo
  "prod_UI3bhmlY2kgDcK": "rent_agent", // Pro/Growth Founding $697/mo
  "prod_UI3bH83UkOhFdF": "rent_agent", // Pro/Growth Standard $997/mo
  "prod_UI3bP0P7W0fAiZ": "rent_agent", // Dream Team Founding $997/mo
  "prod_UI3beYm5zLDjDR": "rent_agent", // Dream Team Standard $1497/mo
  // Transformation Paths — 30-Day Resets ($297 / $497 / $997)
  "prod_UaLGufK6Jr2ZU4": "reset_30",        // 30-Day Personal Reset
  "prod_UaLNmsGwE80NHa": "reset_30",        // 30-Day Business Reset
  "prod_UaLOQV9Neov5n6": "reset_30",        // 30-Day AI Reset
  // Transformation Paths — 90-Day Transformations ($997 / $1,497 / $2,497)
  "prod_UaLOmPz5zLmgvD": "transformation_90", // 90-Day Personal Transformation
  "prod_UaLPfozQYtxwSa": "transformation_90", // 90-Day Business Transformation
  "prod_UaLPqrSWcHVi9f": "transformation_90", // 90-Day Full AI Transformation
};

/** One-time purchase products that do NOT change the buyer's access tier.
 *  Listed here so the webhook can short-circuit without firing an
 *  "unknown_product" alert. */
export const NO_TIER_PRODUCTS = new Set<string>([
  "prod_U91GXGNgo01tYp", // AI Business Audit $47
  "prod_UaEUk39aCG5Jmh", // AI Strategy Intensive $497
]);

export const PRICE_MODE_MAP: Record<string, "subscription" | "payment"> = {
  "price_1THJVvBReje0oFcLhkxCXesA": "subscription", // Subscriber $27/mo
  "price_1THkwQBReje0oFcL8i3WGwS0": "payment",      // 8-Week Cohort $997
  "price_1THkx7BReje0oFcLRrF38PA8": "payment",      // 30-Day F.O.C.U.S. $297
  "price_1THlFpBReje0oFcLuNY16veh": "payment",      // 30-Day Intensive $497
  "price_1THlGgBReje0oFcLu5PGmZih": "payment",      // 12-Week Mastery $1997
  // Rent-an-Agent recurring
  "price_1Tb3ZzBReje0oFcLQFSaEnr4": "subscription", // Starter Founding $297/mo
  "price_1Tb3bHBReje0oFcLkVgjsUl0": "subscription", // Starter Standard $497/mo
  "price_1Tb3blBReje0oFcLw6tk3kcg": "subscription", // Pro/Growth Founding $697/mo
  "price_1Tb3c4BReje0oFcLInI8JGZv": "subscription", // Pro/Growth Standard $997/mo
  "price_1Tb3wwBReje0oFcLLlE6CDGO": "subscription", // Dream Team Founding $997/mo
  "price_1Tb40yBReje0oFcLIciRVQSD": "subscription", // Dream Team Standard $1497/mo
  // One-time entry offers
  "price_1Tb41PBReje0oFcLMlvzjQQa": "payment",      // AI Business Audit $47
  "price_1Tb41vBReje0oFcLjxGozG2X": "payment",      // AI Strategy Intensive $497
  // Transformation Paths — 30-Day Resets
  "price_1TbAaPBReje0oFcLts5JuE5a": "payment", // 30-Day Personal Reset $297
  "price_1TbAguBReje0oFcL3Qh5pIiH": "payment", // 30-Day Business Reset $497
  "price_1TbAhOBReje0oFcL87MVrKFy": "payment", // 30-Day AI Reset $997
  // Transformation Paths — 90-Day Transformations
  "price_1TbAhtBReje0oFcLscEqWHEK": "payment", // 90-Day Personal Transformation $997
  "price_1TbAiNBReje0oFcLrit7Ko5x": "payment", // 90-Day Business Transformation $1,497
  "price_1TbAimBReje0oFcL4Uti8udD": "payment", // 90-Day Full AI Transformation $2,497
};

export const PROTECTED_TIERS = ["reset_30", "transformation_90", "cohort", "premium", "rent_agent", "corporate"];

/** Welcome-email template + program label for transformation-path purchases.
 *  Used by stripe-webhook to fire the right welcome email after checkout. */
export const TRANSFORMATION_PROGRAM_MAP: Record<string, { template: "reset-welcome" | "transformation-welcome"; programName: string; durationDays: number }> = {
  "prod_UaLGufK6Jr2ZU4": { template: "reset-welcome",          programName: "30-Day Personal Reset",            durationDays: 30 },
  "prod_UaLNmsGwE80NHa": { template: "reset-welcome",          programName: "30-Day Business Reset",            durationDays: 30 },
  "prod_UaLOQV9Neov5n6": { template: "reset-welcome",          programName: "30-Day AI Reset",                  durationDays: 30 },
  "prod_UaLOmPz5zLmgvD": { template: "transformation-welcome", programName: "90-Day Personal Transformation",   durationDays: 90 },
  "prod_UaLPfozQYtxwSa": { template: "transformation-welcome", programName: "90-Day Business Transformation",   durationDays: 90 },
  "prod_UaLPqrSWcHVi9f": { template: "transformation-welcome", programName: "90-Day Full AI Transformation",    durationDays: 90 },
};
