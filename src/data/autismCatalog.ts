export interface AutismDisplayPackage {
  slug: string;
  anchor: string;
  name: string;
  shortName: string;
  priceCents: number;
  priceLabel: string;
  bestFor: string;
  bullets: string[];
  inquiryOnly?: boolean;
  giftWrapEligible?: boolean;
  audience: "parent" | "therapist" | "school";
}

const universalBullets = [
  "Itemized HSA/FSA receipt",
  "Letter of Medical Necessity template",
  "IEP-aligned objective language",
];

export const AUTISM_DISPLAY: AutismDisplayPackage[] = [
  {
    slug: "autism_single_digital",
    anchor: "single",
    name: "Single Digital Social Story",
    shortName: "Single Story",
    priceCents: 4700,
    priceLabel: "$47",
    bestFor: "Best for: parents needing one story for one specific situation.",
    bullets: [
      "1 AI-personalized digital social story",
      "Tailored to your child by name, age, and interests",
      "Delivered as a print-ready PDF",
      ...universalBullets,
    ],
    audience: "parent",
  },
  {
    slug: "autism_therapy_toolkit",
    anchor: "toolkit",
    name: "Therapy Toolkit",
    shortName: "Therapy Toolkit",
    priceCents: 12700,
    priceLabel: "$127",
    bestFor: "Best for: therapists building a starter pack of go-to stories.",
    bullets: [
      "3 AI-personalized digital social stories",
      "Cover three different scenarios or goals",
      "Print-ready PDFs for sessions",
      ...universalBullets,
    ],
    audience: "therapist",
  },
  {
    slug: "autism_premium_illustrated",
    anchor: "premium",
    name: "Premium Illustrated Social Story",
    shortName: "Premium Illustrated",
    priceCents: 29700,
    priceLabel: "$297",
    bestFor: "Best for: families wanting a keepsake, gift-quality story.",
    bullets: [
      "1 custom-illustrated personalized story",
      "Hand-finished illustration style",
      "Gift-quality digital + print-ready files",
      "Optional gift wrap + handwritten note add-on",
      ...universalBullets,
    ],
    giftWrapEligible: true,
    audience: "parent",
  },
  {
    slug: "autism_therapy_practice_bundle",
    anchor: "practice",
    name: "Therapy Practice Bundle",
    shortName: "Practice Bundle",
    priceCents: 99700,
    priceLabel: "$997",
    bestFor: "Best for: therapists and clinicians stocking their full library.",
    bullets: [
      "5 custom-illustrated personalized stories",
      "Covers a wider therapy curriculum",
      "Reusable across multiple clients (with permission)",
      ...universalBullets,
    ],
    audience: "therapist",
  },
  {
    slug: "autism_school_iep_bundle",
    anchor: "school",
    name: "School + IEP Bundle",
    shortName: "School + IEP",
    priceCents: 199700,
    priceLabel: "From $1,997",
    bestFor: "Best for: schools and districts supporting students on IEPs.",
    bullets: [
      "10 stories aligned directly to IEP goals",
      "Built with your special-education team",
      "Eligible for special-education funding sources",
      "Itemized invoicing for school finance",
    ],
    inquiryOnly: true,
    audience: "school",
  },
  {
    slug: "autism_custom_practice_license",
    anchor: "license",
    name: "Custom Practice License",
    shortName: "Practice License",
    priceCents: 399700,
    priceLabel: "Custom scope",
    bestFor: "Best for: autism centers and clinics building a complete library.",
    bullets: [
      "Custom-built library scoped to your practice",
      "Branded for your clinic or center",
      "License covers your full clinical team",
      "Onboarding + training session included",
    ],
    inquiryOnly: true,
    audience: "school",
  },
];

export const AUTISM_GIFT_WRAP_PRICE_CENTS = 2500;
export const AUTISM_GIFT_WRAP_LABEL = "$25";

export const findDisplayPackage = (slug: string) =>
  AUTISM_DISPLAY.find((p) => p.slug === slug);