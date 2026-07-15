#!/usr/bin/env bun
/**
 * Payment & audit link integrity check.
 *
 * Runs at build/CI time and fails the build when a payment or audit route is
 * broken. Verifies (statically, no network):
 *   1. Every `priceId` / `price_id` referenced in `src/` and
 *      `supabase/functions/` is registered in `PRICE_MODE_MAP` inside
 *      `supabase/functions/_shared/stripe-config.ts`.
 *   2. No direct `buy.stripe.com` payment links are shipped in `src/` — all
 *      purchases must route through the `create-checkout` edge function.
 *   3. The Business Audit funnel entry points route to `/audit/intake`, never
 *      to a raw Stripe URL or the `/audit/landing` page (which is post-payment
 *      only).
 *   4. Every route referenced in the audit funnel exists in
 *      `src/App.tsx` (`/audit/intake`, `/audit/landing`, `/audit/report/:id`,
 *      `/auth`).
 *
 * Exits non-zero on any failure. Safe to run offline.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");
const FUNCTIONS_DIR = join(ROOT, "supabase/functions");
const STRIPE_CONFIG = join(FUNCTIONS_DIR, "_shared/stripe-config.ts");
const APP_TSX = join(SRC_DIR, "App.tsx");
const REPORTS_DIR = join(ROOT, "reports");

const PRICE_ID_RE = /price_1[A-Za-z0-9]{20,}/g;
const BUY_LINK_RE = /https?:\/\/buy\.stripe\.com\/[A-Za-z0-9_-]+/g;
const AUDIT_FUNNEL_ROUTES = ["/audit/intake", "/audit/landing", "/audit/report", "/auth"];

type Failure = { rule: string; detail: string };
const failures: Failure[] = [];
const fail = (rule: string, detail: string) => failures.push({ rule, detail });

type LinkRecord = {
  type: "priceId" | "stripe_url" | "audit_entry" | "route_definition";
  value: string;
  file: string;
  line?: number;
  resolvedTarget?: string;
  label?: string;
  status: "ok" | "missing_in_map" | "direct_stripe_url" | "bypasses_intake" | "route_missing";
};
const records: LinkRecord[] = [];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function readSafe(path: string): string {
  try { return readFileSync(path, "utf8"); } catch { return ""; }
}

// ─── 1. Every priceId is registered in PRICE_MODE_MAP ──────────────────────
const stripeConfigSrc = readSafe(STRIPE_CONFIG);
if (!stripeConfigSrc) {
  fail("stripe-config", `Cannot read ${relative(ROOT, STRIPE_CONFIG)}`);
}
const registeredPrices = new Set(stripeConfigSrc.match(PRICE_ID_RE) ?? []);

// Parse label + mode for each registered price by scanning stripe-config lines.
const priceMeta = new Map<string, { mode: string; label: string }>();
for (const raw of stripeConfigSrc.split("\n")) {
  const m = raw.match(/"(price_1[A-Za-z0-9]{20,})"\s*:\s*"(subscription|payment)"\s*,?\s*(?:\/\/\s*(.*))?/);
  if (m) priceMeta.set(m[1], { mode: m[2], label: (m[3] ?? "").trim() });
}

const referencedPrices = new Map<string, string[]>();
const files = [...walk(SRC_DIR), ...walk(FUNCTIONS_DIR)];
for (const file of files) {
  if (file === STRIPE_CONFIG) continue;
  const src = readSafe(file);
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const matches = lines[i].match(PRICE_ID_RE);
    if (!matches) continue;
    for (const id of matches) {
      if (!referencedPrices.has(id)) referencedPrices.set(id, []);
      referencedPrices.get(id)!.push(relative(ROOT, file));
      const meta = priceMeta.get(id);
      records.push({
        type: "priceId",
        value: id,
        file: relative(ROOT, file),
        line: i + 1,
        resolvedTarget: meta ? `${meta.mode}${meta.label ? " — " + meta.label : ""}` : undefined,
        label: meta?.label,
        status: meta ? "ok" : "missing_in_map",
      });
    }
  }
}
for (const [id, refs] of referencedPrices) {
  if (!registeredPrices.has(id)) {
    fail(
      "unregistered-price",
      `${id} referenced in ${refs.join(", ")} but missing from PRICE_MODE_MAP`,
    );
  }
}

// ─── 2. No direct buy.stripe.com links in src/ ─────────────────────────────
for (const file of walk(SRC_DIR)) {
  const src = readSafe(file);
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const hits = lines[i].match(BUY_LINK_RE);
    if (!hits) continue;
    fail(
      "direct-buy-link",
      `${relative(ROOT, file)}:${i + 1} contains direct payment link(s): ${hits.join(", ")}`,
    );
    for (const h of hits) {
      records.push({
        type: "stripe_url",
        value: h,
        file: relative(ROOT, file),
        line: i + 1,
        resolvedTarget: "external Stripe checkout (BLOCKED)",
        status: "direct_stripe_url",
      });
    }
  }
}

// ─── 3. Audit funnel entry points route to /audit/intake ───────────────────
// The buttons users click to *start* an audit must navigate to intake, not to
// landing (post-payment only) or an external Stripe URL. We check the primary
// entry surfaces.
const AUDIT_ENTRY_FILES = [
  "src/pages/AuditLanding.tsx",
  "src/pages/RentAnAgent.tsx",
  "src/pages/Advisory.tsx",
];
// Any file whose text advertises the Business Audit must reference /audit/intake
// somewhere, or explicitly not link out to payment. We enforce the negative:
// no audit-marketing file may contain a `buy.stripe.com` link or a `priceId:`
// declaration for the audit product outside the intake flow itself.
const AUDIT_PRICE_ID = "price_1Tb41PBReje0oFcLMlvzjQQa"; // AI Business Audit $47
for (const rel of AUDIT_ENTRY_FILES) {
  const src = readSafe(join(ROOT, rel));
  if (!src) continue;
  const routesIntake = src.includes("/audit/intake");
  const referencesPrice = src.includes(AUDIT_PRICE_ID);
  records.push({
    type: "audit_entry",
    value: rel,
    file: rel,
    resolvedTarget: routesIntake ? "/audit/intake" : referencesPrice ? "direct price (BLOCKED)" : "no audit CTA",
    status: referencesPrice && !routesIntake ? "bypasses_intake" : "ok",
  });
  if (referencesPrice && !routesIntake) {
    fail(
      "audit-bypass",
      `${rel} references the audit price directly without routing through /audit/intake`,
    );
  }
}

// ─── 4. Audit funnel routes exist in App.tsx ───────────────────────────────
const appSrc = readSafe(APP_TSX);
for (const route of AUDIT_FUNNEL_ROUTES) {
  // Route defined as path="/audit/intake" etc. — allow trailing slash or param.
  const re = new RegExp(`path=["']${route.replace(/\//g, "\\/")}(\\/|["'])`);
  const found = re.test(appSrc);
  // Try to extract the element after the matched path, e.g. element={<AuditIntake />}
  let element: string | undefined;
  const detailRe = new RegExp(`path=["']${route.replace(/\//g, "\\/")}[^"']*["'][^>]*element=\\{<([A-Za-z0-9_]+)`);
  const dm = appSrc.match(detailRe);
  if (dm) element = dm[1];
  records.push({
    type: "route_definition",
    value: route,
    file: "src/App.tsx",
    resolvedTarget: element ?? (found ? "(component not parsed)" : "MISSING"),
    status: found ? "ok" : "route_missing",
  });
  if (!found) {
    fail("missing-route", `App.tsx has no <Route> matching ${route}`);
  }
}

// ─── Report artifact ───────────────────────────────────────────────────────
try {
  mkdirSync(REPORTS_DIR, { recursive: true });
  const generatedAt = new Date().toISOString();
  const json = {
    generatedAt,
    summary: {
      priceIdsReferenced: referencedPrices.size,
      priceIdsRegistered: registeredPrices.size,
      failures: failures.length,
    },
    failures,
    records,
  };
  writeFileSync(join(REPORTS_DIR, "payment-links.json"), JSON.stringify(json, null, 2));

  const md: string[] = [];
  md.push(`# Payment & Audit Link Report`);
  md.push(`Generated: ${generatedAt}`);
  md.push("");
  md.push(`- Registered priceIds: **${registeredPrices.size}**`);
  md.push(`- Referenced priceIds (unique): **${referencedPrices.size}**`);
  md.push(`- Failures: **${failures.length}**`);
  md.push("");

  if (failures.length) {
    md.push(`## ❌ Failures`);
    md.push("");
    md.push(`| Rule | Detail |`);
    md.push(`| --- | --- |`);
    for (const f of failures) md.push(`| ${f.rule} | ${f.detail.replace(/\|/g, "\\|")} |`);
    md.push("");
  }

  const priceRecs = records.filter((r) => r.type === "priceId");
  if (priceRecs.length) {
    md.push(`## Price IDs (${priceRecs.length} references)`);
    md.push("");
    md.push(`| Price ID | Resolved | File | Line | Status |`);
    md.push(`| --- | --- | --- | --- | --- |`);
    for (const r of priceRecs)
      md.push(`| \`${r.value}\` | ${r.resolvedTarget ?? "—"} | ${r.file} | ${r.line ?? ""} | ${r.status} |`);
    md.push("");
  }

  const auditRecs = records.filter((r) => r.type === "audit_entry");
  if (auditRecs.length) {
    md.push(`## Audit Funnel Entry Points`);
    md.push("");
    md.push(`| File | Resolves To | Status |`);
    md.push(`| --- | --- | --- |`);
    for (const r of auditRecs) md.push(`| ${r.file} | ${r.resolvedTarget ?? "—"} | ${r.status} |`);
    md.push("");
  }

  const routeRecs = records.filter((r) => r.type === "route_definition");
  if (routeRecs.length) {
    md.push(`## Funnel Routes (App.tsx)`);
    md.push("");
    md.push(`| Route | Component | Status |`);
    md.push(`| --- | --- | --- |`);
    for (const r of routeRecs) md.push(`| ${r.value} | ${r.resolvedTarget ?? "—"} | ${r.status} |`);
    md.push("");
  }

  const stripeUrlRecs = records.filter((r) => r.type === "stripe_url");
  if (stripeUrlRecs.length) {
    md.push(`## Direct Stripe URLs (should be empty)`);
    md.push("");
    md.push(`| URL | File | Line |`);
    md.push(`| --- | --- | --- |`);
    for (const r of stripeUrlRecs) md.push(`| ${r.value} | ${r.file} | ${r.line ?? ""} |`);
    md.push("");
  }

  writeFileSync(join(REPORTS_DIR, "payment-links.md"), md.join("\n"));
  console.log(`  report: reports/payment-links.md (+ .json)`);
} catch (e) {
  console.error(`  warning: failed to write report artifact: ${(e as Error).message}`);
}

// ─── Console summary ───────────────────────────────────────────────────────
if (failures.length === 0) {
  const priceCount = referencedPrices.size;
  console.log(
    `✓ payment-links: ${priceCount} priceIds registered, no direct buy.stripe.com links, audit funnel intact.`,
  );
  process.exit(0);
}

console.error("✗ payment-links check failed:\n");
for (const f of failures) {
  console.error(`  [${f.rule}] ${f.detail}`);
}
console.error(`\n${failures.length} issue(s) found.`);
process.exit(1);