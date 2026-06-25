# FocusFlow AI by Coach Kay — Brand Spec

Self-contained reference for building standalone tools (Custom GPT agents,
iframe widgets, partner pages) that look and feel native to the main site.

Drop-in stylesheet: `/brand/coachkay-tokens.css` (served from `public/brand/`).

---

## 1. Brand essence

- **Name lockup:** `Focus` (gold) + `Flow` (cream) + `AI` (gold), serif, light weight. Optional tagline "by Coach Kay" in body font, muted.
- **Vibe:** cinematic, sci-fi, premium-coaching. Deep navy stage, gold as the only accent, cream as the voice. **No second accent color anywhere.**
- **Energy:** calm authority, not hype. Slow ambient motion, sharp gold hairlines, generous spacing.

## 2. Color tokens (HSL)

All colors are HSL components, applied as `hsl(var(--token))` or `hsl(var(--token) / <alpha>)`.

### Surfaces
| Token | HSL | Use |
|---|---|---|
| `--background` | `210 52% 11%` | Page background (navy) |
| `--navy-deep` | `210 55% 8%` | Sidebar / deepest surface |
| `--navy` | `210 52% 11%` | Alias of background |
| `--navy-light` / `--card` | `210 45% 16%` | Card surface |
| `--muted` | `210 35% 22%` | Subtle fill |
| `--border` / `--input` | `210 30% 24%` | All borders |

### Text
| Token | HSL | Use |
|---|---|---|
| `--foreground` / `--cream` | `45 65% 90%` | Primary text |
| `--muted-foreground` | `45 25% 70%` | Secondary text |

### Accent (gold — sacred)
| Token | HSL | Use |
|---|---|---|
| `--primary` / `--gold` / `--ring` | `43 53% 54%` | CTAs, numbers, hairlines, focus rings |
| `--gold-light` | `43 50% 70%` | Hover/active accent |
| `--accent` | `43 48% 60%` | Soft gold fill |
| Glow | `hsl(43 75% 52% / 0.06–0.3)` | Hero pulses and hover shadows |

### F.O.C.U.S. pillars (only if referenced)
- F `43 53% 54%` · O `213 49% 53%` · C `269 30% 51%` · U `156 56% 40%` · S `339 58% 58%`

### Rules
- All colors HSL. Never use raw `text-white` / `bg-black` / hex literals in components.
- One accent per view. Gold owns: CTAs, key numbers, 1px hairlines, focus rings.
- Destructive only when something is actually destructive.

## 3. Typography

- **Headings:** `'Cormorant Garamond', serif`, weight 300–400.
- **Body:** `'DM Sans', sans-serif`.
- **Mono / labels:** `'DM Mono', monospace`, uppercase, `letter-spacing: 0.08em`, `0.75rem` — the eyebrow/kicker pattern (`.font-mono-label`).
- **Prose surfaces:** `.coach-prose` (DM Sans body, Cormorant headings) for chat / long-form.

Fonts are loaded via `<link>` to Google Fonts in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap"
  rel="stylesheet"
>
```

## 4. Layout & spacing

- Container: centered, `padding: 2rem`, max `1400px` at 2xl.
- Radius scale from `--radius: 0.5rem` (lg = 0.5rem, md = calc-2px, sm = calc-4px).
- Card pattern: `bg-card border border-border rounded-lg p-6 md:p-8`, optionally with `.clarity-card` for the lift + gold sweep hover.
- Section rhythm: `py-20 md:py-28`. Section heading is centered or left-aligned with a 1px gold hairline (`bg-primary/60 w-16 h-px`) beneath.

## 5. Motion language (CSS-only, no libraries)

**Strict rule:** no Framer Motion, no GSAP, no Three.js. Only the shipped CSS keyframes + IntersectionObserver where needed.

| Class | Purpose |
|---|---|
| `animate-blur-in` | Hero entry (opacity + blur + translateY) |
| `animate-fade-up` | Generic entry (subtle) |
| `animate-section-reveal` | Section-scoped entry |
| `animate-underline-draw` / `animate-gold-line` | Gold hairline reveal |
| `animate-pulse-glow` | Ambient gold pulse on hero / CTA accents |
| `animate-float-1/2/3`, `animate-brand-pulse`, `animate-spin-slow` | Ambient background orbs |
| `animate-question-enter` / `animate-question-exit` | Chat / step transitions |
| `animate-celebration` | Success / milestone |
| `.grain-overlay`, `.grid-overlay`, `.mouse-glow` | Fixed ambient layers |

All animations respect `@media (prefers-reduced-motion: reduce)`.

## 6. Component patterns

- **Eyebrow:** `<span className="font-mono-label text-primary">SECTION KICKER</span>`
- **Section title:** `<h2 className="font-heading text-4xl md:text-6xl font-light text-foreground">…</h2>` followed by `<div className="bg-primary/60 w-16 h-px mt-4" />`.
- **Primary CTA:** shadcn `<Button>` default (uses `--primary` + `--primary-foreground`). Hover: scale 1.02 + brightness 1.08 (global rule on `.bg-primary`).
- **Ghost/outline CTA:** subtle scale 1.01 on hover (global).
- **Focus ring:** 2px gold ring on background — already enforced sitewide via `:focus-visible`.
- **Card hover:** add `.clarity-card` to get lift 6px + gold sweep line + soft gold shadow.

## 7. Embedding a standalone tool

Two ways:

### A. Same-origin React route inside this app
The tool inherits everything automatically. Just use the semantic classes (`bg-background`, `text-foreground`, `bg-card`, `text-primary`, `border-border`, `font-heading`, `font-mono-label`, etc.).

### B. Standalone HTML / external app / iframe
1. Add the Google Fonts `<link>` block from section 3 to `<head>`.
2. Add `<link rel="stylesheet" href="https://coachkayai.life/brand/coachkay-tokens.css" />`.
3. Apply `bg-background text-foreground` on `<body>` (or copy the body rules — they're in the stylesheet).
4. Use the tokens via `hsl(var(--primary))` etc. or the helper classes (`.font-mono-label`, `.clarity-card`, `.coach-prose`, `.grain-overlay`, `.mouse-glow`).

If the tool is iframed, set the iframe `background-color: hsl(210 52% 11%)` on the host so any loading flash matches.

## 8. Do / Don't

**Do**
- Stick to one accent (gold).
- Use serif Cormorant for headings, DM Sans for body, DM Mono uppercase for eyebrows.
- Use 1px gold hairlines instead of borders for emphasis.
- Lean into ambient motion (floating orbs, mouse glow, grain) at low intensity.
- Respect reduced-motion.

**Don't**
- Introduce a second accent color (purple, teal, etc.) outside the pillar tokens.
- Use Framer Motion / GSAP / Three.js.
- Use raw hex in components — always tokens.
- Use heavy shadows or vibrant gradients. Glow is gold-on-navy only.
- Render generic AI Sparkles icon as the brand mark.

---

_Last updated alongside `public/brand/coachkay-tokens.css`. If you change a token in `src/index.css`, mirror it in both files._