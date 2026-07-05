/**
 * Catalog ↔ Stripe-config sync guard.
 *
 * Every Stripe price ID referenced anywhere in the frontend must be
 * registered in PRICE_MODE_MAP (supabase/functions/_shared/stripe-config.ts),
 * because create-checkout rejects any priceId not in that map.
 *
 * This test exists because the $47 AI Business Audit price was referenced in
 * AuditIntake.tsx but missing from PRICE_MODE_MAP, which made every audit
 * checkout fail with "Invalid priceId" before reaching Stripe.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { PRICE_MODE_MAP } from "../../supabase/functions/_shared/stripe-config";

const SRC_ROOT = join(__dirname, "..");
const PRICE_ID_RE = /price_1[A-Za-z0-9]{22,}/g;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.(test|spec)\./.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function collectPriceIds(): Map<string, string[]> {
  const found = new Map<string, string[]>();
  for (const file of walk(SRC_ROOT)) {
    const matches = readFileSync(file, "utf8").match(PRICE_ID_RE);
    if (!matches) continue;
    for (const id of matches) {
      const files = found.get(id) ?? [];
      if (!files.includes(file)) files.push(file);
      found.set(id, files);
    }
  }
  return found;
}

describe("catalog price sync", () => {
  const referenced = collectPriceIds();

  it("finds price IDs in the frontend (sanity check)", () => {
    expect(referenced.size).toBeGreaterThan(10);
  });

  it("every frontend price ID is registered in PRICE_MODE_MAP", () => {
    const missing: string[] = [];
    for (const [id, files] of referenced) {
      if (!(id in PRICE_MODE_MAP)) {
        missing.push(`${id} (referenced in: ${files.map((f) => f.replace(SRC_ROOT, "src")).join(", ")})`);
      }
    }
    expect(missing, `Price IDs missing from PRICE_MODE_MAP — create-checkout will reject these:\n${missing.join("\n")}`).toEqual([]);
  });

  it("the $47 AI Business Audit price stays registered (regression pin)", () => {
    expect(PRICE_MODE_MAP["price_1Tb41PBReje0oFcLMlvzjQQa"]).toBe("payment");
  });
});
