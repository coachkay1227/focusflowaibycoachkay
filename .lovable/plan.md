

# Focus Flow AI — Phase 2: AI-Powered Coaching System

## What exists today
- Cinematic landing page, clarity session (6 questions), result screen with simulated local mapping, 7-day mirror challenge, community preview page
- All insights are hardcoded maps in `clarity-engine.ts` — no real AI

## What this plan adds

### 1. Real AI-Powered Clarity Insights (replace simulated engine)
- **New edge function** `supabase/functions/clarity-insight/index.ts` — sends user's 6 answers + Coach Kay system prompt to Lovable AI gateway, streams back personalized Truth/Pattern/Action
- System prompt encodes Coach Kay's voice: warm, direct, emotionally intelligent, pattern-aware
- Uses tool calling to return structured JSON: `{ truth, pattern, action }`
- **Update `ResultScreen.tsx`** — call edge function instead of local `generateInsight()`, show streaming "generating" state, render AI response
- Keep local engine as instant fallback if AI call fails

### 2. Coaching Modules System (5 modules)
- **New file** `src/lib/modules.ts` — define module configs: Clarity Check (existing), Emotional Reset, Focus Flow, Purpose & Happiness, Goal Shift. Each has its own question set (5-8 questions), tone mode, and system prompt
- **New page** `src/pages/Modules.tsx` — module selection screen with cards for each module
- **Update `ClaritySession.tsx`** — accept a `moduleId` route param, load questions from the selected module instead of hardcoded `clarityQuestions`
- **Update routing** — add `/modules` route and `/clarity/:moduleId` pattern

### 3. Expanded Challenge System (multi-duration)
- **Update `src/lib/clarity-engine.ts`** — add challenge configs for 3-day, 4-day, 8-day, 14-day, 30-day alongside existing 7-day
- **New page** `src/pages/Challenges.tsx` — challenge picker screen
- **Update `MirrorChallenge.tsx`** — accept challenge type via route param, load appropriate prompts, track per-challenge in localStorage
- AI-generated adaptive daily responses via edge function after each journal entry

### 4. Decision Mode (signature feature)
- **New component** `src/components/DecisionMode.tsx` — when user expresses being stuck (detected via keywords in text answers), present 2-3 clear options with likely outcomes, prompt a decision
- Integrates into clarity session flow (after text questions) and as standalone accessible from result screen
- Uses Lovable AI to generate contextual options based on user's answers

### 5. Session Memory & Pattern Detection
- **New file** `src/lib/session-store.ts` — localStorage-based store for past session answers, insights, patterns, and timestamps
- After each clarity session, save full session data
- **New edge function** `supabase/functions/pattern-detect/index.ts` — sends past 3-5 sessions to AI, asks it to identify recurring patterns, avoidance language, inconsistencies between goals and actions
- **Update `ResultScreen.tsx`** — if returning user, show "Pattern Evolution" section comparing current vs past insights
- Pattern summary displayed as a new card on result screen

### 6. AI Coaching Chat (Continue with AI Coach)
- **New edge function** `supabase/functions/coach-chat/index.ts` — streaming chat with Coach Kay personality, seeded with user's latest clarity results
- **New page** `src/pages/CoachChat.tsx` — simple chat UI with streaming responses, markdown rendering via `react-markdown`
- Supports 4 response modes: supportive, reflective, direct/challenging, strategic (AI selects based on context)
- Rate limit and credit error handling with user-friendly toasts

## Technical details

**Backend (Lovable Cloud):**
- 3 edge functions: `clarity-insight`, `pattern-detect`, `coach-chat`
- All use `LOVABLE_API_KEY` (already available) → Lovable AI gateway
- Model: `google/gemini-3-flash-preview` (default)
- Coach Kay system prompt shared across functions, stored in a shared prompt file

**Frontend changes:**
- Install `react-markdown` for chat rendering
- New routes: `/modules`, `/clarity/:moduleId`, `/challenges`, `/challenges/:type`, `/coach`
- localStorage schema for session history: `{ sessions: [...], challenges: {...} }`
- All new pages use existing design system (floating orbs, grain, mouse glow, AnimatedSection)

**Data flow:**
```text
User → Clarity Session → Edge Function (AI insight) → Result Screen
                                                    → Pattern Detection (if returning user)
                                                    → Decision Mode (if stuck detected)
Result Screen → Coach Chat (streaming) 
             → Challenge Selection → Daily Prompts + AI responses
```

## File changes summary
| Action | File |
|--------|------|
| Create | `supabase/functions/clarity-insight/index.ts` |
| Create | `supabase/functions/coach-chat/index.ts` |
| Create | `supabase/functions/pattern-detect/index.ts` |
| Create | `src/lib/modules.ts` |
| Create | `src/lib/session-store.ts` |
| Create | `src/lib/coach-prompts.ts` |
| Create | `src/pages/Modules.tsx` |
| Create | `src/pages/Challenges.tsx` |
| Create | `src/pages/CoachChat.tsx` |
| Create | `src/components/DecisionMode.tsx` |
| Update | `src/App.tsx` (new routes) |
| Update | `src/pages/ClaritySession.tsx` (module support) |
| Update | `src/pages/ResultScreen.tsx` (AI insights, pattern section) |
| Update | `src/pages/MirrorChallenge.tsx` (multi-duration) |
| Update | `src/pages/Index.tsx` (nav links to modules/challenges) |
| Install | `react-markdown` |

