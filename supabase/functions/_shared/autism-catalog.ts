// Server-side mirror of the Autism & Social Stories catalog. Prices and
// Stripe price IDs defined here are authoritative — never trust client input.

export interface AutismPackage {
  slug: string;
  name: string;
  priceCents: number;
  priceId: string;
  inquiryOnly?: boolean;
  giftWrapEligible?: boolean;
}

export interface AutismAddon {
  slug: string;
  name: string;
  priceCents: number;
  priceId: string;
}

export const AUTISM_PACKAGES: AutismPackage[] = [
  {
    slug: "autism_single_digital",
    name: "Autism Single Digital Social Story",
    priceCents: 4700,
    priceId: "price_1TbCl2BReje0oFcL5Fg4hh6H",
  },
  {
    slug: "autism_therapy_toolkit",
    name: "Autism Therapy Toolkit (3 Stories)",
    priceCents: 12700,
    priceId: "price_1TbClUBReje0oFcLW7LtYO75",
  },
  {
    slug: "autism_premium_illustrated",
    name: "Autism Premium Illustrated Social Story",
    priceCents: 29700,
    priceId: "price_1TbCmCBReje0oFcLcedSOHi6",
    giftWrapEligible: true,
  },
  {
    slug: "autism_therapy_practice_bundle",
    name: "Autism Therapy Practice Bundle (5 Stories)",
    priceCents: 99700,
    priceId: "price_1TbCmqBReje0oFcLt06k0wdp",
  },
  {
    slug: "autism_school_iep_bundle",
    name: "School + IEP Bundle",
    priceCents: 199700,
    priceId: "",
    inquiryOnly: true,
  },
  {
    slug: "autism_custom_practice_license",
    name: "Custom Practice License",
    priceCents: 399700,
    priceId: "",
    inquiryOnly: true,
  },
];

export const AUTISM_GIFT_WRAP: AutismAddon = {
  slug: "autism_gift_wrap_addon",
  name: "Gift Wrap + Personalized Note",
  priceCents: 2500,
  priceId: "price_1TbCnGBReje0oFcLRN9Mx1ND",
};

export const findAutismPackage = (slug: string) =>
  AUTISM_PACKAGES.find((p) => p.slug === slug);