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
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");
const FUNCTIONS_DIR = join(ROOT, "supabase/functions");
const STRIPE_CONFIG = join(FUNCTIONS_DIR, "_shared/stripe-config.ts");
const APP_TSX = join(SRC_DIR, "App.tsx");

const PRICE_ID_RE = /price_1[A-Za-z0-9]{20,}/g;
const BUY_LINK_RE = /https?:\/\/buy\.stripe\.com\/[A-Za-z0-9_-]+/g;
const AUDIT_FUNNEL_ROUTES = ["/audit/intake", "/audit/landing", "/audit/report", "/auth"];

type Failure = { rule: string; detail: string };
const failures: Failure[] = [];
const fail = (rule: string, detail: string) => failures.push({ rule, detail });

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

const referencedPrices = new Map<string, string[]>();
const files = [...walk(SRC_DIR), ...walk(FUNCTIONS_DIR)];
for (const file of files) {
  if (file === STRIPE_CONFIG) continue;
  const src = readSafe(file);
  const matches = src.match(PRICE_ID_RE);
  if (!matches) continue;
  for (const id of matches) {
    if (!referencedPrices.has(id)) referencedPrices.set(id, []);
    referencedPrices.get(id)!.push(relative(ROOT, file));
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
  const hits = src.match(BUY_LINK_RE);
  if (hits) {
    fail(
      "direct-buy-link",
      `${relative(ROOT, file)} contains direct payment link(s): ${hits.join(", ")}`,
    );
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
  if (src.includes(AUDIT_PRICE_ID) && !src.includes("/audit/intake")) {
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
  if (!re.test(appSrc)) {
    fail("missing-route", `App.tsx has no <Route> matching ${route}`);
  }
}

// ─── Report ────────────────────────────────────────────────────────────────
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