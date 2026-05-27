import { test, expect } from "../playwright-fixture";

/**
 * Visual regression: every OfferCard on the site must stay in perfect
 * symmetry within its grid row — matching heights and bottom-anchored CTAs —
 * on both mobile and desktop viewports.
 *
 * Cards are tagged with `data-offer-card` in src/components/offers/OfferCard.tsx.
 * Pages migrated to OfferCard: PricingSection (Index), CollectiveAIBuildStudio,
 * Store (PackageCard + AddonCard), Modules (ProgramCard).
 */

const ROUTES = [
  { path: "/", label: "Pricing (Index)" },
  { path: "/collective-ai-build-studio", label: "Build Studio" },
  { path: "/store", label: "Book Store" },
  { path: "/modules", label: "Modules / Programs" },
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 900 },
];

// Cards within the same horizontal row should be within this many px of each
// other in height and CTA-bottom. Allows for sub-pixel layout rounding.
const PX_TOLERANCE = 2;

interface CardRect {
  top: number;
  bottom: number;
  height: number;
  ctaBottom: number | null;
}

async function readCardRects(page: import("@playwright/test").Page): Promise<CardRect[]> {
  return await page.$$eval("[data-offer-card]", (nodes) =>
    nodes.map((el) => {
      const rect = el.getBoundingClientRect();
      // The last button/anchor inside the card is the primary CTA (or the only
      // CTA on info-only cards, which is null).
      const ctas = el.querySelectorAll<HTMLElement>("a, button");
      const lastCta = ctas[ctas.length - 1] ?? null;
      const ctaRect = lastCta?.getBoundingClientRect() ?? null;
      return {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        height: rect.height,
        ctaBottom: ctaRect ? ctaRect.bottom + window.scrollY : null,
      };
    }),
  );
}

/**
 * Group cards into rows by tops within 8px of each other, since flex/grid
 * wrapped rows share a common top edge.
 */
function groupByRow(cards: CardRect[]): CardRect[][] {
  const sorted = [...cards].sort((a, b) => a.top - b.top);
  const rows: CardRect[][] = [];
  for (const c of sorted) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(row[0].top - c.top) <= 8) {
      row.push(c);
    } else {
      rows.push([c]);
    }
  }
  return rows;
}

for (const route of ROUTES) {
  test.describe(`OfferCard symmetry — ${route.label}`, () => {
    for (const vp of VIEWPORTS) {
      test(`${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route.path);
        // Give the page a moment to settle (lazy images, AnimatedSection fades).
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(400);

        const cards = await readCardRects(page);
        if (cards.length === 0) {
          test.skip(true, `No offer cards found on ${route.path}`);
          return;
        }

        const rows = groupByRow(cards);

        for (const [i, row] of rows.entries()) {
          if (row.length < 2) continue; // single-card rows are trivially symmetric

          // 1. Equal heights — strongest geometry guarantee from OfferCard's h-full.
          const heights = row.map((c) => c.height);
          const maxH = Math.max(...heights);
          const minH = Math.min(...heights);
          expect(
            maxH - minH,
            `${route.label} ${vp.name}: row ${i} heights drift ${maxH - minH}px (${heights.join(", ")})`,
          ).toBeLessThanOrEqual(PX_TOLERANCE);

          // 2. Bottom edges aligned (cards in same row share baseline).
          const bottoms = row.map((c) => c.bottom);
          expect(
            Math.max(...bottoms) - Math.min(...bottoms),
            `${route.label} ${vp.name}: row ${i} bottoms drift`,
          ).toBeLessThanOrEqual(PX_TOLERANCE);

          // 3. CTAs anchored to bottom of card — when present on every card in the row.
          const ctaBottoms = row.map((c) => c.ctaBottom).filter((b): b is number => b !== null);
          if (ctaBottoms.length === row.length) {
            expect(
              Math.max(...ctaBottoms) - Math.min(...ctaBottoms),
              `${route.label} ${vp.name}: row ${i} CTA bottoms drift`,
            ).toBeLessThanOrEqual(PX_TOLERANCE);
          }
        }
      });
    }
  });
}
