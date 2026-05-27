import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Static-analysis regression check.
 *
 * Locked-symmetry only works when the grid wrapper around <OfferCard>
 * siblings declares `items-stretch`. Without it, sibling cards collapse
 * to their intrinsic height and the row goes uneven.
 *
 * This test walks the source tree, finds every JSX site that renders an
 * OfferCard (directly or via a known wrapper component), and asserts the
 * nearest enclosing grid className contains `items-stretch`.
 *
 * If you add a new offer-card grid somewhere, this test will fail with a
 * pointer to the file:line so you remember `items-stretch`.
 */

const SRC_ROOT = join(process.cwd(), "src");

// Files that DEFINE the wrapper components — they render <OfferCard> but
// are not themselves consumed inside a grid in the same file.
const DEFINITION_FILES = new Set(
  [
    "src/components/offers/OfferCard.tsx",
    "src/components/offers/OfferCard.symmetry.test.tsx",
    "src/components/offers/OfferCard.gridUsage.test.ts",
    "src/components/ProgramCard.tsx",
    "src/components/store/PackageCard.tsx",
    "src/components/store/AddonCard.tsx",
  ].map((p) => p.replace(/\//g, require("node:path").sep)),
);

const OFFER_COMPONENT_RE =
  /<\s*(OfferCard|ProgramCard|PackageCard|AddonCard|AutismOfferCard)\b/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else if (full.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

interface Violation {
  file: string;
  line: number;
  reason: string;
}

/** Scan backwards from a render site to find the nearest enclosing className containing `grid-cols` or starting with `grid `. */
function findEnclosingGridClassName(
  lines: string[],
  startIndex: number,
): { line: number; text: string } | null {
  // Look up to 40 lines back — enough for any reasonable JSX wrapper.
  const stop = Math.max(0, startIndex - 40);
  for (let i = startIndex; i >= stop; i--) {
    const ln = lines[i];
    if (!/className=/.test(ln)) continue;
    if (/\bgrid-cols-/.test(ln) || /\bgrid\s/.test(ln) || /getSymmetricGridClass\b/.test(ln) || /getSymmetricPricingGridClass\b/.test(ln)) {
      return { line: i + 1, text: ln };
    }
  }
  return null;
}

describe("OfferCard grid usage", () => {
  it("every offer-card grid declares items-stretch", () => {
    const files = walk(SRC_ROOT);
    const violations: Violation[] = [];

    for (const absPath of files) {
      const rel = relative(process.cwd(), absPath);
      if (DEFINITION_FILES.has(rel)) continue;

      const src = readFileSync(absPath, "utf8");
      if (!OFFER_COMPONENT_RE.test(src)) continue;

      const lines = src.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (!OFFER_COMPONENT_RE.test(lines[i])) continue;
        const grid = findEnclosingGridClassName(lines, i);
        if (!grid) {
          // No enclosing grid within scan window — probably a single-card layout. Skip.
          continue;
        }
        if (!/items-stretch/.test(grid.text)) {
          violations.push({
            file: rel,
            line: grid.line,
            reason: `Grid wrapping ${lines[i].trim().slice(0, 60)}… is missing items-stretch`,
          });
        }
      }
    }

    if (violations.length > 0) {
      const msg = violations
        .map((v) => `  ${v.file}:${v.line} — ${v.reason}`)
        .join("\n");
      throw new Error(
        `Offer-card grids without items-stretch (breaks symmetric heights):\n${msg}`,
      );
    }
    expect(violations).toHaveLength(0);
  });
});