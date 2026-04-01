export type FocusPillar = "F" | "O" | "C" | "U" | "S";
export type AccessTier = "free" | "subscriber" | "cohort" | "premium" | "corporate";

export interface Program {
  id: string;
  title: string;
  slug: string;
  pillar: FocusPillar;
  category: "assessment" | "module" | "challenge" | "subscription" | "program" | "cohort" | "enterprise" | "grant";
  duration: number;
  durationLabel: string;
  description: string;
  coachNote: string;
  accessTier: AccessTier;
  price: number;
  paymentPlan?: string;
  tags: string[];
  audience: string;
  isGated: boolean;
  isFeatured: boolean;
}

export const PILLAR_META: Record<FocusPillar, { label: string; full: string; color: string }> = {
  F: { label: "F", full: "Find", color: "hsl(43 75% 52%)" },
  O: { label: "O", full: "Own", color: "hsl(25 80% 55%)" },
  C: { label: "C", full: "Clarify", color: "hsl(200 70% 55%)" },
  U: { label: "U", full: "Unlock", color: "hsl(280 60% 60%)" },
  S: { label: "S", full: "Sustain", color: "hsl(150 55% 45%)" },
};

export const programs: Program[] = [
  // ── F · Find ──────────────────────────────────────────
  {
    id: "clarity-check",
    title: "Clarity Check",
    slug: "clarity-check",
    pillar: "F",
    category: "assessment",
    duration: 0,
    durationLabel: "5 min",
    description: "The foundational session. Cut through noise, identify your emotional state, surface your patterns, and get one clear next step.",
    coachNote: "This is where it all starts. No commitment — just honesty. I'll ask five questions and give you one truth you can act on today.",
    accessTier: "free",
    price: 0,
    tags: ["assessment", "starter", "self-awareness"],
    audience: "Anyone feeling stuck or foggy",
    isGated: false,
    isFeatured: true,
  },
  {
    id: "12-week-mastery",
    title: "12-Week Mastery Program",
    slug: "12-week-mastery",
    pillar: "F",
    category: "cohort",
    duration: 84,
    durationLabel: "12 weeks",
    description: "The ultimate deep-dive. Weekly AI coaching sessions, pattern tracking, and a personalised clarity roadmap built over 12 weeks.",
    coachNote: "This is for the person ready to do the real work. Twelve weeks to rebuild how you see yourself and move in the world.",
    accessTier: "premium",
    price: 199700,
    paymentPlan: "3-pay: $699 × 3",
    tags: ["deep-work", "transformation", "premium"],
    audience: "Committed self-leaders ready for lasting change",
    isGated: true,
    isFeatured: true,
  },

  // ── O · Own ───────────────────────────────────────────
  {
    id: "emotional-reset",
    title: "Emotional Reset",
    slug: "emotional-reset",
    pillar: "O",
    category: "module",
    duration: 0,
    durationLabel: "5 min",
    description: "When emotions are running high and you need to come back to center. Name it, feel it, release it.",
    coachNote: "You don't have to carry everything at once. Let's take five minutes to put something down.",
    accessTier: "free",
    price: 0,
    tags: ["emotional-intelligence", "reset", "self-regulation"],
    audience: "Anyone overwhelmed by emotions",
    isGated: false,
    isFeatured: false,
  },
  {
    id: "monthly-access",
    title: "Monthly Access",
    slug: "monthly-access",
    pillar: "O",
    category: "subscription",
    duration: 0,
    durationLabel: "Ongoing",
    description: "Unlimited access to all modules, weekly insights, coach chat, and community. Your clarity practice, on your schedule.",
    coachNote: "Think of this as your gym membership for inner clarity. Show up when you need to — I'll be here.",
    accessTier: "subscriber",
    price: 4700,
    tags: ["subscription", "unlimited", "community"],
    audience: "Self-improvers who want ongoing support",
    isGated: false,
    isFeatured: true,
  },
  {
    id: "corporate-shield-her",
    title: "Corporate Licensing — Shield Her",
    slug: "corporate-shield-her",
    pillar: "O",
    category: "enterprise",
    duration: 0,
    durationLabel: "Per seat / month",
    description: "Bring AI-powered clarity coaching to your organisation. Volume licensing for teams, ERGs, and wellness programs.",
    coachNote: "Clarity isn't just personal — it's organisational. Let's build emotionally intelligent teams, together.",
    accessTier: "corporate",
    price: 7500,
    tags: ["enterprise", "B2B", "team-wellness"],
    audience: "HR leaders, ERG sponsors, wellness directors",
    isGated: true,
    isFeatured: false,
  },

  // ── C · Clarify ───────────────────────────────────────
  {
    id: "focus-flow",
    title: "Focus Flow",
    slug: "focus-flow",
    pillar: "C",
    category: "module",
    duration: 0,
    durationLabel: "5 min",
    description: "When everything feels urgent and nothing feels clear. Identify what actually matters and eliminate the rest.",
    coachNote: "You don't need more time — you need fewer priorities. Let's find the one thing that moves everything else.",
    accessTier: "free",
    price: 0,
    tags: ["focus", "prioritisation", "productivity"],
    audience: "Overwhelmed achievers and multi-taskers",
    isGated: false,
    isFeatured: false,
  },
  {
    id: "30-day-focus-reset",
    title: "30-Day F.O.C.U.S. Reset",
    slug: "30-day-focus-reset",
    pillar: "C",
    category: "program",
    duration: 30,
    durationLabel: "30 days",
    description: "A structured month-long journey through each pillar of the F.O.C.U.S. framework. Daily prompts, weekly reviews, pattern reports.",
    coachNote: "Thirty days to rewire how you think. One pillar per week, plus a final integration week. You'll surprise yourself.",
    accessTier: "subscriber",
    price: 29700,
    tags: ["structured", "30-day", "framework"],
    audience: "Anyone ready for a focused reset",
    isGated: false,
    isFeatured: true,
  },
  {
    id: "grant-forward-focus",
    title: "Grant-Funded Reentry Access — Forward Focus",
    slug: "grant-forward-focus",
    pillar: "C",
    category: "grant",
    duration: 90,
    durationLabel: "90 days",
    description: "Free AI coaching access for justice-impacted individuals rebuilding their lives. Sponsored by community grants.",
    coachNote: "Everyone deserves clarity. This program removes barriers so you can focus on what's ahead, not what's behind.",
    accessTier: "free",
    price: 0,
    tags: ["grant", "reentry", "social-impact", "free"],
    audience: "Justice-impacted individuals seeking a fresh start",
    isGated: true,
    isFeatured: false,
  },

  // ── U · Unlock ────────────────────────────────────────
  {
    id: "purpose-happiness",
    title: "Purpose & Happiness",
    slug: "purpose-happiness",
    pillar: "U",
    category: "module",
    duration: 0,
    durationLabel: "6 min",
    description: "When you've achieved things but still feel empty. Reconnect with your deeper why and what actually brings you alive.",
    coachNote: "Success without fulfillment is the most common trap. Let's find what your soul is actually asking for.",
    accessTier: "subscriber",
    price: 0,
    tags: ["purpose", "fulfillment", "meaning"],
    audience: "High-achievers feeling hollow",
    isGated: false,
    isFeatured: false,
  },
  {
    id: "8-week-transformation",
    title: "8-Week AI Transformation",
    slug: "8-week-transformation",
    pillar: "U",
    category: "cohort",
    duration: 56,
    durationLabel: "8 weeks",
    description: "A guided cohort experience with AI coaching, peer accountability, and weekly group clarity sessions.",
    coachNote: "Transformation isn't a solo sport. This cohort gives you structure, community, and my undivided attention for eight weeks.",
    accessTier: "cohort",
    price: 99700,
    paymentPlan: "2-pay: $527 × 2",
    tags: ["cohort", "group", "accountability"],
    audience: "Growth-minded individuals who thrive in community",
    isGated: true,
    isFeatured: true,
  },

  // ── S · Sustain ───────────────────────────────────────
  {
    id: "goal-shift",
    title: "Goal Shift",
    slug: "goal-shift",
    pillar: "S",
    category: "module",
    duration: 0,
    durationLabel: "5 min",
    description: "When your goals don't feel right anymore. Separate what you truly want from what you think you should want.",
    coachNote: "Outgrowing goals isn't failure — it's evolution. Let's find the direction that actually fits who you're becoming.",
    accessTier: "subscriber",
    price: 0,
    tags: ["goals", "realignment", "transition"],
    audience: "Anyone at a crossroads or major life transition",
    isGated: false,
    isFeatured: false,
  },
  {
    id: "30-day-intensive",
    title: "30-Day Intensive",
    slug: "30-day-intensive",
    pillar: "S",
    category: "cohort",
    duration: 30,
    durationLabel: "30 days",
    description: "An intensive month of daily AI coaching with personalised pattern analysis, habit tracking, and clarity score monitoring.",
    coachNote: "This isn't casual — it's an investment in yourself. Thirty days of showing up, with me right beside you.",
    accessTier: "premium",
    price: 49700,
    tags: ["intensive", "daily", "habit-building"],
    audience: "Driven individuals ready for rapid growth",
    isGated: true,
    isFeatured: false,
  },
];

export function getProgramsByPillar(pillar: FocusPillar): Program[] {
  return programs.filter((p) => p.pillar === pillar);
}

export function getProgram(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}

export function getProgramBySlug(slug: string): Program | undefined {
  return programs.find((p) => p.slug === slug);
}
