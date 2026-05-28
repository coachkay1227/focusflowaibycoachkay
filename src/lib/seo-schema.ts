// ============================================================
// FocusFlow — SEO Schema Builders
// Single source of truth for JSON-LD across the site.
// Stable @id graph: Person / Organization / WebSite.
// ============================================================

import type { Program } from "@/data/programs";

export const SITE_URL = "https://coachkayai.life";
export const PERSON_ID = `${SITE_URL}/#person`;
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

type Json = Record<string, unknown>;

/**
 * Sitewide identity graph — Person + Organization + WebSite with
 * stable @id references. Injected on every page via SEOHead.
 */
export function globalGraph(): Json {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: "Kenza Alaoui Ismaili",
        alternateName: ["Coach Kay", "Coach Kay Elevates", "Kenza Dawkins"],
        description: "Master Certified Life Coach and AI integration strategist specializing in AI coaching, clarity coaching, and business transformation through AI-powered programs.",
        jobTitle: [
          "5x Certified Life Coach",
          "AI Strategist",
          "AI Prompt Engineer",
          "Operations Architect & Lead Developer, Collective AI",
        ],
        knowsAbout: [
          "AI coaching",
          "life coaching",
          "business transformation",
          "AI integration",
          "clarity coaching",
          "focus and productivity",
          "AI-powered coaching",
          "AI tools for coaches",
          "rent an AI agent",
          "AI build studio",
          "coaching with AI",
          "autism social stories",
          "AI business audit",
        ],
        url: `${SITE_URL}/coach-kay`,
        email: "hello@coachkayelevates.org",
        telephone: "+1-380-287-7936",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Columbus",
          addressRegion: "OH",
          addressCountry: "US",
        },
        sameAs: [
          "https://coachkayelevates.org/",
          "https://forward-focus-elevation.org/",
          "https://www.linkedin.com/in/kenza-alaoui-ismaili",
        ],
        memberOf: {
          "@type": "Organization",
          name: "Collective AI",
          url: `${SITE_URL}/collective`,
        },
      },
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "Coach Kay Elevates",
        alternateName: ["FocusFlow AI by Coach Kay", "Focus Flow AI"],
        legalName: "Focus Flow AI LLC",
        description: "AI-powered clarity coaching platform offering AI life coaching, transformation programs, AI business audits, rent-an-agent services, and custom AI builds.",
        url: SITE_URL,
        founder: { "@id": PERSON_ID },
        sameAs: [
          "https://coachkayelevates.org/",
          "https://forward-focus-elevation.org/",
          "https://www.linkedin.com/in/kenza-alaoui-ismaili",
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            telephone: "+1-380-287-7936",
            email: "hello@coachkayelevates.org",
          },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "FocusFlow AI Services",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Life Coaching" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Business Audit" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Rent-an-Agent" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Collective AI Build Studio" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fractional AI Advisory" } },
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: "FocusFlow AI — Coach Kay",
        description: "Master AI coach platform: clarity sessions, transformation programs, AI business audits, and done-for-you AI agent systems.",
        publisher: { "@id": ORG_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/ai-tools?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumb(items: Crumb[], idSuffix: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}${idSuffix}#breadcrumb`,
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

export function webPage(path: string, name: string, type: "WebPage" | "AboutPage" | "CollectionPage" = "WebPage"): Json {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": type === "AboutPage" ? PERSON_ID : ORG_ID },
  };
}

/**
 * OfferCatalog of public Services for the home page.
 * Each Service @id is stable and uses the program slug.
 */
export function offerCatalog(offers: Program[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${SITE_URL}/#offer-catalog`,
    name: "Public Offers",
    itemListElement: offers.map((p) => ({
      "@type": "Service",
      "@id": `${SITE_URL}/#service-${p.slug}`,
      name: p.title,
      description: p.tagline,
      provider: { "@id": ORG_ID },
      url: `${SITE_URL}/programs/${p.slug}`,
      ...(p.price > 0 && {
        offers: {
          "@type": "Offer",
          price: p.price.toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/programs/${p.slug}`,
        },
      }),
    })),
  };
}

/**
 * Standalone Service schema for landing pages that represent a single
 * purchasable service (e.g. AI Business Audit, Rent-an-Agent tiers).
 *
 * @param opts.name       Human-readable service name
 * @param opts.description  1–2 sentence description (used by AI search engines)
 * @param opts.url        Canonical URL of the service page
 * @param opts.price      Numeric price in USD (omit for inquiry-only)
 * @param opts.idSuffix   Unique slug for the @id anchor (e.g. "ai-business-audit")
 */
export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  price?: number;
  idSuffix: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/#service-${opts.idSuffix}`,
    name: opts.name,
    description: opts.description,
    provider: { "@id": ORG_ID },
    url: opts.url,
    serviceType: "AI Coaching",
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    ...(opts.price !== undefined && {
      offers: {
        "@type": "Offer",
        price: opts.price.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: opts.url,
        seller: { "@id": ORG_ID },
      },
    }),
  };
}

/**
 * Schema for /programs/:slug — branches on program visibility.
 * - public      → full Course + WebPage + BreadcrumbList
 * - lead_magnet → WebPage + BreadcrumbList only (still gated today)
 * - backend     → WebPage only (avoid exposing protected content)
 * - retired     → no schema (page redirects)
 */
export function programSchema(program: Program): Json[] {
  if (program.visibility === "retired") return [];

  const path = `/programs/${program.slug}`;
  const url = `${SITE_URL}${path}`;
  const crumbs = breadcrumb(
    [
      { name: "Home", path: "/" },
      { name: "Paths", path: "/modules" },
      { name: program.title, path },
    ],
    path
  );

  if (program.visibility === "public") {
    const course: Json = {
      "@context": "https://schema.org",
      "@type": "Course",
      "@id": `${url}#course`,
      name: program.title,
      description: program.description,
      provider: { "@id": ORG_ID },
      url,
      ...(program.price > 0 && {
        offers: {
          "@type": "Offer",
          price: program.price.toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url,
        },
      }),
    };
    const page: Json = {
      ...webPage(path, program.title),
      mainEntity: { "@id": `${url}#course` },
    };
    return [course, page, crumbs];
  }

  // lead_magnet + backend: WebPage + BreadcrumbList only
  return [webPage(path, program.title), crumbs];
}
