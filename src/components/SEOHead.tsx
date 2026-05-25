import { Helmet } from "react-helmet-async";
import { globalGraph } from "@/lib/seo-schema";

const BASE_URL = "https://coachkayai.life";
const BRAND_SUFFIX = "Coach Kay — Clarity Coaching & AI Transformation";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  ogImage?: string;
  /** Inject sitewide Person + Organization + WebSite graph. Default: true. */
  injectGlobalGraph?: boolean;
  /** When true, emits <meta name="robots" content="noindex, nofollow"> for private/utility pages. */
  noIndex?: boolean;
}

const SEOHead = ({
  title,
  description,
  path,
  jsonLd,
  ogImage = `${BASE_URL}/og-image.png`,
  injectGlobalGraph = true,
  noIndex = false,
}: SEOHeadProps) => {
  const canonical = `${BASE_URL}${path}`;
  const pageSchemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  // Suppress sitewide graph on noindex pages — keeps Google's knowledge graph anchored on indexable URLs.
  const schemas = injectGlobalGraph && !noIndex ? [globalGraph(), ...pageSchemas] : pageSchemas;
  // Append brand suffix when missing — keeps every <title> branded for SERP while preserving hand-crafted heads.
  const fullTitle = /coach kay/i.test(title) ? title : `${title} | ${BRAND_SUFFIX}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="FocusFlow AI by Coach Kay" />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
