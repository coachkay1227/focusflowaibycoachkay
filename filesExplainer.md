# FocusFlow AI — File Explainer

> 🟢 = High importance (10+ imports) · 🟡 = Medium (3–9 imports) · 🔴 = Low (0–2 imports)

---

## Root

| File | Purpose |
|------|---------|
| 🟡 `index.html` | Entry HTML with SEO meta tags, Open Graph, and JSON-LD structured data |
| 🟡 `package.json` | Dependencies, scripts, and project metadata |
| 🔴 `components.json` | shadcn/ui configuration (style, aliases, Tailwind setup) |
| 🟡 `tailwind.config.ts` | Tailwind CSS theme customization (colors, animations, fonts) |
| 🔴 `postcss.config.js` | PostCSS plugins (Tailwind, Autoprefixer) |
| 🔴 `vite.config.ts` | Vite build config with React SWC plugin and path aliases |
| 🔴 `vitest.config.ts` | Vitest test runner configuration |
| 🔴 `eslint.config.js` | ESLint flat config for React + TypeScript |
| 🔴 `tsconfig.json` | Root TypeScript config (references app + node) |
| 🔴 `tsconfig.app.json` | App-level TS config with path aliases |
| 🔴 `tsconfig.node.json` | Node-level TS config for Vite |
| 🔴 `vercel.json` | Vercel deployment headers (CSP, HSTS, X-Frame-Options) |
| 🔴 `playwright.config.ts` | Playwright E2E test configuration |
| 🔴 `playwright-fixture.ts` | Playwright test fixture setup |
| 🔴 `README.md` | Project documentation and setup instructions |
| 🔴 `filesExplainer.md` | This file — project file reference |

---

## `public/`

| File | Purpose |
|------|---------|
| 🔴 `placeholder.svg` | Default placeholder image for missing assets |
| 🔴 `robots.txt` | Search engine crawler directives |
| 🔴 `sitemap.xml` | XML sitemap for SEO indexing |

---

## `src/`

### Entry & App Shell

| File | Purpose |
|------|---------|
| 🟡 `main.tsx` | React root render with HelmetProvider |
| 🟡 `App.tsx` | Router, providers (Auth, Query, Tooltip), all route definitions |
| 🔴 `App.css` | Minimal global CSS overrides |
| 🟢 `index.css` | Design system tokens (CSS variables), Tailwind base/utilities |
| 🔴 `vite-env.d.ts` | Vite TypeScript environment declarations |

### `src/pages/`

| File | Purpose |
|------|---------|
| 🟡 `Index.tsx` | Landing page — hero, F.O.C.U.S. framework, programs, CTA |
| 🟡 `Auth.tsx` | Login / signup form with email + password |
| 🔴 `ResetPassword.tsx` | Password reset flow (update new password) |
| 🔴 `Onboarding.tsx` | Multi-step onboarding wizard (goal, modules, coaching style) |
| 🟡 `Dashboard.tsx` | User dashboard — clarity score, enrolled modules, weekly insights |
| 🟡 `Modules.tsx` | Browse all programs with tier-gated access (lazy-loaded) |
| 🔴 `ProgramDetail.tsx` | Single program view with enrollment + Stripe checkout (lazy-loaded) |
| 🔴 `ClaritySession.tsx` | Interactive clarity session — multi-step questionnaire |
| 🔴 `ResultScreen.tsx` | AI-generated insight display after completing a session |
| 🔴 `CoachChat.tsx` | AI coach chat interface (calls coach-chat edge function) |
| 🟡 `Challenges.tsx` | Challenge listing page |
| 🔴 `MirrorChallenge.tsx` | Daily mirror challenge tracker with day-by-day entries |
| 🟡 `Community.tsx` | Skool community redirect / info page |
| 🔴 `Profile.tsx` | User profile editor (display name, avatar) |
| 🔴 `EmailPreview.tsx` | Internal preview of email templates |
| 🔴 `Sitemap.tsx` | Visual HTML sitemap page |
| 🔴 `NotFound.tsx` | 404 error page |

### `src/components/`

| File | Purpose |
|------|---------|
| 🟢 `FloatingOrbs.tsx` | Animated background orbs used on most pages |
| 🟢 `MobileNav.tsx` | Hamburger navigation menu for mobile viewports |
| 🟢 `AnimatedSection.tsx` | Intersection Observer wrapper for scroll animations |
| 🟢 `SEOHead.tsx` | Per-route `<Helmet>` meta tags (title, description, OG) |
| 🟡 `AccessGate.tsx` | Tier-based content gating with blur + lock overlay |
| 🟡 `NavLink.tsx` | Navigation link with active state styling |
| 🟡 `ProgramCard.tsx` | Program card component for listings |
| 🟡 `ClarityScoreCard.tsx` | Clarity score visualization with radial progress |
| 🟡 `DecisionMode.tsx` | Quick decision-making tool widget |
| 🟡 `WeeklyInsights.tsx` | AI-generated weekly insight cards with caching |

### `src/components/ui/` (shadcn/ui)

| File | Purpose |
|------|---------|
| 🟢 `button.tsx` | Button component with variants (default, outline, ghost, etc.) |
| 🟢 `card.tsx` | Card container (Card, CardHeader, CardContent, CardFooter) |
| 🟢 `label.tsx` | Form label component |
| 🟢 `input.tsx` | Text input component |
| 🟢 `form.tsx` | React Hook Form integration wrapper |
| 🟢 `select.tsx` | Dropdown select component |
| 🟢 `toast.tsx` | Toast notification component |
| 🟢 `progress.tsx` | Progress bar component |
| 🟡 `badge.tsx` | Inline badge/tag component |
| 🟡 `avatar.tsx` | User avatar with image + fallback |
| 🟡 `popover.tsx` | Floating popover container |
| 🟡 `tooltip.tsx` | Hover tooltip component |
| 🟡 `textarea.tsx` | Multi-line text input |
| 🟡 `table.tsx` | Data table components |
| 🟡 `sonner.tsx` | Sonner toast provider |
| 🟡 `toggle.tsx` | Toggle button component |
| 🔴 `use-toast.ts` | Toast hook (imperative toast API) |
| 🔴 `accordion.tsx` | Collapsible accordion |
| 🔴 `alert.tsx` | Alert banner component |
| 🔴 `alert-dialog.tsx` | Confirmation dialog |
| 🔴 `aspect-ratio.tsx` | Aspect ratio container |
| 🔴 `breadcrumb.tsx` | Breadcrumb navigation |
| 🔴 `calendar.tsx` | Date picker calendar |
| 🔴 `carousel.tsx` | Image/content carousel |
| 🔴 `chart.tsx` | Recharts wrapper |
| 🔴 `checkbox.tsx` | Checkbox input |
| 🔴 `collapsible.tsx` | Collapsible section |
| 🔴 `command.tsx` | Command palette |
| 🔴 `context-menu.tsx` | Right-click context menu |
| 🔴 `dialog.tsx` | Modal dialog |
| 🔴 `drawer.tsx` | Bottom/side drawer |
| 🔴 `dropdown-menu.tsx` | Dropdown menu |
| 🔴 `hover-card.tsx` | Hover-triggered card |
| 🔴 `input-otp.tsx` | OTP code input |
| 🔴 `menubar.tsx` | Menu bar component |
| 🔴 `navigation-menu.tsx` | Navigation menu |
| 🔴 `pagination.tsx` | Page pagination |
| 🔴 `radio-group.tsx` | Radio button group |
| 🔴 `resizable.tsx` | Resizable panels |
| 🔴 `scroll-area.tsx` | Custom scrollbar area |
| 🔴 `separator.tsx` | Visual separator line |
| 🔴 `sheet.tsx` | Side sheet overlay |
| 🔴 `sidebar.tsx` | Sidebar navigation |
| 🔴 `skeleton.tsx` | Loading skeleton placeholder |
| 🔴 `slider.tsx` | Range slider |
| 🔴 `switch.tsx` | Toggle switch |
| 🔴 `tabs.tsx` | Tab navigation |
| 🔴 `toaster.tsx` | Toast container provider |
| 🔴 `toggle-group.tsx` | Toggle button group |

### `src/contexts/`

| File | Purpose |
|------|---------|
| 🟢 `AuthContext.tsx` | Auth provider — user state, signIn, signUp, signOut, resetPassword |

### `src/hooks/`

| File | Purpose |
|------|---------|
| 🟡 `use-access-level.ts` | Fetches user's access tier from DB (free/subscriber/cohort/premium/corporate) |
| 🟡 `use-mouse-glow.ts` | Shared mouse-follow glow effect hook |
| 🟡 `use-subscription.ts` | Stripe subscription state, checkout, and portal management |
| 🟡 `use-mobile.tsx` | Responsive breakpoint detection hook |
| 🟡 `use-toast.ts` | Re-exported toast hook |

### `src/lib/`

| File | Purpose |
|------|---------|
| 🟢 `utils.ts` | `cn()` utility for merging Tailwind classes |
| 🟡 `modules.ts` | Module definitions (id, title, questions, descriptions) |
| 🟡 `enrollment-store.ts` | Enrollment CRUD — enroll/unenroll in modules + challenges via DB |
| 🟡 `session-store.ts` | Session save/load — localStorage fallback + cloud-backed for auth users |
| 🟡 `clarity-engine.ts` | Clarity session logic — question flow, answer processing |
| 🟡 `clarity-score.ts` | Clarity score calculation algorithm |
| 🟡 `stripe-tiers.ts` | Stripe product/price IDs → tier mapping + tier labels |
| 🟡 `tier-constants.ts` | Shared TIER_RANK and TIER_LABELS constants |
| 🟡 `coach-prompts.ts` | System prompts for AI coach chat |
| 🟡 `email-templates.ts` | HTML email template generators |

### `src/data/`

| File | Purpose |
|------|---------|
| 🟡 `programs.ts` | All program definitions (1965 lines) — titles, tiers, modules, pricing |

### `src/integrations/`

| File | Purpose |
|------|---------|
| 🟢 `supabase/client.ts` | Auto-generated Supabase client (DO NOT EDIT) |
| 🔴 `supabase/types.ts` | Auto-generated DB type definitions (DO NOT EDIT) |
| 🔴 `lovable/index.ts` | Lovable platform integration |

### `src/test/`

| File | Purpose |
|------|---------|
| 🔴 `setup.ts` | Vitest test setup (jest-dom matchers) |
| 🔴 `example.test.ts` | Example unit test |

---

## `supabase/`

| File | Purpose |
|------|---------|
| 🔴 `config.toml` | Supabase project configuration |

### `supabase/functions/` (Edge Functions)

| File | Purpose |
|------|---------|
| 🟡 `check-subscription/index.ts` | Verifies Stripe subscription status, returns tier |
| 🟡 `create-checkout/index.ts` | Creates Stripe Checkout session for purchases |
| 🟡 `customer-portal/index.ts` | Opens Stripe Customer Portal for subscription management |
| 🟡 `stripe-webhook/index.ts` | Handles Stripe webhook events (checkout completed, subscription changes) |
| 🟡 `coach-chat/index.ts` | AI coach chat — JWT-protected, calls Lovable AI |
| 🟡 `clarity-insight/index.ts` | AI insight generation from session answers — JWT-protected |
| 🟡 `pattern-detect/index.ts` | AI pattern detection across sessions — JWT-protected |
| 🟡 `weekly-insights/index.ts` | AI weekly insight generation — JWT-protected |
