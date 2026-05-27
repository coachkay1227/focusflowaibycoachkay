/**
 * Picks a symmetric Tailwind grid class for a given card count.
 *
 * Rules:
 * - 1 card  -> single column, centered
 * - 2 cards -> 2-up desktop, 1-up mobile
 * - 3 cards -> 3-up desktop, 1-up mobile
 * - 4 cards -> 2x2 desktop (NEVER 3+1)
 * - 5 cards -> 3-up with last row centered via `justify-center` wrapper (caller may add)
 * - 6+      -> 3-up desktop, 1-up mobile
 *
 * Mobile is always 1 per row so content flows 1/1/1.
 */
export function getSymmetricGridClass(count: number): string {
  if (count <= 1) return "grid grid-cols-1 max-w-md mx-auto";
  if (count === 2) return "grid grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto";
  if (count === 4) return "grid grid-cols-1 sm:grid-cols-2 max-w-5xl mx-auto";
  // 3, 5, 6+
  return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

/**
 * Returns true when a grid of `count` cards should center the last row
 * (e.g. 5 cards on a 3-up grid leaves 2 orphans in the last row).
 * Use with `[&>*:nth-last-child(-n+2)]:lg:col-start-auto` patterns,
 * or wrap last-row items in a centered flex.
 */
export function hasOrphanRow(count: number): boolean {
  return count === 5;
}