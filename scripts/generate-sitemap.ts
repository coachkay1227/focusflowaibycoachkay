// Auto-generates public/sitemap.xml from route + data sources.
// Runs via predev/prebuild npm hooks. Do not hand-edit public/sitemap.xml.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = "https://coachkayai.life";
const TODAY = new Date().toISOString().slice(0, 10);

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// --- Static public routes (mirrors indexable <Route> entries in src/App.tsx) ---
// /auth, /sitemap, /reset-password, /onboarding, /dashboard, /profile, /coach, /result,
// /mirror-challenge, /order-success, /unsubscribe, /email-unsubscribe and /admin/* are
// intentionally excluded — they're noindex utility/private pages.
const staticEntries: SitemapEntry[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/modules", priority: "0.9", changefreq: "weekly" },
  { path: "/coach-kay", priority: "0.8", changefreq: "monthly" },
  { path: "/community", priority: "0.7", changefreq: "monthly" },
  { path: "/store", priority: "0.7", changefreq: "weekly" },
  { path: "/autism-social-stories", priority: "0.9", changefreq: "weekly" },
  { path: "/rent-an-agent", priority: "0.9", changefreq: "weekly" },
  { path: "/advisory", priority: "0.8", changefreq: "monthly" },
  { path: "/build-studio", priority: "0.9", changefreq: "weekly" },
  { path: "/truth", priority: "0.95", changefreq: "weekly" },
  { path: "/collective", priority: "0.7", changefreq: "monthly" },
  { path: "/pause-hub", priority: "0.7", changefreq: "monthly" },
  { path: "/ai-tools", priority: "0.7", changefreq: "monthly" },
  { path: "/clarity", priority: "0.7", changefreq: "monthly" },
  { path: "/assessment", priority: "0.8", changefreq: "monthly" },
  { path: "/challenges", priority: "0.7", changefreq: "monthly" },
  { path: "/starter-kit", priority: "0.8", changefreq: "monthly" },
  { path: "/faq", priority: "0.7", changefreq: "monthly" },
  { path: "/privacy", priority: "0.4", changefreq: "yearly" },
  { path: "/terms", priority: "0.4", changefreq: "yearly" },
  { path: "/disclaimer", priority: "0.4", changefreq: "yearly" },
  { path: "/refund-policy", priority: "0.4", changefreq: "yearly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
];

// --- Dynamic: clarity modules from src/lib/modules.ts ---
// Legacy/retired clarity slugs that render the RetiredScreen — must NOT be
// indexed. Mirrors LEGACY_CLARITY_REDIRECTS in src/pages/ClaritySession.tsx.
const RETIRED_CLARITY_IDS = new Set<string>([
  "emotional-reset",
  "focus-flow",
  "purpose-happiness",
  "goal-shift",
]);

function extractClarityModuleIds(): string[] {
  const src = readFileSync(resolve("src/lib/modules.ts"), "utf8");
  // Find the coachingModules array and pull top-level `id: "..."` per module entry.
  const arrayStart = src.indexOf("export const coachingModules");
  if (arrayStart === -1) return [];
  const body = src.slice(arrayStart);
  const ids: string[] = [];
  // Match `  {\n    id: "..."` — two-space indent identifies module-level entries (vs nested question ids).
  const re = /\n  \{\n\s{4}id:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) ids.push(m[1]);
  return ids;
}

// --- Dynamic: public programs from src/data/programs.ts ---
function extractPublicProgramSlugs(): string[] {
  const src = readFileSync(resolve("src/data/programs.ts"), "utf8");
  const slugs: string[] = [];
  // Split source into per-program blocks using top-level `    id: "..."` as sentinel.
  const blocks = src.split(/(?=\n    id:\s*")/);
  for (const block of blocks) {
    const slugMatch = block.match(/\bslug:\s*"([^"]+)"/);
    const visMatch = block.match(/\bvisibility:\s*"([^"]+)"/);
    if (!slugMatch || !visMatch) continue;
    if (visMatch[1] === "public" || visMatch[1] === "lead_magnet") {
      slugs.push(slugMatch[1]);
    }
  }
  return Array.from(new Set(slugs));
}

// --- Dynamic: blog posts from src/data/blogPosts.ts ---
function extractBlogSlugs(): string[] {
  const src = readFileSync(resolve("src/data/blogPosts.ts"), "utf8");
  const slugs: string[] = [];
  const re = /\bslug:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) slugs.push(m[1]);
  return slugs;
}

function buildEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = staticEntries.map((e) => ({ ...e, lastmod: TODAY }));

  for (const id of extractClarityModuleIds()) {
    if (RETIRED_CLARITY_IDS.has(id)) continue;
    entries.push({
      path: `/clarity/${id}`,
      lastmod: TODAY,
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  for (const slug of extractPublicProgramSlugs()) {
    entries.push({
      path: `/programs/${slug}`,
      lastmod: TODAY,
      changefreq: "monthly",
      priority: "0.8",
    });
  }

  for (const slug of extractBlogSlugs()) {
    entries.push({
      path: `/blog/${slug}`,
      lastmod: TODAY,
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  return entries;
}

function render(entries: SitemapEntry[]): string {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

const entries = buildEntries();
writeFileSync(resolve("public/sitemap.xml"), render(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);