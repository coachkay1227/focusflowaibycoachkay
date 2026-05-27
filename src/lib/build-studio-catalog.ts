// ============================================================
// FocusFlow — Collective AI Build Studio catalog
// Single source of truth for the Build Studio page.
// Tier 1 (one-time) + Tier 5 (recurring) have Stripe price IDs
// and ship via the existing create-checkout edge function.
// Tier 2/3 are application-only — no Stripe products yet.
// ============================================================

export interface BuildTierOffer {
  key: string;
  name: string;
  tagline: string;
  price: number;
  priceDisplay: string;
  turnaround: string;
  /** Present for Tier 1 / Tier 5 — drives direct Stripe checkout. */
  priceId?: string;
  /** Present for Tier 2 / Tier 3 — opens the qualification dialog. */
  inquiryOnly?: boolean;
  features: string[];
  highlighted?: boolean;
}

export const QUICK_WINS: BuildTierOffer[] = [
  {
    key: "link_in_bio",
    name: "Link-in-Bio Hub",
    tagline: "Creator-ready single page with all your links + booking.",
    price: 297,
    priceDisplay: "$297",
    turnaround: "48 hr",
    priceId: "price_1Tbbj0BReje0oFcL4qqcndi2",
    features: [
      "Mobile-first single page",
      "Booking + payment links",
      "Custom domain wired",
      "Analytics installed",
    ],
  },
  {
    key: "personal_brand",
    name: "Personal Brand Site",
    tagline: "Resume, portfolio, and personal brand in one place.",
    price: 397,
    priceDisplay: "$397",
    turnaround: "72 hr",
    priceId: "price_1Tbbn5BReje0oFcLV5aYSxdp",
    features: [
      "About + work + contact pages",
      "SEO basics + sitemap",
      "PDF resume embed",
      "Domain + hosting setup",
    ],
  },
  {
    key: "landing_page",
    name: "Conversion Landing Page",
    tagline: "One page engineered to convert. Copy, design, analytics.",
    price: 497,
    priceDisplay: "$497",
    turnaround: "72 hr",
    priceId: "price_1TbbqcBReje0oFcLPvFHVSAJ",
    highlighted: true,
    features: [
      "Conversion-optimized layout",
      "Done-for-you headline + copy",
      "Form / Calendly / Stripe wired",
      "Analytics + heatmap installed",
    ],
  },
  {
    key: "lead_magnet",
    name: "Lead Magnet Funnel",
    tagline: "PDF magnet, opt-in page, confirmation email — done.",
    price: 697,
    priceDisplay: "$697",
    turnaround: "5 days",
    priceId: "price_1TbbqyBReje0oFcL2lbGJDQl",
    features: [
      "Custom-designed PDF lead magnet",
      "Opt-in + thank-you pages",
      "Email automation wired",
      "Goes live in 5 days",
    ],
  },
  {
    key: "chatbot_setup",
    name: "AI Chatbot Widget",
    tagline: "AI assistant trained on your docs, embedded on your site.",
    price: 797,
    priceDisplay: "$797",
    turnaround: "5 days",
    priceId: "price_1TbbxuBReje0oFcL07dnyiRf",
    features: [
      "Trained on your content",
      "Embedded widget on any site",
      "Branded prompt + tone",
      "Pair with Agent Care for tuning",
    ],
  },
];

export const BUSINESS_BUILDS: BuildTierOffer[] = [
  {
    key: "marketing_site",
    name: "Full Marketing Site",
    tagline: "5–8 page site with CMS, SEO, and analytics.",
    price: 2497,
    priceDisplay: "$2,497",
    turnaround: "2 weeks",
    inquiryOnly: true,
    features: ["5–8 polished pages", "CMS for blog/updates", "Technical SEO baseline", "Analytics + heatmaps"],
  },
  {
    key: "lead_gen_quiz",
    name: "Lead-Gen Quiz Funnel",
    tagline: "AI-scored quiz that captures + qualifies leads.",
    price: 2497,
    priceDisplay: "$2,497",
    turnaround: "2 weeks",
    inquiryOnly: true,
    highlighted: true,
    features: ["Custom quiz logic", "AI-scored results page", "CRM / email integration", "Conversion analytics"],
  },
  {
    key: "ecommerce",
    name: "E-Commerce Store",
    tagline: "Product catalog, Stripe checkout, customer portal.",
    price: 2997,
    priceDisplay: "$2,997",
    turnaround: "2 weeks",
    inquiryOnly: true,
    features: ["Up to 50 products", "Stripe + tax setup", "Order + customer portal", "Email confirmations"],
  },
  {
    key: "client_portal",
    name: "Client Portal / Dashboard",
    tagline: "Login-gated dashboard for your customers.",
    price: 3497,
    priceDisplay: "$3,497",
    turnaround: "2–3 weeks",
    inquiryOnly: true,
    features: ["Auth + roles", "Custom dashboards", "File uploads / downloads", "Admin controls"],
  },
  {
    key: "course_platform",
    name: "Course / Membership Platform",
    tagline: "Sell digital programs with drip content + community.",
    price: 3997,
    priceDisplay: "$3,997",
    turnaround: "3 weeks",
    inquiryOnly: true,
    features: ["Course modules + lessons", "Drip + progress tracking", "Stripe subscription billing", "Community area"],
  },
  {
    key: "ops_dashboard",
    name: "Internal Ops Dashboard",
    tagline: "CRM-lite for your team — pipelines, tasks, reporting.",
    price: 3997,
    priceDisplay: "$3,997",
    turnaround: "3 weeks",
    inquiryOnly: true,
    features: ["Pipelines + kanban", "Team auth + roles", "Integrations (GHL, Slack)", "Custom reports"],
  },
];

export const CUSTOM_AI_APPS: BuildTierOffer[] = [
  {
    key: "saas_mvp",
    name: "AI Tool / SaaS MVP",
    tagline: "Production-ready MVP of your AI product idea.",
    price: 7997,
    priceDisplay: "from $7,997",
    turnaround: "3–4 weeks",
    inquiryOnly: true,
    highlighted: true,
    features: ["End-to-end product build", "Auth + billing + admin", "AI workflow integrations", "Launch-ready deploy"],
  },
  {
    key: "multi_agent",
    name: "Multi-Agent Workflow System",
    tagline: "Orchestrated AI agents that run real business workflows.",
    price: 9997,
    priceDisplay: "$9,997",
    turnaround: "4 weeks",
    inquiryOnly: true,
    features: ["3+ specialized agents", "Orchestration + routing", "Stack integrations", "Monitoring dashboard"],
  },
  {
    key: "industry_assistant",
    name: "Industry-Specific AI Assistant",
    tagline: "Vertical AI for real estate, legal, healthcare intake, more.",
    price: 9997,
    priceDisplay: "from $9,997",
    turnaround: "4 weeks",
    inquiryOnly: true,
    features: ["Vertical-specific prompts", "Compliance-aware copy", "CRM / EMR integration", "Voice or chat front-end"],
  },
  {
    key: "white_label",
    name: "White-Label Coaching Platform",
    tagline: "Your own branded coaching app — modules, AI, billing.",
    price: 12997,
    priceDisplay: "$12,997",
    turnaround: "4 weeks",
    inquiryOnly: true,
    features: ["Custom branded UI", "Module / curriculum engine", "AI coach + assessments", "Stripe + admin"],
  },
];

export const CARE_PLANS: BuildTierOffer[] = [
  {
    key: "site_care",
    name: "Site Care",
    tagline: "Hosting, updates, monitoring, and small edits.",
    price: 97,
    priceDisplay: "$97/mo",
    turnaround: "Monthly",
    priceId: "price_1TbbyIBReje0oFcL02mjIa6U",
    features: ["Hosting included", "Security + uptime monitoring", "Small edits each month", "Cancel anytime"],
  },
  {
    key: "membership",
    name: "Collective Membership",
    tagline: "Template library, office hours, priority build queue.",
    price: 97,
    priceDisplay: "$97/mo",
    turnaround: "Monthly",
    priceId: "price_1Tbc2mBReje0oFcLKStT1NEj",
    features: ["Member template library", "Monthly office hours", "Priority build queue", "Cancel anytime"],
  },
  {
    key: "agent_care",
    name: "Agent Care",
    tagline: "Prompt tuning, model updates, AI monitoring.",
    price: 197,
    priceDisplay: "$197/mo",
    turnaround: "Monthly",
    priceId: "price_1Tbc3yBReje0oFcLpQCYOLeJ",
    features: ["Prompt + model tuning", "Uptime + cost monitoring", "Monthly recommendations", "Cancel anytime"],
  },
  {
    key: "build_credits",
    name: "Build Credits",
    tagline: "4 hours of on-demand build time, banked monthly.",
    price: 497,
    priceDisplay: "$497/mo",
    turnaround: "Monthly",
    priceId: "price_1Tbc4SBReje0oFcLeEXu6hlp",
    highlighted: true,
    features: ["4 hrs build time / mo", "Roll over up to 2 months", "Priority turnaround", "Cancel anytime"],
  },
];

export const BUILD_STUDIO_TIERS = [
  { id: "quick_wins", label: "Quick Wins", price: "$297 – $797", offers: QUICK_WINS, inquiryOnly: false },
  { id: "business", label: "Business Builds", price: "$2,497 – $3,997", offers: BUSINESS_BUILDS, inquiryOnly: true },
  { id: "custom_ai", label: "Custom AI Apps", price: "$7,997 – $14,997", offers: CUSTOM_AI_APPS, inquiryOnly: true },
  { id: "care", label: "Care Plans", price: "$97 – $497/mo", offers: CARE_PLANS, inquiryOnly: false },
] as const;

export type BuildStudioTierId = (typeof BUILD_STUDIO_TIERS)[number]["id"];