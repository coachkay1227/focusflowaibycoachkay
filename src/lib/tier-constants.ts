import type { AccessTier } from "@/hooks/use-access-level";

export const TIER_RANK: Record<AccessTier, number> = {
  free: 0,
  subscriber: 1,
  cohort: 2,
  premium: 3,
  corporate: 4,
};

export const TIER_LABELS: Record<AccessTier, string> = {
  free: "Free",
  subscriber: "Subscriber",
  cohort: "Cohort Member",
  premium: "Premium",
  corporate: "Corporate",
};
