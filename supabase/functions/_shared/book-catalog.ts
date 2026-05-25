// Server-side mirror of the book store catalog. Prices defined here are the
// authoritative source of truth — never trust client-submitted prices.

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
  priceCents: number;
  inquiryOnly?: boolean;
}
export interface BookAddon {
  slug: string;
  name: string;
  priceCents: number;
}

export const PACKAGES: BookPackage[] = [
  { slug: "children-mini-story-starter", category: "storybooks", name: "Mini-Story Starter", priceCents: 49700 },
  { slug: "children-storybook-pro", category: "storybooks", name: "The Storybook Pro", priceCents: 125000 },
  { slug: "children-premium-legacy", category: "legacy", name: "The Premium Legacy Book", priceCents: 250000 },
  { slug: "coloring-quick-sketch", category: "creator", name: "Quick Sketch Starter", priceCents: 29700 },
  { slug: "coloring-etsy-seller", category: "creator", name: "The Etsy Seller Pack", priceCents: 59700 },
  { slug: "coloring-ultimate-creator", category: "creator", name: "Ultimate Creator Package", priceCents: 125000 },
  { slug: "nonfiction-outline-draft", category: "authority", name: "Outline + Draft Only", priceCents: 75000 },
  { slug: "nonfiction-expert-book", category: "authority", name: "Done-for-You Expert Book", priceCents: 250000 },
  { slug: "nonfiction-booked-branded", category: "authority", name: "Booked & Branded Package", priceCents: 450000 },
  { slug: "autism-social-story-custom", category: "autism", name: "Autism & Social Stories", priceCents: 0, inquiryOnly: true },
];

export const ADDONS: BookAddon[] = [
  { slug: "addon-launch-toolkit", name: "Book Launch Toolkit", priceCents: 39700 },
  { slug: "addon-lead-magnet", name: "Lead Magnet Spin-Off", priceCents: 29700 },
  { slug: "addon-strategy-call", name: "VIP Book Strategy Call", priceCents: 19700 },
];

export const findPackage = (slug: string) => PACKAGES.find((p) => p.slug === slug);
export const findAddon = (slug: string) => ADDONS.find((a) => a.slug === slug);
