## Goal

Make the CKE Voice Bible the **one source of truth** that every AI prompt and every email template pulls from — so Coach Kay's chat, clarity reports, pattern detects, sequence emails, and broadcasts all sound like *you*, not like a generic LLM.

No more copy-pasted system prompts drifting out of sync. One file. Everything imports it.

---

## Part 1 — Build the Voice Bible into the cognitive layer

**Create a canonical voice module** (two parallel files, identical content, one per runtime):

- `src/lib/coach-voice.ts` — for any client-side rendering or future on-device AI
- `supabase/functions/_shared/coach-voice.ts` — for every edge function (Deno)

Each exports:
- `COACH_KAY_VOICE_BIBLE` — the full distilled standard (identity, 4 voice words, banned list, sentence patterns, mantra, em-dash rule, signature)
- `COACH_KAY_IDENTITY` — the "who she is" paragraph (single mom, 5x cert, built in margins, mirror not idol)
- `BANNED_WORDS` / `BANNED_OPENERS` / `BANNED_STRUCTURES` — arrays for runtime linting
- `composeSystemPrompt(role, extras?)` — helper that stitches identity + voice + role-specific instructions so every prompt is built the same way

**Replace every existing system prompt with `composeSystemPrompt(...)`:**

| File | Current state | After |
|---|---|---|
| `supabase/functions/coach-chat/index.ts` | Hardcoded SYSTEM_PROMPT | `composeSystemPrompt("live-chat")` |
| `supabase/functions/clarity-insight/index.ts` | Hardcoded SYSTEM_PROMPT | `composeSystemPrompt("clarity-report")` |
| `supabase/functions/pattern-detect/index.ts` | Hardcoded | `composeSystemPrompt("pattern-detect")` |
| `supabase/functions/mac-elaborate/index.ts` | Hardcoded | `composeSystemPrompt("mac-elaborate")` |
| `supabase/functions/weekly-insights/index.ts` | Hardcoded | `composeSystemPrompt("weekly-insights")` |
| `supabase/functions/generate-business-audit/index.ts` | Hardcoded | `composeSystemPrompt("business-audit")` |
| `supabase/functions/generate-starter-report/index.ts` | Hardcoded | `composeSystemPrompt("starter-report")` |
| `src/lib/coach-prompts.ts` | Old prompt source | Re-export from `coach-voice.ts` so legacy imports keep working |

**Add a runtime voice-guard** (`assertVoice(text)`) used by edge functions before returning AI text:
- Strips em-dashes → swaps for periods or commas (your hard rule)
- Flags banned words and banned openers in dev logs (no user-facing block, just observability)
- Ensures sign-off appears on long-form outputs (clarity report, weekly insight email body, etc.)

---

## Part 2 — Wire it into the email engine

Every transactional template + every future sequence email runs through the same voice standard.

**Add `supabase/functions/_shared/transactional-email-templates/_voice-helpers.tsx`:**
- `<Signoff />` component → renders `Where Focus Goes, Energy Flows. 💛 Coach Kay`
- `<WarmOpen name />` → `Hey {name || "Friends"}! 👋`
- `<ArrowCTA href label />` → `→ {label}` (never "Click here" / "Learn more")
- `scrubVoice(html)` helper that runs at render time: removes em-dashes, replaces banned filler ("Just wanted to circle back", "I hope this finds you well", etc.) with safe equivalents

**Audit + rewrite all 15 existing templates** in `_shared/transactional-email-templates/` to:
- Open with the warm open or a direct hook (no "Hi there, I just wanted to…")
- Lead with the point in sentence one
- Use `<ArrowCTA>` for every button
- Close with `<Signoff />`
- Strip em-dashes everywhere

Templates touched: welcome-to-focusflow, application-received, book-order-paid, book-order-status-update, clarity-code-result, audit-purchase-confirmation, reset-welcome, transformation-welcome, autism-purchase-confirmation, onboarding-completion, audit-intake-submitted, audit-report-ready, newsletter-welcome, webhook-failure-alert (internal-only, skip voice), and auth emails in `_shared/email-templates/`.

**AI-generated email bodies** (clarity report email, weekly insight email, future sequence emails Phase 5) will use `composeSystemPrompt("email-body", { template: "rent-agent-welcome" })` so the model writes in voice on the first try, then runs through `scrubVoice()` before send.

---

## Part 3 — Voice Bible page in the admin

`/admin/voice-bible` route that:
- Renders the full distilled Voice Bible (sourced from `coach-voice.ts` — single source of truth)
- Shows a "Voice Lint" panel: paste any text, get back banned-word hits, em-dash count, missing sign-off
- Links to "Preview templates" (existing `/admin/emails/preview/...` route plan from earlier)

This way: VAs, future contractors, and you yourself have one URL to read the standard *and* test copy against it before sending.

---

## Technical details

**File additions:**
- `supabase/functions/_shared/coach-voice.ts` (~250 lines — full bible distilled)
- `src/lib/coach-voice.ts` (re-export pattern for browser)
- `supabase/functions/_shared/transactional-email-templates/_voice-helpers.tsx`
- `src/pages/admin/AdminVoiceBible.tsx`
- Memory file: `mem://style/voice-bible` with the core rules

**File edits:**
- 7 edge functions: swap hardcoded prompts → `composeSystemPrompt(...)`
- 14 user-facing email templates: warm open / arrow CTA / signoff / em-dash strip
- `src/lib/coach-prompts.ts`: thin re-export shim for backward compatibility
- `src/App.tsx`: add `/admin/voice-bible` route
- `src/components/admin/AdminNav.tsx`: add Voice Bible link
- `.lovable/memory/index.md` + new memory file
- `supabase/config.toml`: no changes (no new functions)

**What does NOT change:**
- AI provider stays Lovable AI Gateway, model stays `google/gemini-3-flash-preview`
- No new tables, no migrations, no Stripe changes
- Existing email infrastructure (`send-transactional-email`, GHL webhook, Beehiiv) untouched
- Phase 2-5 of the earlier email-engine plan (sequence runner, behavior scan, admin dashboard) is unchanged — this slots in *underneath* it so when those phases ship they're already speaking your voice

**Verification before close:**
- `tsgo` typecheck across edited files
- Render every email template via existing `/api/emails/preview/:template` to confirm signoff + warm open + no em-dashes
- Manual smoke: run a clarity session, confirm the AI output has no banned openers and ends with the mantra
