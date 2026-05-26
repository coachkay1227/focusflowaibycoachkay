## Scope

Coach Kay AI chatbot only. Everything else (Stripe, modules, full route sweep) is queued for follow-up passes per your sequencing answer.

In scope:
- `/coach` chat page (`src/pages/CoachChat.tsx`)
- `coach-chat` edge function (`supabase/functions/coach-chat/index.ts`)
- `/coach-kay` profile page (`src/pages/CoachKay.tsx`) — entry/CTA surfaces only, not a chat
- Inbound nav from Assessment / Dashboard / ResultScreen / DesktopNav / MobileNav / SiteFooter
- Context handoff from clarity session (`location.state.context`)
- Decision Mode / coaching style behavior (per system prompt + `mem://features/decision-mode`)

Out of scope this pass: Stripe, modules/enrollments, clarity-session generation itself, legal routes, admin.

## Audit checks

### A. Auth + entry
1. `/coach` is wrapped in `ProtectedRoute` — confirm unauth users redirect cleanly, not blank.
2. Sign-out mid-session: textarea disables, but does a stale session token still POST? Inspect.
3. Initial greeting effect runs once with `context` present — confirm no double-send under React StrictMode.

### B. Edge function (`coach-chat`)
4. JWT validated via service-role `auth.getUser(token)` — matches API protection rule (mem://security/api-protection). ✅ expected.
5. Input validation: 1–50 messages, each ≤10k chars, role+content required. Confirm 400 paths.
6. Streaming SSE: passes upstream `response.body` straight through with `text/event-stream`. Verify CORS headers travel with stream (they're in the initial Response — fine).
7. Error mapping: 429 → toast "Slow down", 402 → "Credits needed", else generic. Trace each.
8. Model: `google/gemini-3-flash-preview` — matches Core memory. ✅
9. Context injection: truth/pattern/action + answers map appended to system prompt. Confirm shape from ResultScreen matches what edge expects (ResultScreen passes `{ ...insight, answers }` — verify keys).

### C. Client streaming
10. SSE parser handles partial frames via `textBuffer` re-queue on parse failure — review for infinite loop / dropped tokens.
11. `assistantSoFar` accumulator + functional `setMessages` — confirm no race when user sends two quickly (3s cooldown should prevent, verify).
12. Loading indicator only shows when last msg isn't assistant — confirm no flicker after stream ends.
13. Markdown render uses `ReactMarkdown` with no `remarkGfm` — lists/bold work; tables/strikethrough won't. Note as observation, not bug.
14. No conversation persistence (matches chat-agent-ui-contract one-conversation / no-storage choice). Refreshing `/coach` wipes history — confirm intended.

### D. Behavior (live test in preview, logged in)
15. Cold start no-context: send "I feel stuck" → expect SUPPORTIVE/REFLECTIVE tone, ends with question or next step.
16. Decision Mode trigger: send "I'm stuck between two options and can't decide" → expect 2–3 clearly enumerated options w/ likely outcomes.
17. Avoidance challenge: "I'll figure it out later, I'm too busy" → expect DIRECT mode pushback, not generic affirmation.
18. Strategy mode: "Give me a 7-day plan to start journaling" → expect STRATEGIC structured plan.
19. Long-input guard: paste >10k chars → expect 400 "Invalid message format" toast.
20. Rate-limit path: hammer send (bypassing cooldown via DevTools) → confirm 429 surfaces "Slow down".
21. Context handoff: complete clarity session → land on `/coach` with state → confirm auto-greeting fires and Kay references truth/pattern/action.

### E. Logs cross-check
22. After each live test, pull `coach-chat` edge logs — confirm: no unhandled errors, request count matches, token user ID present, upstream gateway status.
23. Check console for React key warnings, hydration issues, or SSE parse exceptions.

## Deliverable

A single report grouped as:
- ✅ Working — short bullets
- ⚠️ Minor / observation — file:line, why it matters, suggested fix
- ❌ Broken — file:line, reproduction, edge-log evidence, suggested fix

No code changes this pass. After you review, we decide what to fix vs. defer to the cleanup audit, then move to the next scope area (Stripe end-to-end with both code-trace and test-mode charges).

## Technical notes

- Will use `browser--navigate_to_sandbox` against `/coach` while logged in as your preview session.
- Will use `supabase--edge_function_logs function_name=coach-chat` after each test batch.
- Won't trigger any Stripe / DB-write side effects.
- If preview session isn't logged in, I'll stop and ask you to log in rather than fill the auth form.
