import { Helmet } from "react-helmet-async";
import { globalGraph } from "@/lib/seo-schema";

const BASE_URL = "https://coachkayai.life";
const BRAND_SUFFIX = "Coach Kay AI";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  ogImage?: string;
  injectGlobalGraph?: boolean;
  noIndex?: boolean;
  /** Article-specific dates for BlogPosting/NewsArticle */
  publishedTime?: string;
  modifiedTime?: string;
  /** Section/category for article OG */
  articleSection?: string;
  /** Tags for article OG */
  articleTags?: string[];
}

const generateBreadcrumbs = (path: string) => {
  const segments = path.split("/").filter(Boolean);
  const items = segments.map((segment, i) => ({
    "@type": "ListItem",
    position: i + 2,
    name: segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    item: `${BASE_URL}/${segments.slice(0, i + 1).join("/")}`,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: BASE_URL }, ...items],
  };
};

const SEOHead = ({
  title,
  description,
  path,
  jsonLd,
  ogImage = `${BASE_URL}/og-image.png`,
  injectGlobalGraph = true,
  noIndex = false,
  keywords = [],
  publishedTime,
  modifiedTime,
  articleSection = "AI for Business",
  articleTags = ["AI automation", "small business", "Columbus Ohio"],
}: SEOHeadProps) => {
  const canonical = `${BASE_URL}${path}`;
  const pageSchemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const schemas = injectGlobalGraph && !noIndex ? [globalGraph(), ...pageSchemas] : pageSchemas;

  // Auto-inject breadcrumbs
  const allSchemas = [...schemas, generateBreadcrumbs(path)];

  const fullTitle = /coach kay/i.test(title) ? title : `${title} | ${BRAND_SUFFIX}`;

  // Dynamic OG type detection
  const ogType = allSchemas.some((s) => s?.["@type"] === "Event")
    ? "event"
    : allSchemas.some((s) => /BlogPosting|Article|NewsArticle/.test(s?.["@type"] as string))
      ? "article"
      : "website";

  // Find Event for special OG tags
  const eventSchema = allSchemas.find(
    (s) => s?.["@type"] === "Event"
  ) as { startDate?: string; endDate?: string; location?: { name?: string }; offers?: { price?: string } } | undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="FocusFlow AI by Coach Kay" />
      <meta property="og:image" content={ogImage} />

      {/* Article-specific OG */}
      {ogType === "article" && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:author" content="Coach Kay" />
          <meta property="article:section" content={articleSection} />
          {articleTags.map((tag, i) => (
            <meta key={i} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Event-specific OG */}
      {ogType === "event" && eventSchema && (
        <>
          <meta property="event:start_time" content={eventSchema?.startDate} />
          <meta property="event:end_time" content={eventSchema?.endDate} />
          <meta property="event:location" content={eventSchema?.location?.name} />
          <meta property="event:price" content={eventSchema?.offers?.price} />
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {allSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
