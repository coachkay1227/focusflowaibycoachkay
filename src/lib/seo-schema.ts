import type { Program } from "@/data/programs";

export const SITE_URL = "https://coachkayai.life";
export const BASE_URL = SITE_URL;
export const ORG_ID = `${SITE_URL}/#organization`;
export const PERSON_ID = `${SITE_URL}/#coachkay`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const LOCAL_BUSINESS_ID = `${SITE_URL}/#localbusiness`;

type BreadcrumbItem = { name: string; path: string };

type ServiceSchemaOptions = {
  name: string;
  description: string;
  url: string;
  idSuffix: string;
  price?: number;
};

const cleanPath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

export const webPage = (path: string, name: string, type: string = "WebPage") => ({
  "@context": "https://schema.org",
  "@type": type,
  "@id": `${SITE_URL}${cleanPath(path)}#webpage`,
  url: `${SITE_URL}${cleanPath(path)}`,
  name,
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": ORG_ID },
});

export const breadcrumb = (items: BreadcrumbItem[], path: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${SITE_URL}${cleanPath(path)}#breadcrumb`,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${cleanPath(item.path)}`,
  })),
});

export const serviceSchema = ({
  name,
  description,
  url,
  idSuffix,
  price,
}: ServiceSchemaOptions) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/#${idSuffix}`,
  name,
  description,
  serviceType: name,
  provider: { "@id": ORG_ID },
  areaServed: {
    "@type": "Country",
    name: "United States",
  },
  url,
  ...(typeof price === "number"
    ? {
        offers: {
          "@type": "Offer",
          price: price.toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url,
        },
      }
    : {}),
});

export const offerCatalog = (programs: Program[]) => ({
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  "@id": `${SITE_URL}/#offer-catalog`,
  name: "FocusFlow AI Programs",
  itemListElement: programs.map((program, index) => ({
    "@type": "Offer",
    position: index + 1,
    itemOffered: {
      "@type": "Service",
      name: program.title,
      description: program.tagline,
      serviceType: program.category,
      provider: { "@id": ORG_ID },
      url: `${SITE_URL}/programs/${program.slug}`,
    },
    price: program.price.toFixed(2),
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/programs/${program.slug}`,
  })),
});

export const programSchema = (program: Program): Array<Record<string, unknown>> => {
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/programs/${program.slug}#product`,
    name: program.title,
    description: program.description,
    category: program.category,
    brand: {
      "@type": "Brand",
      name: "FocusFlow AI",
    },
    sku: program.id,
    offers: {
      "@type": "Offer",
      price: program.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/programs/${program.slug}`,
      seller: { "@id": ORG_ID },
    },
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/programs/${program.slug}#service`,
    name: program.title,
    description: program.tagline,
    provider: { "@id": ORG_ID },
    serviceType: `${program.category} ${program.pillarFull}`,
    url: `${SITE_URL}/programs/${program.slug}`,
  };

  return [product, service];
};

export const globalGraph = () => {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: "FocusFlow AI by Coach Kay",
        description:
          "AI coaching, clarity frameworks, and business automation for small business owners in Columbus and beyond",
        keywords:
          "AI coaching, small business automation, clarity coaching, AI systems, Coach Kay, Columbus Ohio",
        publisher: { "@id": ORG_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "FocusFlow AI",
        alternateName: "Coach Kay AI",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.png`,
          width: 512,
          height: 512,
        },
        image: `${SITE_URL}/og-image.png`,
        description:
          "Master-certified clarity coaching and AI automation strategy for entrepreneurs, founders, and service businesses",
        keywords:
          "AI business strategist, clarity coaching, AI workflow automation, Columbus business coach",
        founder: {
          "@type": "Person",
          "@id": PERSON_ID,
          name: "Coach Kay",
          jobTitle: "Founder & AI Business Strategist",
          url: SITE_URL,
        },
        sameAs: [
          "https://www.instagram.com/coachkayai",
          "https://www.tiktok.com/@coachkayai",
          "https://www.linkedin.com/in/coachkayai",
          "https://www.youtube.com/@coachkayai",
          "https://TheClaudeAIBusinessAccelerator.eventbrite.com",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Customer Support",
          areaServed: "US",
          availableLanguage: "English",
        },
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: "Coach Kay",
        jobTitle: "Founder & AI Business Strategist",
        worksFor: { "@id": ORG_ID },
        url: SITE_URL,
        sameAs: [
          "https://www.instagram.com/coachkayai",
          "https://www.linkedin.com/in/coachkayai",
        ],
      },
      {
        "@type": ["ProfessionalService", "LocalBusiness"],
        "@id": LOCAL_BUSINESS_ID,
        name: "FocusFlow AI — Coach Kay",
        image: `${SITE_URL}/og-image.png`,
        url: SITE_URL,
        telephone: "+1-614-XXX-XXXX",
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: "1890 E. Main Street",
          addressLocality: "Columbus",
          addressRegion: "OH",
          postalCode: "43205",
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 39.9612,
          longitude: -82.9988,
        },
        areaServed: {
          "@type": "City",
          name: "Columbus",
          containedInPlace: {
            "@type": "State",
            name: "Ohio",
          },
        },
        serviceType: ["AI Coaching", "Business Automation", "Clarity Coaching"],
      },
    ],
  };
};
