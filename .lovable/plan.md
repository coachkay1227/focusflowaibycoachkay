
## Goal

Launch a new revenue-generating page at `/collective-ai-build-studio` that productizes Coach Kay's AI-leveraged build services. Same brand DNA (cinematic navy + gold, Cormorant + DM Sans, pure-CSS animation) as the rest of the site. Hybrid lead flow: Stripe checkout for low-ticket and recurring; qualified application form for $2K+ builds.

## Positioning

- **Brand:** Collective AI Build Studio (sub-line: *"where vision meets velocity"*)
- **Hero promise:** *"From idea to live in days. From launch to scale on autopilot."*
- **Why "Collective":** ladders into existing Collective AI Summit + cohorts; positions Coach Kay + AI agents + customer as a tribe, not a vendor relationship; pre-frames the AI-leveraged delivery model so no one feels duped
- **Differentiator copy on page:** *"What agencies build in 4 months, the Collective ships in 14 days — because we build with AI, not around it."*

## Page structure (`/collective-ai-build-studio`)

```text
┌─────────────────────────────────────────────┐
│ 1. HERO — headline + sub + dual CTA         │
│    (Start a build • Book strategy call)     │
├─────────────────────────────────────────────┤
│ 2. MANIFESTO STRIP — 3 pillars              │
│    Speed · Systems · Sovereignty            │
├─────────────────────────────────────────────┤
│ 3. WHAT WE BUILD — tier tabs                │
│    Quick Wins | Business Builds |           │
│    Custom AI Apps | Care Plans              │
├─────────────────────────────────────────────┤
│ 4. THE PROCESS — Brief→Build→Launch→Care    │
├─────────────────────────────────────────────┤
│ 5. RECURRING CARE — pricing cards (MRR)     │
├─────────────────────────────────────────────┤
│ 6. APPLICATION FORM — for Tier 2+ builds    │
├─────────────────────────────────────────────┤
│ 7. FAQ — AI ownership, revisions, timeline  │
│ 8. FINAL CTA + "by invitation" enterprise   │
└─────────────────────────────────────────────┘
```

## Offer catalog (lives in `src/lib/build-studio-catalog.ts`)

**Tier 1 — Quick Wins (Stripe checkout, instant buy)**
| Offer | Price | Turnaround |
|---|---|---|
| Conversion landing page | $497 | 72 hr |
| Link-in-bio / creator hub | $297 | 48 hr |
| Lead magnet + opt-in funnel | $697 | 5 days |
| AI chatbot widget (setup) | $797 + $47/mo care | 5 days |
| Personal brand / resume site | $397 | 72 hr |

**Tier 2 — Business Builds (Application required)**
| Offer | Price | Turnaround |
|---|---|---|
| Full marketing site (5–8 pp, CMS, SEO) | $2,497 | 2 wk |
| Lead-gen tool / AI quiz funnel | $2,497 | 2 wk |
| E-commerce store | $2,997 | 2 wk |
| Client portal / dashboard | $3,497 | 2–3 wk |
| Course / membership platform | $3,997 | 3 wk |
| Internal ops dashboard | $3,997 | 3 wk |

**Tier 3 — Custom AI Apps (Application required)**
| Offer | Price | Turnaround |
|---|---|---|
| AI tool / SaaS MVP | $7,997–$14,997 | 3–4 wk |
| Multi-agent workflow system | $9,997 | 4 wk |
| Industry-specific AI assistant | $9,997+ | 4 wk |
| White-label coaching platform | $12,997 | 4 wk |

**Tier 5 — Recurring Care (Stripe checkout, monthly subscription)**
| Plan | Price | Includes |
|---|---|---|
| Site Care | $97/mo | Hosting, updates, small edits |
| Agent Care | $197/mo | Monitoring, prompt tuning, model updates |
| Build Credits | $497/mo | 4 hrs banked build time |
| Collective Membership | $97/mo | Templates, office hours, build queue priority |

**By invitation (footer line, no checkout):** Fractional AI Product Lead ($4,997/mo), Enterprise build pods ($25K+), Equity builds.

## Technical implementation

### Files to create
- `src/pages/CollectiveAIBuildStudio.tsx` — the page (sections 1–8)
- `src/lib/build-studio-catalog.ts` — offer data (mirrors `offer-catalog.ts` pattern)
- `src/components/build-studio/BuildTierTabs.tsx` — Tier 1/2/3/Care tabbed grid
- `src/components/build-studio/BuildApplicationDialog.tsx` — Tier 2+ qualification form (reuses `OfferInquiryDialog` pattern, adds project-type + budget fields)
- `src/components/build-studio/CarePlanCard.tsx` — recurring subscription card
- `supabase/functions/build-studio-inquiry/index.ts` — new edge function that writes to a new `build_inquiries` table + sends notification email to `hello@coachkayelevates.org`
- `supabase/functions/_shared/transactional-email-templates/build-studio-inquiry-received.tsx` — customer confirmation email (hybrid brand header, navy palette, matches autism template pattern)
- New migration: `build_inquiries` table (id, name, email, company, project_type, tier, budget_range, timeline, notes, status, created_at) + GRANTs + RLS (insert public, select admin)

### Files to update
- `src/App.tsx` — add `/collective-ai-build-studio` route
- `src/components/DesktopNav.tsx` + `MobileNav.tsx` — add nav link under "Services" or "Build"
- `src/lib/stripe-tiers.ts` — register new Tier 1 product/price IDs and Care subscription IDs (after Stripe products are created)
- `supabase/functions/create-checkout/index.ts` — accept new `build_studio_*` price IDs
- `supabase/functions/stripe-webhook/index.ts` — handle new `build-studio` line items → send `build-studio-purchase-confirmation` email + create row in `build_inquiries` with status `paid`
- `supabase/functions/_shared/transactional-email-templates/registry.ts` — register the two new templates
- `src/pages/admin/AdminDashboard.tsx` + `AdminNav.tsx` — add "Build Inquiries" admin route
- New page: `src/pages/admin/AdminBuildInquiries.tsx` (mirrors `AdminAutismOrders.tsx`)
- `public/sitemap.xml` + `scripts/check-seo-regressions.ts` — register new route
- `src/lib/seo-schema.ts` — add Service schema for the studio offers

### Stripe products to create (via `stripe--create_stripe_product_and_price`)
Tier 1 — 5 one-time prices ($297, $397, $497, $697, $797)
Tier 5 — 4 monthly recurring prices ($97×2, $197, $497)

Tier 2/3 stay application-only (no Stripe products until scope confirmed per deal).

### SEO
- Title: *Collective AI Build Studio — From Idea to Live in Days*
- Meta: *Custom AI websites, dashboards, lead-gen tools, and SaaS apps built in days, not months. Productized AI build studio by Coach Kay.*
- JSON-LD: `Service` schema with `offers` array reflecting the catalog
- Canonical: `/collective-ai-build-studio`

## Out of scope (call out if you want them in)

- Actually building the showcase/case-study assets (slot is stubbed until real builds ship)
- Stripe products for Tier 2/3 (application-only for now)
- White-label reseller program ($1,997/mo — flagged for v2)
- Auto-assigning a project Trello/Notion board on Tier 1 purchase (manual for now)
- Updating `coachkayai.life` nav across other landing surfaces beyond the main nav
