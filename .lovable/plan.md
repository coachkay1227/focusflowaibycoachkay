## Fix Private Partnership card size

The "6-Month Private Transformation Partnership" card renders tall and narrow because the `centerSingle` group uses `max-w-md mx-auto md:grid-cols-1 lg:grid-cols-1`, forcing the card into a single skinny column.

**Change in `src/components/PricingSection.tsx`:**

Replace the `centerSingle` wrapper classes so the single card matches the width of one card in the 3-up grids above it (same column width, same padding, same card height feel).

- Swap `max-w-md mx-auto md:grid-cols-1 lg:grid-cols-1` for a centered single-column grid sized to one third of the 3-up grid: `max-w-sm mx-auto` (matches the ~1/3 width of the `max-w-6xl` container minus gaps) while keeping `grid-cols-1`.
- Alternative if you prefer it visually identical to the 3-up card width: keep the parent `lg:grid-cols-3` and place the single card in the middle column via `lg:col-start-2`.

Recommended: use `lg:col-start-2` approach so the card is exactly the same width as the cards above (no guessing at max-w).

**No other files touched.** Pure presentation change.
