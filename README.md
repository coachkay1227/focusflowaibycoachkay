# FocusFlow AI by Coach Kay

An AI-powered life transformation platform built on the **F.O.C.U.S. framework** — Foundation, Overcome, Clarity, Unlock, Sustain. Designed for elevation seekers rebuilding their lives using intentional growth and AI coaching.

**Live:** [focusflowaibycoachkay.lovable.app](https://focusflowaibycoachkay.lovable.app)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5, Vite 5 |
| Styling | Tailwind CSS 3, shadcn/ui, CSS custom properties |
| State | React Context (auth), TanStack React Query (server state) |
| Routing | React Router v6 |
| Backend | Lovable Cloud (Supabase) — Postgres, Auth, Edge Functions |
| Payments | Stripe Checkout + Customer Portal |
| AI | Lovable AI (Gemini / GPT) via edge functions |
| SEO | react-helmet-async, JSON-LD, sitemap.xml |
| Deployment | Lovable (Vercel under the hood) |

---

## Features

- **Clarity Sessions** — Guided self-reflection modules with AI-generated insights
- **AI Coach Chat** — Conversational coaching powered by LLM
- **Mirror Challenge** — 21-day daily journaling challenge
- **5-Tier Access System** — Free → Subscriber → Cohort → Premium → Corporate
- **Stripe Integration** — Subscription + one-time purchases
- **Weekly Insights** — AI-generated pattern analysis with caching
- **Onboarding Wizard** — Goal selection, module preferences, coaching style

---

## Project Structure

```
src/
├── pages/          # Route-level components (Index, Dashboard, Auth, etc.)
├── components/     # Shared UI components
│   └── ui/         # shadcn/ui primitives
├── contexts/       # React Context providers (AuthContext)
├── hooks/          # Custom hooks (useAccessLevel, useSubscription, etc.)
├── lib/            # Business logic (clarity engine, enrollment, Stripe tiers)
├── data/           # Static data (program definitions)
└── integrations/   # Supabase client + types (auto-generated)

supabase/
└── functions/      # Edge functions (AI, Stripe, subscription checks)
```

See [`filesExplainer.md`](./filesExplainer.md) for a complete file-by-file reference.

---

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- A Lovable account (backend is managed via Lovable Cloud)

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app connects to Lovable Cloud automatically — no `.env` setup needed in the Lovable editor.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build |
| `npm run test` | Run unit tests |
| `npm run lint` | Lint with ESLint |

See [`scripts.md`](./scripts.md) for full details.

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User display names and avatars |
| `user_preferences` | Onboarding selections and coaching style |
| `user_access_levels` | Tier-based access control (free–corporate) |
| `clarity_sessions` | Completed session answers + AI insights |
| `module_enrollments` | User ↔ module enrollment tracking |
| `challenge_enrollments` | User ↔ challenge enrollment tracking |
| `challenge_progress` | Daily challenge entries and progress |

All tables have Row-Level Security (RLS) policies scoped to `auth.uid()`.

---

## Edge Functions

| Function | Auth | Purpose |
|----------|------|---------|
| `coach-chat` | JWT | AI coaching conversation |
| `clarity-insight` | JWT | Generate insight from session answers |
| `pattern-detect` | JWT | Detect patterns across sessions |
| `weekly-insights` | JWT | Generate weekly insight summary |
| `check-subscription` | JWT | Verify Stripe subscription status |
| `create-checkout` | JWT | Create Stripe Checkout session |
| `customer-portal` | JWT | Open Stripe billing portal |
| `stripe-webhook` | Stripe sig | Handle Stripe webhook events |

---

## Security

- All edge functions require JWT auth (except stripe-webhook which uses Stripe signature verification)
- RLS on every table, scoped to authenticated user
- Password HIBP check enabled
- Security headers: CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff
- Avatar URLs sanitized before rendering

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make changes and ensure `npm run lint` and `npm run test` pass
4. Submit a pull request

---

## License

Proprietary — Shield Her Elevation LLC / Forward Focus Elevation. All rights reserved.
