// ============================================================
// FocusFlow — Paid Offer Catalog (Rent-an-Agent + Advisory)
// Single source of truth for the new offer landing pages.
// Stripe price IDs live here so /rent-an-agent and /advisory
// can post them to create-checkout without re-encoding pricing.
// ============================================================

export interface RentAgentTier {
  key: "starter" | "pro" | "dream_team";
  name: string;
  tagline: string;
  founding: { price: number; priceDisplay: string; priceId: string };
  standard: { price: number; priceDisplay: string; priceId: string };
  features: string[];
  best_for: string;
  highlighted?: boolean;
}

export const RENT_AGENT_TIERS: RentAgentTier[] = [
  {
    key: "starter",
    name: "Starter",
    tagline: "Single agent for communication and task support.",
    founding: {
      price: 297,
      priceDisplay: "$297/mo",
      priceId: "price_1Tb3ZzBReje0oFcLQFSaEnr4",
    },
    standard: {
      price: 497,
      priceDisplay: "$497/mo",
      priceId: "price_1Tb3bHBReje0oFcLkVgjsUl0",
    },
    features: [
      "1 dedicated AI agent",
      "Inbox + DM triage",
      "Task & reminder routing",
      "Weekly summary digest",
      "Email + Slack support",
    ],
    best_for: "Solopreneurs & coaches who need a smart inbox + task hand-off.",
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "Multi-agent holistic business support.",
    founding: {
      price: 697,
      priceDisplay: "$697/mo",
      priceId: "price_1Tb3blBReje0oFcLw6tk3kcg",
    },
    standard: {
      price: 997,
      priceDisplay: "$997/mo",
      priceId: "price_1Tb3c4BReje0oFcLInI8JGZv",
    },
    features: [
      "Up to 3 specialized agents",
      "Sales, support & content workflows",
      "GHL / CRM connection",
      "Monthly strategy call",
      "Priority response queue",
    ],
    best_for: "Service businesses ready to remove repetitive ops work.",
    highlighted: true,
  },
  {
    key: "dream_team",
    name: "Dream Team",
    tagline: "High-touch multi-agent environment and strategy.",
    founding: {
      price: 997,
      priceDisplay: "$997/mo",
      priceId: "price_1Tb3wwBReje0oFcLLlE6CDGO",
    },
    standard: {
      price: 1497,
      priceDisplay: "$1,497/mo",
      priceId: "price_1Tb40yBReje0oFcLIciRVQSD",
    },
    features: [
      "Full agent squad (5+ roles)",
      "Custom workflow engineering",
      "Voice / LinkedIn / appointment automations",
      "Bi-weekly Coach Kay strategy calls",
      "Quarterly review + roadmap",
    ],
    best_for: "Established teams scaling without adding headcount.",
  },
];

export const RENT_AGENT_ENTERPRISE = {
  name: "Enterprise",
  tagline: "Custom enterprise support and dedicated routing.",
  priceFrom: 1997,
  priceDisplay: "from $1,997/mo (Founding) · $2,997/mo (Standard)",
  features: [
    "Custom-scoped agent fleet",
    "Dedicated success engineer",
    "SLA + compliance review",
    "Quarterly executive briefings",
  ],
  best_for: "Institutional buyers, workforce partners, and corporate ecosystems.",
};

/** AI Lead Engine tiers — inquiry-only until per-account GHL provisioning is automated. */
export const LEAD_ENGINE_TIERS = [
  {
    name: "Essentials",
    headline: "Stop guessing who to call. Get a weekly list of pre-qualified, intent-scored leads.",
    price: "$697/mo intro · $997/mo standard",
    setup: "+ $1,500 one-time setup",
    timeline: "Live in 7 days",
    bullets: [
      "Up to 500 enriched leads / month matched to your ICP",
      "Intent + fit scoring (0–100) with reasoning per lead",
      "Verified email + direct phone + LinkedIn URL per record",
      "Weekly CSV drop into HubSpot, GHL, or Pipedrive",
      "Monthly scoring tune-up call",
    ],
    best_for: "Founders doing outbound themselves who want a smarter list, not a bigger one.",
  },
  {
    name: "Pro",
    headline: "Replace your outbound SDR with a system that sends, follows up, and books.",
    price: "$1,997/mo",
    setup: "+ $2,500 one-time setup",
    timeline: "Live in 14 days",
    bullets: [
      "Everything in Essentials",
      "Dedicated GHL sub-account, fully provisioned + branded",
      "3-channel sequence: email + LinkedIn + SMS, 8-touch cadence",
      "AI-personalized first lines on every send",
      "Reply detection auto-routes meetings to your calendar",
      "Monthly performance review (open / reply / meeting rates)",
    ],
    best_for: "Operators with a clear ICP who need consistent pipeline without hiring.",
    highlighted: true,
  },
  {
    name: "Scale",
    headline: "Run a full outbound floor: voice, social, inbox, without headcount.",
    price: "$3,497/mo",
    setup: "+ $5,000 one-time setup",
    timeline: "Live in 21 days",
    bullets: [
      "Everything in Pro",
      "Voice AI agent: outbound dialer + inbound qualification (1,000 calls/mo included)",
      "LinkedIn automation with profile warming + connection sequencing",
      "Calendar-integrated auto-booking with reminder cadence",
      "Dedicated success engineer on a weekly call",
      "Custom dashboard: pipeline, attribution, cost-per-meeting",
    ],
    best_for: "Teams targeting 30+ booked meetings / month across channels.",
  },
] as const;

export const LEAD_ENGINE_ENTERPRISE = {
  name: "Lead Engine — Enterprise",
  headline: "Custom-built outbound infrastructure for multi-brand, multi-region, or regulated GTM.",
  priceDisplay: "By application",
  bullets: [
    "Custom-scoped agent fleet across channels",
    "Dedicated success engineer + solutions architect",
    "CRM / data-warehouse integration (Salesforce, HubSpot Enterprise, Snowflake)",
    "SLA + compliance review (SOC 2, GDPR, TCPA)",
    "Quarterly executive briefings on pipeline + system health",
  ],
  best_for: "Multi-brand operators, agencies, and regulated industries.",
} as const;

/** Low-ticket entry offers — direct Stripe Checkout (one-time payments). */
export const ENTRY_OFFERS = {
  audit: {
    name: "AI Business Audit",
    priceDisplay: "$47 one-time",
    price: 47,
    description:
      "Personalized AI readiness audit with a F.O.C.U.S. action plan, delivered in 5 minutes.",
    bullets: [
      "5-minute diagnostic across 12 vectors",
      "AI routing & tool recommendations",
      "Quick-win action list",
      "Delivered straight to your inbox",
    ],
  },
  intensive: {
    name: "AI Strategy Intensive",
    priceDisplay: "$497 / 90-min session",
    price: 497,
    priceId: "price_1Tb41vBReje0oFcLjxGozG2X",
    description:
      "90-minute 1-on-1 strategic mapping session with Coach Kay: AI implementation plan, decision tree, and 30-day execution roadmap.",
    bullets: [
      "Live 90-minute working session",
      "Custom AI implementation plan",
      "Decision tree for top 3 priorities",
      "30-day execution roadmap",
      "Recording + summary delivered",
    ],
  },
} as const;

/** High-ticket / scoped advisory lanes — inquiry-only. */
export const ADVISORY_LANES = [
  {
    key: "executive",
    name: "Executive Advisory",
    price: "$500/hr",
    description:
      "Structured executive advisory retainers for founders making consequential decisions about AI adoption, leadership, and growth strategy.",
    bullets: [
      "Monthly retainer or per-hour engagement",
      "Direct line to Coach Kay",
      "Decision frameworks + documentation",
    ],
  },
  {
    key: "speaking",
    name: "Speaking, Workshops & Team Trainings",
    price: "From $750",
    description:
      "Engaging, practical sessions that upskill teams and audiences on AI literacy, clarity coaching, and workforce readiness.",
    bullets: [
      "Keynotes (30 / 45 / 60 min)",
      "Half-day & full-day workshops",
      "Hands-on Claude / GPT labs",
    ],
  },
  {
    key: "corporate",
    name: "Corporate, EAP & Workforce Learning",
    price: "Custom scope",
    description:
      "Wellness-aligned AI learning experiences, institutional capability building, and organizational workforce readiness, delivered through structured corporate scopes.",
    bullets: [
      "Cohort design for 20 – 500+ learners",
      "EAP integration & wellbeing alignment",
      "Executive sponsor reporting",
    ],
  },
  {
    key: "cohorts",
    name: "Transformation Cohorts & The Collective AI Summit",
    price: "Consumer to institutional",
    description:
      "Intensive multi-week accelerators and the flagship Collective AI Summit, for groups, organizations, and ecosystem partners.",
    bullets: [
      "8 – 12 week guided cohorts",
      "Quarterly Collective AI Summit",
      "Promo / Standard / VIP variations",
    ],
  },
  {
    key: "university",
    name: "AI University Roadmap Tracks",
    price: "Custom / Roadmap pricing",
    description:
      "Premium educational pathways for specialists building lasting AI fluency: sequenced tracks across foundation, application, and authority.",
    bullets: [
      "Sequenced multi-track curriculum",
      "Capstone authority projects",
      "Cohort & private options",
    ],
  },
] as const;
