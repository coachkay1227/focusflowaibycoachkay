// Postbuild prerenderer: generates static HTML for /blog and /blog/:slug so
// per-route meta tags + JSON-LD ship in view-source (fixes social previews,
// canonical-on-homepage SEO bug, and Rich Results detection).
//
// Strategy: clone dist/index.html, replace the head's title/description/canonical/
// og:* /twitter:* tags and append route-specific JSON-LD. React still hydrates on
// top — Helmet's runtime updates are a no-op since the tags already match.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";

const SITE = "https://coachkayai.life";
const DIST = resolve("dist");
const SHELL = resolve(DIST, "index.html");

if (!existsSync(SHELL)) {
  console.warn("[prerender-blog] dist/index.html missing — skipping (build did not run yet).");
  process.exit(0);
}

// Static metadata for each post. Keep in sync with src/data/blogPosts.ts.
// Image path matches the bundled asset emitted by Vite (we resolve it from the
// built shell so it works even when the hashed filename changes).
interface PostMeta {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  category: string;
  readingTime: string;
  datePublished: string;
  dateModified: string;
  keywords: string[];
  imageAssetBasename: string; // file name in src/assets/blog/
}

const POSTS: PostMeta[] = [
  {
    slug: "20-ai-system-small-business-10-hours",
    title: "The $20 AI System That Can Save Small Business Owners 10 Hours a Week",
    seoTitle: "The $20 AI System That Saves Small Business Owners 10 Hours a Week",
    seoDescription:
      "A practical $20/month AI workflow for small business owners — replies, follow-ups, content, scheduling, and admin. Built by Coach Kay (FocusFlow AI).",
    excerpt:
      "Most small business owners don't need more tools. They need fewer repetitive tasks. Here is the $20 AI workflow that quietly buys back 10 hours every week.",
    category: "AI for Small Business",
    readingTime: "7 min read",
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    keywords: [
      "AI for small business",
      "ChatGPT for small business",
      "Claude AI workflows",
      "AI tools Columbus",
      "Coach Kay",
      "FocusFlow AI",
    ],
    imageAssetBasename: "ai-system-workspace",
  },
];

const FAQS = [
  ["What is the best AI system for small business owners?", "The best AI system for most small business owners is a simple workflow using ChatGPT Plus or Claude AI to handle customer replies, scheduling support, follow-ups, and content creation."],
  ["Can AI save small business owners time?", "Yes. AI can save small business owners hours each week by reducing repetitive tasks like answering common questions, writing follow-up messages, creating content, and drafting reminders."],
  ["Do I need technical skills to use AI in my business?", "No. If you can type a message, you can use AI tools like ChatGPT or Claude. The key is using clear prompts and repeating simple workflows."],
  ["How much does this AI system cost?", "Most small business owners can start for free, but paid versions of tools like ChatGPT Plus or Claude Pro are usually around $20 per month."],
  ["Where can I learn this in Columbus?", "Columbus business owners can attend The Claude AI Business Accelerator, a free in-person workshop where entrepreneurs build practical AI workflows for their businesses."],
] as const;

const shellHtml = readFileSync(SHELL, "utf8");

/** Find the hashed asset URL emitted by Vite for a given source basename. */
function findAssetUrl(basename: string): string {
  const re = new RegExp(`/assets/${basename}-[A-Za-z0-9_-]+\\.(?:jpg|jpeg|png|webp|avif)`);
  const m = shellHtml.match(re);
  if (m) return m[0];
  // Fallback: search asset manifest by scanning all built JS for the basename.
  // Vite inlines image imports as URLs in the JS chunks; grep the dist tree.
  try {
    const stack = [resolve(DIST, "assets")];
    while (stack.length) {
      const dir = stack.pop()!;
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        const p = resolve(dir, f);
        if (statSync(p).isDirectory()) { stack.push(p); continue; }
        if (!/\.(js|css)$/.test(f)) continue;
        const src = readFileSync(p, "utf8");
        const found = src.match(re);
        if (found) return found[0];
      }
    }
  } catch { /* ignore */ }
  // Last resort
  return `/og-image.png`;
}

/**
 * Replace head tags in the shell HTML with route-specific values, and append
 * extra JSON-LD scripts before </head>.
 */
function patchHead(opts: {
  title: string;
  description: string;
  canonical: string;
  ogType: "website" | "article";
  ogImage: string;
  ogImageAlt?: string;
  extraMeta?: string;
  jsonLd: Array<Record<string, unknown>>;
}): string {
  let html = shellHtml;

  // Title
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(opts.title)}</title>`);

  // Meta description
  html = html.replace(
    /<meta\s+name="description"[^>]*\/?>(?:\s*<\/meta>)?/i,
    `<meta name="description" content="${escapeAttr(opts.description)}" />`,
  );
  // Multiline description form
  html = html.replace(
    /<meta\s+\n?\s*name="description"[\s\S]*?\/>/i,
    `<meta name="description" content="${escapeAttr(opts.description)}" />`,
  );

  // Canonical
  html = html.replace(
    /<link\s+rel="canonical"[^>]*\/?>(?:\s*<\/link>)?/i,
    `<link rel="canonical" href="${escapeAttr(opts.canonical)}" />`,
  );

  // og:type
  html = html.replace(
    /<meta\s+property="og:type"[^>]*\/?>/i,
    `<meta property="og:type" content="${opts.ogType}" />`,
  );
  // og:image
  html = html.replace(
    /<meta\s+property="og:image"[^>]*\/?>/i,
    `<meta property="og:image" content="${escapeAttr(opts.ogImage)}" />`,
  );
  // twitter:image
  html = html.replace(
    /<meta\s+name="twitter:image"[^>]*\/?>/i,
    `<meta name="twitter:image" content="${escapeAttr(opts.ogImage)}" />`,
  );
  // og:title / twitter:title
  html = html.replace(
    /<meta\s+property="og:title"[^>]*\/?>/i,
    `<meta property="og:title" content="${escapeAttr(opts.title)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:title"[^>]*\/?>/i,
    `<meta name="twitter:title" content="${escapeAttr(opts.title)}" />`,
  );
  // og:description / twitter:description (handle multiline forms)
  html = html.replace(
    /<meta\s+\n?\s*property="og:description"[\s\S]*?\/>/i,
    `<meta property="og:description" content="${escapeAttr(opts.description)}" />`,
  );
  html = html.replace(
    /<meta\s+\n?\s*name="twitter:description"[\s\S]*?\/>/i,
    `<meta name="twitter:description" content="${escapeAttr(opts.description)}" />`,
  );

  // Inject og:url + extras + JSON-LD before </head>
  const inject = [
    `<meta property="og:url" content="${escapeAttr(opts.canonical)}" />`,
    `<link rel="canonical" href="${escapeAttr(opts.canonical)}" />`,
    opts.ogImageAlt ? `<meta property="og:image:alt" content="${escapeAttr(opts.ogImageAlt)}" />` : "",
    opts.extraMeta ?? "",
    ...opts.jsonLd.map(
      (s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`,
    ),
  ].filter(Boolean).join("\n    ");

  html = html.replace("</head>", `    ${inject}\n  </head>`);
  return html;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function writeRoute(routePath: string, html: string) {
  const out = resolve(DIST, routePath.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`[prerender-blog] wrote ${out.replace(DIST + "/", "")}`);
}

// ---------- /blog (index) ----------
const blogIndexJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: POSTS.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${SITE}/blog/${p.slug}`,
    name: p.title,
  })),
};

const blogIndexHtml = patchHead({
  title: "Blog — FocusFlow AI by Coach Kay | AI for Small Business",
  description:
    "Practical AI workflows, prompts, and systems for small business owners. Real strategies from Coach Kay — built for salons, real estate, coaches, notaries, and service founders.",
  canonical: `${SITE}/blog`,
  ogType: "website",
  ogImage: `${SITE}/og-image.png`,
  jsonLd: [blogIndexJsonLd],
});
writeRoute("/blog", blogIndexHtml);

// ---------- /blog/:slug (each post) ----------
for (const post of POSTS) {
  const assetUrl = findAssetUrl(post.imageAssetBasename);
  const imageUrl = assetUrl.startsWith("http") ? assetUrl : `${SITE}${assetUrl}`;
  const canonical = `${SITE}/blog/${post.slug}`;

  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [imageUrl],
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: { "@type": "Person", name: "Coach Kay", url: `${SITE}/coach-kay` },
    publisher: {
      "@type": "Organization",
      name: "FocusFlow AI — Coach Kay",
      logo: { "@type": "ImageObject", url: `${SITE}/og-image.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    keywords: post.keywords.join(", "),
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const event = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "The Claude AI Business Accelerator",
    startDate: "2026-06-04T18:00:00-04:00",
    endDate: "2026-06-04T21:00:00-04:00",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: "COED Columbus",
      address: {
        "@type": "PostalAddress",
        streetAddress: "1890 E. Main Street",
        addressLocality: "Columbus",
        addressRegion: "OH",
        postalCode: "43205",
        addressCountry: "US",
      },
      geo: { "@type": "GeoCoordinates", latitude: 39.959786, longitude: -82.971428 },
    },
    image: [`${SITE}/og-image.png`],
    description:
      "Free AI training for Columbus small business owners. Build live workflows for salons, real estate, coaching, and notary businesses.",
    maximumAttendeeCapacity: 150,
    offers: {
      "@type": "Offer",
      name: "Free general admission",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://TheClaudeAIBusinessAccelerator.eventbrite.com",
      validFrom: "2026-04-01T00:00:00-04:00",
      category: "Free",
    },
    organizer: {
      "@type": "Organization",
      name: "FocusFlow AI — Coach Kay",
      url: SITE,
    },
    url: "https://TheClaudeAIBusinessAccelerator.eventbrite.com",
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  const extraMeta = [
    `<meta name="keywords" content="${escapeAttr(post.keywords.join(", "))}" />`,
    `<meta property="og:image:width" content="1600" />`,
    `<meta property="og:image:height" content="1000" />`,
    `<meta property="article:published_time" content="${post.datePublished}" />`,
    `<meta property="article:modified_time" content="${post.dateModified}" />`,
    `<meta property="article:author" content="Coach Kay" />`,
    `<meta property="article:section" content="${escapeAttr(post.category)}" />`,
    `<meta name="twitter:label1" content="Reading time" />`,
    `<meta name="twitter:data1" content="${escapeAttr(post.readingTime)}" />`,
    `<meta name="twitter:label2" content="Written by" />`,
    `<meta name="twitter:data2" content="Coach Kay" />`,
  ].join("\n    ");

  const html = patchHead({
    title: `${post.seoTitle} | FocusFlow AI by Coach Kay`,
    description: post.seoDescription,
    canonical,
    ogType: "article",
    ogImage: imageUrl,
    ogImageAlt: post.title,
    extraMeta,
    jsonLd: [article, faq, event, breadcrumb],
  });
  writeRoute(`/blog/${post.slug}`, html);
}

// ---------- Commercial routes ----------
// Static routes get prerendered from the title/description literals in their
// page component's <SEOHead/>, so the crawlable head stays in sync with the app
// without a second copy of the copy.

const MAX_PRERENDER_PAGES = 200; // publish-output safety cap

// Routes whose <SEOHead/> builds title/description at runtime. Their crawlable
// default lives here.
const META_OVERRIDES: Record<string, { title: string; description: string }> = {
  "/clarity": {
    title: "Free Clarity Check: Find Your Next Move",
    description:
      "Answer a few honest questions and get personalized insight into your patterns, your blockers, and the next clear action to take.",
  },
  "/ai-tools": {
    title: "AI Tools Directory: Coach Kay's Working Stack",
    description:
      "Vetted AI tools scored and reviewed by Coach Kay. Curated by a Master Certified Coach. Practical, honest, no affiliate fluff.",
  },
};

const COMMERCIAL_ROUTES = [
  "/",
  "/start",
  "/coach-kay",
  "/agents",
  "/agents/builds",
  "/agents/lead-engine",
  "/agents/hermes",
  "/rent-an-agent",
  "/agent-builder",
  "/build-studio",
  "/start-a-build",
  "/advisory",
  "/store",
  "/autism-social-stories",
  "/truth",
  "/starter-kit",
  "/modules",
  "/faq",
  "/assessment",
  "/challenges",
  "/clarity",
  "/ai-tools",
  "/pause-hub",
  "/collective",
  "/community",
  "/methodology",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/refund-policy",
];

const appSrc = readFileSync(resolve("src/App.tsx"), "utf8");

function componentForRoute(routePath: string): string | null {
  const re = new RegExp(
    `<Route\\s+path="${routePath.replace(/\//g, "\\/")}"\\s+element=\\{([\\s\\S]*?)\\}\\s*\\/>`,
  );
  const m = appSrc.match(re);
  if (!m) return null;
  const wrappers = new Set(["Suspense", "ProtectedRoute", "ErrorBoundary", "PageSkeleton", "Navigate"]);
  const compRe = /<([A-Z][A-Za-z0-9_]*)\b/g;
  let cm: RegExpExecArray | null;
  while ((cm = compRe.exec(m[1])) !== null) if (!wrappers.has(cm[1])) return cm[1];
  return null;
}

function fileForComponent(name: string): string | null {
  const lazyM = appSrc.match(
    new RegExp(`const\\s+${name}\\s*=\\s*lazy\\(\\(\\)\\s*=>\\s*import\\(["']([^"']+)["']\\)`),
  );
  const importM = appSrc.match(new RegExp(`import\\s+${name}\\s+from\\s+["']([^"']+)["']`));
  const rel = lazyM?.[1] ?? importM?.[1];
  if (!rel) return null;
  const cleaned = rel.replace(/^\.\//, "");
  for (const c of [resolve("src", cleaned), resolve("src", cleaned + ".tsx"), resolve("src", cleaned + ".ts")]) {
    if (existsSync(c)) return c;
  }
  return null;
}

/** Pull the static title/description of the <SEOHead/> whose path matches. */
function metaForRoute(file: string, routePath: string): { title: string; description: string } | null {
  const src = readFileSync(file, "utf8");
  const tagRe = /<SEOHead\b([\s\S]*?)\/>/g;
  let m: RegExpExecArray | null;
  let fallback: { title: string; description: string } | null = null;
  while ((m = tagRe.exec(src)) !== null) {
    const attrs = m[1];
    const title = attrs.match(/title="([^"]*)"/)?.[1];
    const description = attrs.match(/description="([^"]*)"/)?.[1];
    if (!title || !description) continue;
    const path = attrs.match(/path="([^"]*)"/)?.[1];
    if (path === routePath) return { title, description };
    fallback ??= { title, description };
  }
  return fallback;
}

// Mirrors the brand-suffix rule in src/components/SEOHead.tsx.
const withBrand = (t: string) => (/coach kay/i.test(t) ? t : `${t} | Coach Kay AI`);

let commercialCount = 0;
for (const routePath of COMMERCIAL_ROUTES) {
  if (POSTS.length + 1 + commercialCount >= MAX_PRERENDER_PAGES) {
    console.warn(`[prerender] hit MAX_PRERENDER_PAGES (${MAX_PRERENDER_PAGES}) — stopping.`);
    break;
  }
  const comp = componentForRoute(routePath);
  const file = comp ? fileForComponent(comp) : null;
  const meta = META_OVERRIDES[routePath] ?? (file ? metaForRoute(file, routePath) : null);
  if (!meta) {
    console.warn(`[prerender] no static metadata for ${routePath} — skipped.`);
    continue;
  }
  const canonical = routePath === "/" ? `${SITE}/` : `${SITE}${routePath}`;
  const html = patchHead({
    title: withBrand(meta.title),
    description: meta.description,
    canonical,
    ogType: "website",
    ogImage: `${SITE}/og-image.png`,
    jsonLd: [],
  });
  if (routePath === "/") {
    writeFileSync(SHELL, html);
    console.log(`[prerender] wrote index.html (home)`);
  } else {
    writeRoute(routePath, html);
  }
  commercialCount++;
}

console.log(
  `[prerender] done — ${POSTS.length + 1} blog pages + ${commercialCount} commercial pages prerendered.`,
);