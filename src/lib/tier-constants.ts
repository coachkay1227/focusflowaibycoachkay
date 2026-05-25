import type { AccessTier } from "@/hooks/use-access-level";

export const TIER_RANK: Record<AccessTier, number> = {
  free: 0,
  subscriber: 1,
  cohort: 2,
  premium: 3,
  rent_agent: 4,
  corporate: 5,
};

export const TIER_LABELS: Record<AccessTier, string> = {
  free: "Free",
  subscriber: "Subscriber",
  cohort: "Cohort Member",
  premium: "Premium",
  rent_agent: "Rent-an-Agent",
  corporate: "Corporate",
};
