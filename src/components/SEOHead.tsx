import { Helmet } from "react-helmet-async";
import { globalGraph } from "@/lib/seo-schema";

const BASE_URL = "https://coachkayai.life";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  ogImage?: string;
  /** Inject sitewide Person + Organization + WebSite graph. Default: true. */
  injectGlobalGraph?: boolean;
}

const SEOHead = ({
  title,
  description,
  path,
  jsonLd,
  ogImage = `${BASE_URL}/og-image.png`,
  injectGlobalGraph = true,
}: SEOHeadProps) => {
  const canonical = `${BASE_URL}${path}`;
  const pageSchemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const schemas = injectGlobalGraph ? [globalGraph(), ...pageSchemas] : pageSchemas;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="FocusFlow AI by Coach Kay" />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
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
