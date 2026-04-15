

# Generate OG Image PNG + Update References

## What This Does
Creates a proper 1200x630 PNG Open Graph image matching your existing SVG design, then updates all references so social media platforms render it correctly (many platforms don't support SVG for OG images).

## Steps

### 1. Generate the PNG image
Use a Python script (Pillow) to render a 1200x630 PNG with:
- Dark navy background (`#0d1520`)
- "FocusFlow" in gold serif (`#c9a227`), centered, large
- "BY COACH KAY" in muted gold (`#8a7a5a`), letter-spaced
- "See clearly. Move with purpose." in cream (`#e8d5a3`)
- Gold horizontal line separator
- Save to `public/og-image.png`

### 2. Update 3 file references
| File | Change |
|------|--------|
| `index.html` line 16 | `og-image.svg` → `og-image.png` |
| `index.html` line 19 | `og-image.svg` → `og-image.png` |
| `src/components/SEOHead.tsx` line 18 | `og-image.svg` → `og-image.png` |

### Regarding Supabase Access
This project runs on **Lovable Cloud** — there is no separate Supabase dashboard to visit. All database tables, edge functions, and auth are managed automatically within Lovable. You don't need to log into any external Supabase account. Everything for this project is fully isolated and self-contained here.

