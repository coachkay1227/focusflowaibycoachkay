# Project Memory

## Core
- FocusFlow AI by Coach Kay: Cinematic/sci-fi brand. Deep navy bg #0D1B2A (hsl 210 52% 11%), true gold #C9A84C (hsl 43 53% 54%), cream text #F5EDD6. Cormorant Garamond headings, DM Sans body.
- STRICT: NO external animation libraries (Three.js/GSAP/Framer). Pure CSS or IntersectionObserver ONLY.
- Edge functions MUST use ESM imports (esm.sh), no `npm:` specifiers.
- Hybrid storage: Auth -> Supabase, Anon -> localStorage. Gemini-3-Flash-Preview for AI via Lovable Cloud.
- JWT auth for edge functions. `clarity-insight` is the exception for unauth guest flow.
- RLS: Users CANNOT modify their own access tier. NEVER auto-downgrade cohort/premium/corporate tiers.
- AI state: Save results via local variables before React state updates to prevent race condition data loss.

## Memories
- [Branding](mem://style/branding) — Visual identity details, colors, and typography
- [Animation Constraints](mem://style/animation-constraints) — Pure CSS rules for animations
- [Architecture](mem://tech/architecture) — Overview of hybrid storage and AI model usage
- [Clarity Session](mem://features/clarity-session) — One-question UI and AI insight generation
- [Decision Mode](mem://features/decision-mode) — Feature detecting 'stuck' language to present clear options
- [Clarity Score](mem://features/clarity-score) — 0-100 progression system and user levels
- [Enrollment System](mem://features/enrollment-system) — Dashboard tracking and error handling rules
- [User Identity](mem://auth/user-identity) — Profile management, coaching styles, and HIBP passwords
- [Program Catalog](mem://tech/program-catalog) — Dual-catalog structure and F.O.C.U.S. pillars
- [Access Control](mem://auth/access-control-security) — user_access_levels table and privilege rules
- [Monetization](mem://billing/monetization-strategy) — Stripe subscriptions and one-time payment logic
- [Community](mem://features/community) — Skool FocusFlow Elevation Hub URL
- [API Protection](mem://security/api-protection) — JWT rules for edge functions and unauth exceptions
- [Clarity Score Logic](mem://features/clarity-score-logic) — Timezone-aware bucketing for streaks
- [Access Paths](mem://strategy/access-paths) — Overview of the 5 marketed access paths
- [Admin Provisioning](mem://admin/provisioning) — Designated primary admin email and future plans
- [Database Architecture](mem://tech/database-architecture) — Convention over constraint for auth schema
- [Persistence Patterns](mem://tech/persistence-patterns) — Saving AI results before state updates
- [Stripe Configuration](mem://billing/stripe-configuration) — Webhooks, tier mapping, and API key permissions
- [Product Roadmap](mem://strategy/product-roadmap) — Planned features like Cohort Code validation
- [Edge Function Dev](mem://tech/edge-function-development) — Deno ESM import requirements
- [Email Strategy](mem://features/email-strategy) — Hybrid Lovable transactional + GHL marketing/drip setup
- [Pause Hub](mem://features/pause-hub) — /pause-hub is the scam alert hub (Supabase Realtime), NOT a breathwork page

- [Voice Bible](mem://style/voice-bible) — Canonical AI/email voice rules, banned list, sign-off, admin lint
- [Admin Audit Log](mem://admin/audit-log) — admin_audit_log table tracks view-toggle + admin writes
