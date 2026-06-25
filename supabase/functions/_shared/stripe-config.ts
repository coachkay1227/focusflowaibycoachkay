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
  // Collective AI Build Studio — Tier 1 one-time
  "prod_UanJnSjXkY95Jg", // Link-in-Bio Hub $297
  "prod_UanN2q8kUDOoMm", // Personal Brand Site $397
  "prod_UanR2vRsQWOP4W", // Conversion Landing Page $497
  "prod_UanRAhfgTRM9Sm", // Lead Magnet Funnel $697
  "prod_UanZLlOaOMmDSm", // AI Chatbot Widget Setup $797
  // Collective AI Build Studio — Tier 5 recurring care plans
  "prod_UanZVfj8EZtZBH", // Site Care $97/mo
  "prod_UaneP9ZBMIguZW", // Collective Membership $97/mo
  "prod_UanfvkxzOOZu5u", // Agent Care $197/mo
  "prod_UanfvQDmGtO89p", // Monthly Build Credits $497/mo
  // Agent Builder — one-time builds & add-ons (no tier change)
  "prod_Ul02HEGziK6vqv", // Custom GPT Agent
  "prod_Ul02esdwy10Ylm", // Claude Project Agent
  "prod_Ul02wVAYJg4pZ8", // Knowledge Base Add-on — Basic
  "prod_Ul02V28vWpeG2G", // Knowledge Base Add-on — Full
  "prod_Ul02SGrHmZUEvk", // Branded Agent Dashboard
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
  // Collective AI Build Studio — Tier 1 one-time
  "price_1Tbbj0BReje0oFcL4qqcndi2": "payment", // Link-in-Bio Hub $297
  "price_1Tbbn5BReje0oFcLV5aYSxdp": "payment", // Personal Brand Site $397
  "price_1TbbqcBReje0oFcLPvFHVSAJ": "payment", // Conversion Landing Page $497
  "price_1TbbqyBReje0oFcL2lbGJDQl": "payment", // Lead Magnet Funnel $697
  "price_1TbbxuBReje0oFcL07dnyiRf": "payment", // AI Chatbot Widget Setup $797
  // Collective AI Build Studio — Tier 5 recurring care plans
  "price_1TbbyIBReje0oFcL02mjIa6U": "subscription", // Site Care $97/mo
  "price_1Tbc2mBReje0oFcLKStT1NEj": "subscription", // Collective Membership $97/mo
  "price_1Tbc3yBReje0oFcLpQCYOLeJ": "subscription", // Agent Care $197/mo
  "price_1Tbc4SBReje0oFcLeEXu6hlp": "subscription", // Monthly Build Credits $497/mo
  // Agent Builder — Custom GPT Agent (prod_Ul02HEGziK6vqv)
  "price_1TlU2nBReje0oFcLXyZlrDc7": "payment",      // GPT Agent Single — Own $297
  "price_1TlU2qBReje0oFcL1ykOmyZG": "payment",      // GPT Agent Agency per-agent — Own $97
  "price_1TlU2tBReje0oFcLjITVAlvn": "subscription", // GPT Agent Single — Hosted $97/mo
  "price_1TlU2vBReje0oFcL7K1325Tt": "subscription", // GPT Agent Agency per-agent — Hosted $47/mo
  // Agent Builder — Claude Project Agent (prod_Ul02esdwy10Ylm)
  "price_1TlU2xBReje0oFcLrj3TE9U9": "payment",      // Claude Agent Single — Own $397
  "price_1TlU30BReje0oFcLctO6udK4": "payment",      // Claude Agent Additional — Own $247
  "price_1TlU33BReje0oFcLPQlyjg1w": "subscription", // Claude Agent — Hosted $147/mo
  // Agent Builder — Add-ons
  "price_1TlU35BReje0oFcLnf0wzqB9": "payment",      // Knowledge Base Basic $197
  "price_1TlU38BReje0oFcLftFZG8TE": "payment",      // Knowledge Base Full $397
  "price_1TlU3CBReje0oFcLXyUtcRfR": "payment",      // Branded Agent Dashboard $297
};

export const PROTECTED_TIERS = ["reset_30", "transformation_90", "cohort", "premium", "rent_agent", "corporate"];

/** Advisory / intensive products that fire a confirmation email + GHL event
 *  but do NOT change the buyer's access tier. */
export const ADVISORY_PRODUCTS = new Set<string>([
  "prod_UaEUk39aCG5Jmh", // AI Strategy Intensive $497
]);

/** Agent Builder products that create an agent_orders row + fire intake email.
 *  Add-on products (KB, dashboard) ride along with the main agent order. */
export const AGENT_BUILD_PRODUCTS = new Set<string>([
  "prod_Ul02HEGziK6vqv", // Custom GPT Agent
  "prod_Ul02esdwy10Ylm", // Claude Project Agent
]);

/** Collective AI Build Studio products (quick-win one-time + recurring care plans).
 *  Keyed by product ID → human-readable name for confirmation emails.
 *  All of these are in NO_TIER_PRODUCTS (no access-tier change); they need
 *  a post-purchase confirmation email + GHL event that the tier path never fires. */
export const BUILD_STUDIO_PRODUCTS: Record<string, string> = {
  // Tier 1 — one-time builds
  "prod_UanJnSjXkY95Jg": "Link-in-Bio Hub",
  "prod_UanN2q8kUDOoMm": "Personal Brand Site",
  "prod_UanR2vRsQWOP4W": "Conversion Landing Page",
  "prod_UanRAhfgTRM9Sm": "Lead Magnet Funnel",
  "prod_UanZLlOaOMmDSm": "AI Chatbot Widget Setup",
  // Tier 5 — recurring care plans
  "prod_UanZVfj8EZtZBH": "Site Care",
  "prod_UaneP9ZBMIguZW": "Collective Membership",
  "prod_UanfvkxzOOZu5u": "Agent Care",
  "prod_UanfvQDmGtO89p": "Monthly Build Credits",
};

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
