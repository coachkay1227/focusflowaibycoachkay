import type { AccessTier } from "@/hooks/use-access-level";

export const TIER_RANK: Record<AccessTier, number> = {
  free: 0,
  subscriber: 1,
  reset_30: 2,
  transformation_90: 3,
  cohort: 4,
  premium: 5,
  rent_agent: 6,
  corporate: 7,
};

export const TIER_LABELS: Record<AccessTier, string> = {
  free: "Free",
  subscriber: "Subscriber",
  reset_30: "30-Day Reset",
  transformation_90: "90-Day Transformation",
  cohort: "Cohort Member",
  premium: "Premium",
  rent_agent: "Rent-an-Agent",
  corporate: "Corporate",
};
