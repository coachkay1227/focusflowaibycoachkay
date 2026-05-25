import { z } from "zod";

export type BookCategory =
  | "storybooks"
  | "legacy"
  | "authority"
  | "creator"
  | "autism";

export interface BookPackage {
  slug: string;
  category: BookCategory;
  name: string;
  /** Cents. 0 for inquiry-only / custom-quote packages. */
  priceCents: number;
  turnaround: string;
  bullets: string[];
  /** When true, the package is custom-quote and bypasses Stripe checkout. */
  inquiryOnly?: boolean;
  /** Optional audience caption shown under the package name. */
  audience?: string;
}

export interface BookAddon {
  slug: string;
  name: string;
  priceCents: number;
  description: string;
}

export const CATEGORY_LABELS: Record<BookCategory, string> = {
  storybooks: "Storybooks & Gifts",
  legacy: "Legacy & Family",
  authority: "Expert / Authority",
  creator: "Creator / Seller",
  autism: "Autism & Social Stories",
};

export const PACKAGES: BookPackage[] = [
  {
    slug: "children-mini-story-starter",
    category: "storybooks",
    name: "Mini-Story Starter",
    priceCents: 49700,
    turnaround: "5–7 Days",
    audience: "Personal gifts",
    bullets: [
      "Custom 800-word story",
      "5 AI illustrations",
      "PDF layout + title page",
      "1 revision included",
    ],
  },
  {
    slug: "children-storybook-pro",
    category: "storybooks",
    name: "The Storybook Pro",
    priceCents: 125000,
    turnaround: "10–14 Days",
    audience: "Children's books",
    bullets: [
      "1,000–1,500 word story",
      "10+ custom AI illustrations",
      "Cover design + KDP formatting",
      "2 revisions + mockups",
    ],
  },
  {
    slug: "children-premium-legacy",
    category: "legacy",
    name: "The Premium Legacy Book",
    priceCents: 250000,
    turnaround: "2–3 Weeks",
    audience: "Elders, memoirs & heirloom volumes",
    bullets: [
      "Custom characters or family cast",
      "Hardcover + paperback formatting",
      "1:1 concept consult",
      "Done-for-you KDP upload",
      "Heirloom-quality finish",
    ],
  },
  {
    slug: "coloring-quick-sketch",
    category: "creator",
    name: "Quick Sketch Starter",
    priceCents: 29700,
    turnaround: "5–7 Days",
    audience: "Etsy & digital creators",
    bullets: [
      "25 AI-generated coloring pages",
      "Themed to your niche",
      "PDF printable + digital format",
      "1 revision",
    ],
  },
  {
    slug: "coloring-etsy-seller",
    category: "creator",
    name: "The Etsy Seller Pack",
    priceCents: 59700,
    turnaround: "10–14 Days",
    audience: "Etsy sellers",
    bullets: [
      "30–50 AI-generated pages",
      "Cover + Etsy-ready mockups",
      "Etsy SEO keywords included",
      "Canva editable file",
    ],
  },
  {
    slug: "coloring-ultimate-creator",
    category: "creator",
    name: "Ultimate Creator Package",
    priceCents: 125000,
    turnaround: "2–3 Weeks",
    audience: "Multi-platform creators",
    bullets: [
      "Activity pages, mazes, and word finds",
      "Upload support for Etsy + KDP",
      "3 social media promo graphics",
      "Lifetime license for reselling",
    ],
  },
  {
    slug: "nonfiction-outline-draft",
    category: "authority",
    name: "Outline + Draft Only",
    priceCents: 75000,
    turnaround: "7–10 Days",
    audience: "Experts & founders",
    bullets: [
      "Custom book outline",
      "AI-generated first draft (10–15k words)",
      "Editable Google Doc delivery",
      "1 feedback round",
    ],
  },
  {
    slug: "nonfiction-expert-book",
    category: "authority",
    name: "Done-for-You Expert Book",
    priceCents: 250000,
    turnaround: "4–5 Weeks",
    audience: "Industry leaders",
    bullets: [
      "Complete ghostwritten book (15–25k words)",
      "Edited and formatted for KDP",
      "Custom cover design",
      "Author bio + back cover content",
    ],
  },
  {
    slug: "nonfiction-booked-branded",
    category: "authority",
    name: "Booked & Branded Package",
    priceCents: 450000,
    turnaround: "5–6 Weeks",
    audience: "Founders & speakers",
    bullets: [
      "Everything in the Expert Book package",
      "Branded Canva promo templates",
      "3 email launch sequences",
      "Lead magnet workbook spin-off",
      "1:1 coaching call: How to Leverage Your Book",
    ],
  },
  {
    slug: "autism-social-story-custom",
    category: "autism",
    name: "Autism & Social Stories",
    priceCents: 0,
    turnaround: "Custom Scope",
    audience: "Parents, clinics & educators",
    inquiryOnly: true,
    bullets: [
      "Custom, affirming social narratives",
      "Eases transitions, routines & regulation",
      "Highly visual, deeply personal",
      "School- and therapy-aligned concepts",
      "Single stories or bundled programs",
    ],
  },
];

export const ADDONS: BookAddon[] = [
  {
    slug: "addon-launch-toolkit",
    name: "Book Launch Toolkit",
    priceCents: 39700,
    description:
      "3-part email launch sequence, 5 Canva social graphics, and an Amazon SEO book description.",
  },
  {
    slug: "addon-lead-magnet",
    name: "Lead Magnet Spin-Off",
    priceCents: 29700,
    description:
      "Repurpose your book into a branded downloadable workbook or freebie.",
  },
  {
    slug: "addon-strategy-call",
    name: "VIP Book Strategy Call",
    priceCents: 19700,
    description:
      "60-minute 1:1 session with Coach Kay to map your entire book plan.",
  },
];

export function findPackage(slug: string): BookPackage | undefined {
  return PACKAGES.find((p) => p.slug === slug);
}

export function findAddon(slug: string): BookAddon | undefined {
  return ADDONS.find((a) => a.slug === slug);
}

export function formatUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export const REFERRAL_SOURCES = [
  "Instagram",
  "Fiverr",
  "Upwork",
  "Referral",
  "Google",
  "Other",
] as const;

export const BOOK_PURPOSES = [
  "Personal gift",
  "Brand/business",
  "Etsy selling",
  "Amazon KDP publishing",
  "Legacy/family",
  "Other",
] as const;

export const ILLUSTRATION_STYLES = [
  "Watercolor",
  "Cartoon",
  "Realistic",
  "Minimalist",
  "No preference",
] as const;

export const intakeSchema = z.object({
  client_name: z.string().trim().min(1, "Required").max(120),
  client_email: z.string().trim().email("Valid email required").max(255),
  client_phone: z.string().trim().max(40).optional().or(z.literal("")),
  referral_source: z.enum(REFERRAL_SOURCES),
  package_slug: z.string().min(1),
  book_title: z.string().trim().max(200).optional().or(z.literal("")),
  book_purpose: z.enum(BOOK_PURPOSES),
  book_vision: z
    .string()
    .trim()
    .min(50, "Please share at least 50 characters about your vision")
    .max(4000),
  characters: z.string().trim().max(500).optional().or(z.literal("")),
  illustration_style: z.enum(ILLUSTRATION_STYLES),
  special_requirements: z.string().trim().max(2000).optional().or(z.literal("")),
  addons: z.array(z.string()).default([]),
  agree_revisions: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
  agree_final_sale: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
});

export type IntakeFormData = z.infer<typeof intakeSchema>;

export const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  in_progress: "In Progress",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
