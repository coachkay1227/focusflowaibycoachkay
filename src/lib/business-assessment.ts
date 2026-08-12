export type BusinessBucket = "CLARITY" | "FOCUS" | "UPLEVEL" | "OWNERSHIP";
export type BusinessPathKey = "clarity" | "reset30" | "uplevel60" | "rentAgent" | "advisory";

export interface BusinessPath {
  name: string;
  tagline: string;
  route: string;
  ctaLabel: string;
}

export interface BusinessAssessmentResult {
  mind: string;
  action: string;
  character: string;
  code: string;
  primaryBucket: BusinessBucket;
  secondaryBucket: BusinessBucket;
  primaryPath: BusinessPathKey;
  alternatePaths: BusinessPathKey[];
}

export const BUSINESS_BUCKET_ORDER: BusinessBucket[] = [
  "CLARITY",
  "FOCUS",
  "UPLEVEL",
  "OWNERSHIP",
];

export const BUSINESS_PATHS: Record<BusinessPathKey, BusinessPath> = {
  clarity: {
    name: "Free Clarity Check",
    tagline: "One question. Sharper than a week of journaling. Free.",
    route: "/clarity",
    ctaLabel: "Start the Clarity Check",
  },
  reset30: {
    name: "30-Day Business Reset",
    tagline: "Cohort. 30 days. You ship what you've been stalling on.",
    route: "/programs/30-day-business-reset",
    ctaLabel: "Apply for the Reset",
  },
  uplevel60: {
    name: "Uplevel 60 · 1:1 with Coach Kay",
    tagline: "60 days, direct line, custom build. For operators ready to be seen.",
    route: "/advisory",
    ctaLabel: "See Advisory options",
  },
  rentAgent: {
    name: "Rent-an-Agent",
    tagline: "Borrow a fractional operator. Plug the leaks. Keep the receipts.",
    route: "/rent-an-agent",
    ctaLabel: "Explore Rent-an-Agent",
  },
  advisory: {
    name: "Advisory",
    tagline: "Quarterly advisory for founders running real revenue.",
    route: "/advisory",
    ctaLabel: "See Advisory",
  },
};

export const BUSINESS_BUCKET_PATHS: Record<
  BusinessBucket,
  { primary: BusinessPathKey; alternates: BusinessPathKey[] }
> = {
  CLARITY: { primary: "clarity", alternates: ["reset30", "uplevel60"] },
  FOCUS: { primary: "reset30", alternates: ["clarity", "uplevel60"] },
  UPLEVEL: { primary: "uplevel60", alternates: ["reset30", "advisory"] },
  OWNERSHIP: { primary: "rentAgent", alternates: ["advisory", "reset30"] },
};

const OPERATOR_VALUES = {
  op_mind: ["A", "V", "S", "E"],
  op_action: ["B", "M", "R", "C"],
  op_char: ["N", "T", "G", "P"],
} as const;

const BOTTLENECK_IDS = ["bn_friction", "bn_break", "bn_avoid"] as const;

function requireAllowed(
  answers: Record<string, string>,
  id: string,
  allowed: readonly string[],
): string {
  const value = answers[id];
  if (!value || !allowed.includes(value)) {
    throw new Error(`Missing or invalid assessment answer: ${id}`);
  }
  return value;
}

/**
 * Compute the public six-question Operator × Bottleneck result.
 *
 * Ties are deliberately stable and resolve in F.O.C.U.S. order:
 * Clarity, Focus, Uplevel, then Ownership. That rule is part of the product,
 * not an incidental Array.sort side effect.
 */
export function computeBusinessAssessment(
  answers: Record<string, string>,
): BusinessAssessmentResult {
  const mind = requireAllowed(answers, "op_mind", OPERATOR_VALUES.op_mind);
  const action = requireAllowed(answers, "op_action", OPERATOR_VALUES.op_action);
  const character = requireAllowed(answers, "op_char", OPERATOR_VALUES.op_char);

  const counts = Object.fromEntries(
    BUSINESS_BUCKET_ORDER.map((bucket) => [bucket, 0]),
  ) as Record<BusinessBucket, number>;

  for (const id of BOTTLENECK_IDS) {
    const bucket = requireAllowed(answers, id, BUSINESS_BUCKET_ORDER) as BusinessBucket;
    counts[bucket] += 1;
  }

  const ranked = [...BUSINESS_BUCKET_ORDER].sort((a, b) => {
    const byScore = counts[b] - counts[a];
    return byScore || BUSINESS_BUCKET_ORDER.indexOf(a) - BUSINESS_BUCKET_ORDER.indexOf(b);
  });
  const primaryBucket = ranked[0];
  const secondaryBucket = ranked[1];
  const path = BUSINESS_BUCKET_PATHS[primaryBucket];

  return {
    mind,
    action,
    character,
    code: `${mind}-${action}-${character}`,
    primaryBucket,
    secondaryBucket,
    primaryPath: path.primary,
    alternatePaths: [...path.alternates],
  };
}
