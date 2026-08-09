# Retitle: "AI Transformation Coach"

Drop "Life" from the public title everywhere. Your life coaching certifications still show as credentials, just not in the title.

## Changes

- `src/components/BrandLogo.tsx` — tagline under the logo becomes "AI Transformation Coach".
- `public/og-image.svg` — social preview line becomes "AI TRANSFORMATION COACH".
- `src/pages/CoachKay.tsx` — page SEO title, H1, subtitle line, and the portrait alt text all become "AI Transformation Coach". The credential badge stays "5x Certified Life Coach".
- `src/pages/AITaskForce.tsx` — convener bio opens with "AI Transformation Coach, 5x Certified Life Coach, Certified AI Prompt Engineer, and CPD-Accredited AI Consultant".
- `src/pages/Community.tsx` — the role line under your name becomes "AI Transformation Coach".

## Left alone

- Program and cohort names that legitimately contain "Life Transformation" (8-Week Life Transformation Intensive, the legacy Stripe tier, migration defaults) stay as-is so existing records and checkout keep working.
- README description stays product-level, not a title claim.

## Verify

Clean build, then confirm the header tagline, `/coach-kay`, `/ai-task-force`, and `/community` all read "AI Transformation Coach".