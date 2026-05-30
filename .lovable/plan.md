# Coach Kay / FocusFlow AI — Brand Spec for Embedded Tools

Goal: give you a single self-contained spec so a new tool (Custom GPT Agents offer) can be built standalone and dropped into the site without visual seams.

## 1. What I'll produce

A new file `docs/BRAND_SPEC.md` containing everything below, plus a tiny `public/brand/coachkay-tokens.css` you can `<link>` into any standalone HTML/React tool to inherit the exact tokens. Nothing else in the app changes.

## 2. Brand essence

- Name lockup: `Focus` (gold) + `Flow` (cream) + `AI` (gold), serif, light weight. Optional tagline "by Coach Kay" in body font, muted.
- Vibe: cinematic, sci-fi, premium-coaching. Deep navy stage, gold as the only accent, cream as the voice. No second accent color anywhere.
- Energy: calm authority, not hype. Slow ambient motion, sharp gold hairlines, generous spacing.

## 3. Color tokens (HSL, exact values from `src/index.css`)

Surfaces
- `--background` 210 52% 11% (navy)
- `--navy-deep` 210 55% 8%
- `--navy` 210 52% 11%
- `--navy-light` / `--card` 210 45% 16%
- `--muted` 210 35% 22%
- `--border` / `--input` 210 30% 24%

Text
- `--foreground` / `--cream` 45 65% 90%
- `--muted-foreground` 45 25% 70%

Accent
- `--primary` / `--gold` / `--ring` 43 53% 54%
- `--gold-light` / `--accent` 43 50–48% 60–70%
- Glow color used throughout: `hsl(43 75% 52% / 0.06–0.3)`

Pillars (only if the tool references F.O.C.U.S.):
- F 43 53% 54% · O 213 49% 53% · C 269 30% 51% · U 156 56% 40% · S 339 58% 58%

Rules
- All colors HSL, applied as `hsl(var(--token))`.
- Never use raw `text-white` / `bg-black`. Use `bg-background`, `text-foreground`, `bg-card`, `text-primary`, `border-border`.
- Gold is sacred: one accent per view, used for CTAs, key numbers, hairlines, focus rings.

## 4. Typography

- Headings: `'Cormorant Garamond', serif`, weight 300–400. Loaded via `<link>` in `index.html`.
- Body: `'DM Sans', sans-serif`.
- Mono / labels: `'DM Mono', monospace`, uppercase, `letter-spacing: 0.08em`, 0.75rem — the "font-mono-label" pattern for kickers/eyebrows.
- Prose inside chat-like surfaces: `.coach-prose` (DM Sans body, Cormorant headings).

## 5. Layout & spacing

- Tailwind container: centered, `padding: 2rem`, max `1400px` at 2xl.
- Radius scale from `--radius: 0.5rem` (lg = 0.5rem, md = calc-2px, sm = calc-4px).
- Card pattern: `bg-card border border-border rounded-lg p-6 md:p-8` with optional `.clarity-card` hover (lift 6px + gold sweep line + soft gold shadow).
- Section rhythm: `py-20 md:py-28`, headings centered or left-aligned with a gold hairline divider beneath.

## 6. Motion language (CSS-only, no libraries)

Strict rule: no Framer/GSAP/Three.js. Use these keyframes that already ship:
- `animate-blur-in`, `animate-fade-up`, `animate-section-reveal` — entry
- `animate-underline-draw`, `animate-gold-line` — gold hairline reveals
- `animate-pulse-glow` — gold ambient pulse on hero/CTA accents
- `animate-float-1/2/3`, `animate-brand-pulse`, `animate-spin-slow` — ambient background orbs
- `animate-question-enter/exit`, `animate-celebration` — chat/step transitions
- `.grain-overlay`, `.grid-overlay`, `.mouse-glow` — fixed ambient layers
- All animations respect `prefers-reduced-motion`.

## 7. Component patterns to mirror

- Eyebrow: `font-mono-label text-primary` above every section title.
- Section title: `font-heading text-4xl md:text-6xl font-light text-foreground`, followed by a 1px gold hairline `bg-primary/60 w-16 h-px`.
- Primary CTA: shadcn Button default (uses `--primary` + `--primary-foreground`), with the global `.bg-primary` hover (scale 1.02 + brightness 1.08).
- Ghost/outline CTA: subtle scale 1.01 on hover (already global).
- Focus ring: 2px gold ring on dark background — already enforced sitewide via `:focus-visible`.

## 8. Standalone embed kit

`public/brand/coachkay-tokens.css` will contain:
- `:root` block with every token in section 3
- `@font-face`-equivalent `<link>` snippet (Cormorant Garamond, DM Sans, DM Mono) to paste into `<head>`
- Base body styles (bg/foreground/font), heading font rule, focus-visible rule
- The animation keyframes + utility classes from section 6
- The `.grain-overlay`, `.mouse-glow`, `.font-mono-label`, `.clarity-card`, `.coach-prose` helpers

Any standalone tool (raw HTML, a separate React app, an iframe widget) that includes this file + the three Google Fonts link will look identical to the main site without copying Tailwind config.

## 9. Out of scope

- No changes to existing pages, routes, components, or content.
- No new offer page yet — that comes after you decide whether to replace the current page. This spec just makes either path safe.

## 10. Deliverables checklist

1. `docs/BRAND_SPEC.md` — the human-readable spec above.
2. `public/brand/coachkay-tokens.css` — drop-in token + motion sheet.
3. Short README note at the top of the CSS file telling future-you (or any embedded tool) the two `<link>` tags to add.
