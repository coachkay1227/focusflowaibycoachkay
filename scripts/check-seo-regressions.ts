/// <reference types="node" />

// SEO regression check — runs in predev/prebuild to fail fast on:
//   1. Routes whose page component does not render <SEOHead/>
//   2. Indexable routes that incorrectly set noIndex (or vice versa)
//   3. Public/indexable routes missing from public/sitemap.xml
//   4. The single <SEOHead> render in a page missing a `path={...}` prop
//
// Update INDEXABLE / NOINDEX / SKIP below when adding a new <Route> in src/App.tsx.

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const APP_FILE = "src/App.tsx";
const SITEMAP_FILE = "public/sitemap.xml";

// Routes that MUST be indexable (SEOHead present, noIndex !== true, and listed in sitemap).
// Dynamic params (`:slug`) are accepted — sitemap presence is checked against the static prefix.
const INDEXABLE: string[] = [
  "/",
  "/events/claude-ai-business-accelerator-june-2026",
  "/clarity",
  "/clarity/:moduleId",
  "/assessment",
  "/challenges",
  "/modules",
  "/programs/:slug",
  "/starter-kit",
  "/community",
  "/coach-kay",
  "/store",
  "/rent-an-agent",
  "/agent-builder",
  "/advisory",
  "/build-studio",
  "/truth",
  "/autism-social-stories",
  "/faq",
  "/collective",
  "/pause-hub",
  "/ai-tools",
  "/blog",
  "/blog/:slug",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/refund-policy",
];

// Routes that MUST be noindex (SEOHead present with noIndex={true}). Not expected in sitemap.
const NOINDEX: string[] = [
  "/auth",
  "/reset-password",
  "/onboarding",
  "/dashboard",
  "/result",
  "/mirror-challenge",
  "/challenges/:type",
  "/coach",
  "/profile",
  "/kiosk",
  "/order-success",
  "/sitemap",
  "/unsubscribe",
  "/email-unsubscribe",
  "/audit/landing",
  "/audit/intake",
  "/audit/intake/:id",
  "/audit/report/:id",
  "/agent-result",
  "/agent-intake",
  "*", // NotFound
];

// Routes intentionally skipped for exceptional cases (non-redirect pages only).
// Redirects rendered with <Navigate /> are auto-skipped by the parser logic.
const SKIP = new Set<string>([
  "/about",
  "/ai-starter-kit",
  "/events/claude-accelerator",
]);

// Routes behind `<ProtectedRoute requireAdmin>` — unreachable by crawlers, so SEOHead
// is not required. Still must NOT appear in sitemap.xml. Update if you add admin pages.
const ADMIN_EXEMPT = new Set<string>([
  "/admin",
  "/admin/users",
  "/admin/analytics",
  "/admin/content",
  "/admin/orders",
  "/admin/autism-orders",
  "/admin/build-inquiries",
  "/admin/build-orders",
  "/admin/audits",
  "/admin/enrollments",
  "/admin/voice-bible",
  "/admin/newsletter",
  "/admin/scam-alerts",
  "/admin/newsletter-draft/:id",
  "/admin/booking-links",
  "/email-preview",
]);

interface RouteEntry {
  path: string;
  component: string;
}

function isSkippedRoute(r: RouteEntry): boolean {
  return SKIP.has(r.path) || r.component === "__navigate__";
}

function parseRoutes(src: string): RouteEntry[] {
  const routes: RouteEntry[] = [];
  // Match <Route path="..." element={...<Component .../>...} />
  const re = /<Route\s+path="([^"]+)"\s+element=\{([\s\S]*?)\}\s*\/>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const path = m[1];
    const element = m[2];
    if (/Navigate\s/.test(element)) {
      routes.push({ path, component: "__navigate__" });
      continue;
    }
    // Pull the first <ComponentName ... /> that isn't a known wrapper.
    const wrappers = new Set([
      "Suspense", "ProtectedRoute", "ErrorBoundary", "PageSkeleton", "Navigate",
    ]);
    const compRe = /<([A-Z][A-Za-z0-9_]*)\b/g;
    let cm: RegExpExecArray | null;
    let component = "";
    while ((cm = compRe.exec(element)) !== null) {
      if (!wrappers.has(cm[1])) { component = cm[1]; break; }
    }
    routes.push({ path, component });
  }
  return routes;
}

function resolveComponentFile(name: string, appSrc: string): string | null {
  // Find `import Name from "./pages/..."` or `lazy(() => import("./pages/..."))`
  const lazyRe = new RegExp(
    `const\\s+${name}\\s*=\\s*lazy\\(\\(\\)\\s*=>\\s*import\\(["']([^"']+)["']\\)`
  );
  const importRe = new RegExp(`import\\s+${name}\\s+from\\s+["']([^"']+)["']`);
  const lazyM = appSrc.match(lazyRe);
  const importM = appSrc.match(importRe);
  const rel = lazyM?.[1] ?? importM?.[1];
  if (!rel) return null;
  // Relative to src/
  const cleaned = rel.replace(/^\.\//, "");
  const candidates = [
    resolve("src", cleaned),
    resolve("src", cleaned + ".tsx"),
    resolve("src", cleaned + ".ts"),
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  return null;
}

function pageUsesSEOHead(src: string): { used: boolean; noIndex: boolean | "unknown"; hasPath: boolean } {
  const imported = /from\s+["']@\/components\/SEOHead["']/.test(src);
  const rendered = /<SEOHead\b/.test(src);
  const used = imported && rendered;
  if (!used) return { used, noIndex: "unknown", hasPath: false };
  // Inspect every <SEOHead ...> tag; flag noIndex if ANY tag sets noIndex truthy.
  // Acceptable forms: noIndex, noIndex={true}, noIndex={someVar}
  const tagRe = /<SEOHead\b([\s\S]*?)\/>/g;
  let anyNoIndex = false;
  let anyHasPath = false;
  let unknownNoIndex = false;
  let tm: RegExpExecArray | null;
  while ((tm = tagRe.exec(src)) !== null) {
    const attrs = tm[1];
    if (/\bpath\s*=/.test(attrs)) anyHasPath = true;
    if (/\bnoIndex(\s|=\{true\}|$|\/)/.test(attrs)) anyNoIndex = true;
    else if (/\bnoIndex=\{[^}]+\}/.test(attrs)) unknownNoIndex = true;
  }
  const noIndex = anyNoIndex ? true : unknownNoIndex ? "unknown" : false;
  return { used, noIndex, hasPath: anyHasPath };
}

function sitemapPaths(): Set<string> {
  if (!existsSync(resolve(SITEMAP_FILE))) return new Set();
  const xml = readFileSync(resolve(SITEMAP_FILE), "utf8");
  const out = new Set<string>();
  const re = /<loc>([^<]+)<\/loc>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    try {
      const u = new URL(m[1]);
      out.add(u.pathname);
    } catch { /* ignore */ }
  }
  return out;
}

function sitemapCoversIndexable(routePath: string, paths: Set<string>): boolean {
  // Dynamic routes: require at least one entry under the prefix.
  if (routePath.includes(":")) {
    const prefix = routePath.split("/:")[0] + "/";
    for (const p of paths) if (p.startsWith(prefix)) return true;
    return false;
  }
  return paths.has(routePath);
}

function main() {
  const appSrc = readFileSync(resolve(APP_FILE), "utf8");
  const routes = parseRoutes(appSrc);
  const sitemap = sitemapPaths();

  const errors: string[] = [];
  const warnings: string[] = [];

  const indexable = new Set(INDEXABLE);
  const noindex = new Set(NOINDEX);

  // Config hygiene: SKIP should only contain existing, non-redirect routes.
  for (const p of SKIP) {
    const route = routes.find((r) => r.path === p);
    if (!route) {
      warnings.push(`SKIP route "${p}" does not exist in ${APP_FILE}.`);
    }
  }

  // Detect newly-added routes not classified.
  for (const r of routes) {
    if (isSkippedRoute(r)) continue;
    if (!indexable.has(r.path) && !noindex.has(r.path) && !ADMIN_EXEMPT.has(r.path)) {
      errors.push(
        `Route "${r.path}" (${r.component}) is not classified in scripts/check-seo-regressions.ts. ` +
        `Add it to INDEXABLE, NOINDEX, or ADMIN_EXEMPT so the SEO contract is explicit.`
      );
    }
  }

  // Per-route component checks.
  for (const r of routes) {
    if (isSkippedRoute(r)) continue;
    if (ADMIN_EXEMPT.has(r.path)) {
      // Still guard: admin pages must never leak into the sitemap.
      if (sitemap.has(r.path)) {
        errors.push(`Admin-exempt route "${r.path}" is listed in ${SITEMAP_FILE} — remove it.`);
      }
      continue;
    }
    if (!indexable.has(r.path) && !noindex.has(r.path)) continue;

    const file = resolveComponentFile(r.component, appSrc);
    if (!file) {
      errors.push(`Could not locate source file for component <${r.component}/> (route ${r.path}).`);
      continue;
    }
    const src = readFileSync(file, "utf8");
    const { used, noIndex, hasPath } = pageUsesSEOHead(src);

    if (!used) {
      errors.push(`Route "${r.path}" → ${file}: missing <SEOHead/> render (import + usage required).`);
      continue;
    }
    if (!hasPath) {
      errors.push(`Route "${r.path}" → ${file}: <SEOHead/> is missing the required \`path\` prop.`);
    }
    if (indexable.has(r.path) && noIndex === true) {
      errors.push(`Route "${r.path}" is INDEXABLE but ${file} sets noIndex on <SEOHead/>.`);
    }
    if (noindex.has(r.path) && noIndex === false) {
      errors.push(`Route "${r.path}" is NOINDEX but ${file} does not set noIndex on <SEOHead/>.`);
    }
    if (noIndex === "unknown") {
      warnings.push(`Route "${r.path}" → ${file}: noIndex is a dynamic expression — verify manually.`);
    }
  }

  // Sitemap coverage for indexable routes.
  for (const p of INDEXABLE) {
    if (!sitemapCoversIndexable(p, sitemap)) {
      errors.push(`Indexable route "${p}" has no matching entry in ${SITEMAP_FILE}.`);
    }
  }

  // Sitemap should not list noindex routes.
  for (const p of NOINDEX) {
    if (p.includes(":") || p === "*") continue;
    if (sitemap.has(p)) {
      errors.push(`Noindex route "${p}" is listed in ${SITEMAP_FILE} — remove it from the sitemap.`);
    }
  }

  if (warnings.length) {
    console.warn("[seo-check] warnings:");
    for (const w of warnings) console.warn("  - " + w);
  }
  if (errors.length) {
    console.error("[seo-check] FAILED:");
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }
  console.log(`[seo-check] OK — ${routes.length} routes scanned, ${sitemap.size} sitemap entries.`);
}

main();