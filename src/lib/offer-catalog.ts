// ============================================================
// FocusFlow. Paid Offer Catalog (Rent-an-Agent + Advisory)
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
      "Connected to your CRM and pipeline",
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

/** Inquiry-only. MasterOffer.pdf governs: Enterprise carries NO public price.
 *  Do not reintroduce a number here or in structured data. */
export const RENT_AGENT_ENTERPRISE = {
  name: "Enterprise",
  tagline: "Custom enterprise support and dedicated routing.",
  priceDisplay: "By application",
  features: [
    "Custom-scoped agent fleet",
    "Dedicated success engineer",
    "SLA + compliance review",
    "Quarterly executive briefings",
  ],
  best_for: "Institutional buyers, workforce partners, and corporate ecosystems.",
};

/** AI Lead Engine, five tiers, all inquiry-only. Pricing per MasterOffer.pdf. */
export const LEAD_ENGINE_TIERS = [
  {
    key: "essentials",
    name: "Essentials",
    headline: "Stop guessing who to call. Get a weekly list of pre-qualified, intent-scored leads.",
    price: "from $697/mo",
    setup: "+ $1,500 one-time setup",
    timeline: "Live in 7 days",
    bullets: [
      "Up to 500 enriched leads / month matched to your ICP",
      "Intent + fit scoring (0–100) with reasoning per lead",
      "Verified email + direct phone + LinkedIn URL per record",
      "Weekly list drop straight into your CRM",
      "Monthly scoring tune-up call",
    ],
    best_for: "Founders doing outbound themselves who want a smarter list, not a bigger one.",
  },
  {
    key: "pro",
    name: "Pro",
    headline: "Replace your outbound SDR with a system that sends, follows up, and books.",
    price: "$1,497/mo",
    setup: "+ $2,500 one-time setup",
    timeline: "Live in 14 days",
    bullets: [
      "Everything in Essentials",
      "Your own fully provisioned outreach workspace, branded to you",
      "3-channel sequence: email + LinkedIn + SMS, 8-touch cadence",
      "AI-personalized first lines on every send",
      "Reply detection auto-routes meetings to your calendar",
      "Monthly performance review (open / reply / meeting rates)",
    ],
    best_for: "Operators with a clear ICP who need consistent pipeline without hiring.",
    highlighted: true,
  },
  {
    key: "growth",
    name: "Growth",
    headline: "Done-for-you follow-up and reporting, so no lead goes cold on your watch.",
    price: "$2,497/mo",
    setup: "+ $3,500 one-time setup",
    timeline: "Live in 14 days",
    bullets: [
      "Everything in Pro",
      "Done-for-you follow-up across every channel",
      "Weekly pipeline reporting you can hand to your team",
      "Nurture tracks for leads not ready yet",
      "Bi-weekly review call",
    ],
    best_for: "Scaling agencies and teams who need follow-up handled, not just started.",
  },
  {
    key: "scale",
    name: "Scale",
    headline: "Run a full outbound floor: voice, social, inbox, without headcount.",
    price: "$2,997/mo",
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
  key: "enterprise",
  name: "Lead Engine. Enterprise",
  headline: "Custom-built outbound infrastructure for multi-brand, multi-region, or regulated GTM.",
  priceDisplay: "$4,997/mo",
  setup: "+ setup, scoped on the call",
  bullets: [
    "Custom-scoped agent fleet across channels",
    "Dedicated success engineer + solutions architect",
    "CRM / data-warehouse integration (Salesforce, HubSpot Enterprise, Snowflake)",
    "SLA + compliance review (SOC 2, GDPR, TCPA)",
    "Quarterly executive briefings on pipeline + system health",
  ],
  best_for: "Multi-brand operators, agencies, and regulated industries.",
} as const;

// ============================================================
// Standalone agent builds, the quick-win rung of the ladder.
// Platform names never appear here; these are outcomes.
// The AI Brain is the only one with open checkout: it is a
// foundation, not a build, so there is nothing to scope first.
// ============================================================

export interface AgentBuildOffer {
  key: string;
  name: string;
  tagline: string;
  priceDisplay: string;
  turnaround: string;
  features: string[];
  /** Set when the buyer can pay immediately. */
  priceId?: string;
  price?: number;
  /** True when an intake must be completed before any money changes hands. */
  intakeRequired?: boolean;
  addOn?: string;
  highlighted?: boolean;
  required?: boolean;
}

export const AGENT_BUILDS: AgentBuildOffer[] = [
  {
    key: "ai_brain",
    name: "AI Brain",
    tagline: "The knowledge base every agent draws from. Your voice, offers, process, decisions.",
    priceDisplay: "$197",
    price: 197,
    priceId: "price_1U2HOqBReje0oFcLyJ5Ymk5L",
    turnaround: "Built in about 72 hours",
    required: true,
    features: [
      "Your business structured so any agent can use it",
      "Voice, offers, process, and decision rules captured",
      "Reused by every agent you ever add",
      "Required with any agent build",
    ],
    addOn: "Additional brains $97 each.",
  },
  {
    key: "instant_agent",
    name: "Instant Agent",
    tagline: "One trained assistant, live and answering in about 72 hours.",
    priceDisplay: "from $297",
    turnaround: "Most clients live in about 72 hours",
    intakeRequired: true,
    highlighted: true,
    features: [
      "One agent built around a single job you are tired of doing",
      "Trained on your AI Brain, so it sounds like you",
      "Delivered ready to use, no setup left to you",
      "One 30-minute teaching session included",
    ],
    addOn: "Additional agents $197 each.",
  },
  {
    key: "knowledge_agent",
    name: "Knowledge Agent",
    tagline: "An agent that knows your business cold and answers like your best team member.",
    priceDisplay: "from $397",
    turnaround: "Live in about a week",
    intakeRequired: true,
    features: [
      "Trained on your documents, offers, and policies",
      "Answers customer and internal questions in your voice",
      "Managed for you from $97 to $197/mo",
      "One 30-minute teaching session included",
    ],
    addOn: "Additional agents $297 each.",
  },
  {
    key: "full_system_agent",
    name: "Full-System Agent",
    tagline: "Connected to your CRM, calendar, and pipeline. Conversation and voice capable.",
    priceDisplay: "from $750",
    turnaround: "Live in about two weeks",
    intakeRequired: true,
    features: [
      "Wired into your CRM, calendar, and pipeline",
      "Handles conversations by text or by phone",
      "Books, routes, and follows up without you",
      "Managed for you at $297/mo",
    ],
  },
];

/** Hermes, the premium capstone. From $5,000, always scoped on a call. */
export const HERMES = {
  key: "hermes",
  name: "Hermes",
  tagline: "An autonomous agent system that works toward outcomes, not just conversations.",
  priceDisplay: "From $5,000",
  priceNote: "Custom-scoped above that. Always scoped on a call, never open checkout.",
  features: [
    "Works toward an outcome you define, not a script it follows",
    "Runs multi-step work across your systems without a prompt each time",
    "Built on your AI Brain so every decision stays in your voice",
    "Monitoring, guardrails, and a human review loop you control",
    "Scoped, built, and tuned directly with Coach Kay's team",
  ],
  best_for: "Organizations ready for agents that pursue outcomes, not just answer questions.",
} as const;

/** The public ladder, low to high. Drives the /agents hub. */
export const AGENT_LADDER = [
  {
    key: "audit",
    step: "Diagnose",
    name: "AI Business Audit",
    priceDisplay: "$47",
    body: "Find out what an agent can actually take off your plate before you spend anything else.",
    cta: { label: "Get the $47 audit", to: "/audit/intake" },
    instant: true,
  },
  {
    key: "builds",
    step: "Prove it",
    name: "Agent Builds",
    priceDisplay: "$197 – $750+",
    body: "The AI Brain plus your first agents. The smallest thing that proves the system works in your business.",
    cta: { label: "See agent builds", to: "/agents/builds" },
  },
  {
    key: "rent",
    step: "Run it",
    name: "Rent-an-Agent",
    priceDisplay: "from $297/mo",
    body: "A managed AI team on retainer. We build it, host it, and keep it working while you live your life.",
    cta: { label: "See retainer tiers", to: "/rent-an-agent" },
    highlighted: true,
  },
  {
    key: "lead_engine",
    step: "Fill the pipeline",
    name: "AI Lead Engine",
    priceDisplay: "from $697/mo",
    body: "Outbound that finds, scores, contacts, and books. Your pipeline stops depending on your energy.",
    cta: { label: "See Lead Engine", to: "/agents/lead-engine" },
  },
  {
    key: "hermes",
    step: "Go autonomous",
    name: "Hermes",
    priceDisplay: "from $5,000",
    body: "Autonomous agent systems that pursue outcomes on their own. Scoped on a call.",
    cta: { label: "Explore Hermes", to: "/agents/hermes" },
  },
] as const;

/** Low-ticket entry offers, direct Stripe Checkout (one-time payments). */
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

/** High-ticket / scoped advisory lanes, inquiry-only. */
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
      "Hands-on build labs",
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
