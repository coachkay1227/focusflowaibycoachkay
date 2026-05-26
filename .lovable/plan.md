## Part 1 — Clarity Check Audit (findings)

I read the full flow: `src/pages/ClaritySession.tsx`, `src/lib/clarity-engine.ts`, `src/pages/ResultScreen.tsx`, and the `clarity-insight` edge function.

**What works (keep as-is):**
- 6 questions, mixed options + text, branded labels (STEP 01…), Coach Kay's voice in the truth/pattern/action maps. Authentic, raw, on-brand.
- "ONE LAST STEP" email gate for anon users — friction is low and the framing ("Your Clarity Code is ready") converts.
- Auth users skip the gate; results write to `cohort_registrations` and route to `/result`.
- Result screen uses an AI-powered `clarity-insight` edge function for patterns + a local fallback. Track resolver pushes users to the right pillar (F.O.C.U.S.).
- Funnel events fire (`clarity_completed`), legacy module slugs gracefully redirect via `RetiredScreen`.

**Gaps to fix (small, high-impact):**

1. **Authenticity dip on the local fallback.** `generateInsight()` falls back to `Math.floor(Math.random())` when no keyword matches a text answer — that means two different people can get the same "truth" by chance. Fix: deterministic hash of all 6 answers → stable insight, never random.
2. **Result screen doesn't quote the user back.** Premium clarity tools (Calm, Reflectly) mirror the user's own words. Add a "What you told me" callout that surfaces the user's `triedSoFar` / `holdingBack` / `clarityWouldChange` answers above the insight so it feels personal, not templated.
3. **No "why share this" moment.** After the insight, add a one-tap "Send this to someone who needs it" referral CTA (native share API + copy-link fallback with UTM `?ref=clarity`). This is the missing referral loop.
4. **Email confirmation is silent.** The gate says "I'll send you a copy" but there's no visible confirmation banner on the result screen once `clarity-insight` emails it. Add a "Sent to you@…" success chip tied to `emailStatus === "sent"` (state already exists, just surface it more prominently).
5. **Clarity Score not shown on the free check.** The `/result` page can surface +5 Clarity Score gain for completing the check (matches the gamified Core memory) — strong "what did I get out of it" signal.
6. **Path link audit:** `Index.tsx` hero → `/clarity` ✅, footer "Clarity Session" → `/clarity` ✅, modules redirect ✅. Confirmed working from code. I'll re-verify in the browser after edits.

## Part 2 — Premium Footer + Legal Compliance

**Current footer (`src/pages/Index.tsx` lines 567–606):** logo + 8 nav links + copyright. That's it. For a paid coaching brand running Stripe checkouts ($297–$2,497), this is **not compliant** and not premium.

**Missing from the footer:**
- Privacy Policy, Terms of Service, Refund/Cancellation Policy, Coaching Disclaimer (not therapy/medical/legal/financial advice), Cookie notice, Earnings disclaimer (income claims for transformation programs)
- Contact email, mailing address (Shield Her Elevation LLC), social handles
- Sitemap link (page exists at `/sitemap` but isn't linked)
- Newsletter capture / "Start with Clarity Check" mini-CTA
- Trust badges row (Master Certified Life Coach · Stripe Secure · GDPR-aware)

**Missing pages entirely** (none exist today): `/privacy`, `/terms`, `/disclaimer`, `/refund-policy`. Stripe's own ToS require merchants to publish refund + contact terms.

## Plan of work

### A. Clarity Check upgrades
1. `src/lib/clarity-engine.ts` — replace random fallback with deterministic hash over all 6 answers so insights are stable + reproducible.
2. `src/pages/ResultScreen.tsx`:
   - Add "What you told me" mirror card showing the user's own text answers above the insight.
   - Promote the `emailStatus === "sent"` confirmation to a visible chip near the top.
   - Add a "+5 Clarity Score" badge on completion.
   - Add a "Share this with someone" block (native `navigator.share` + copy-link with `?ref=clarity` UTM).

### B. New legal pages (4 pages, plain-text premium layout)
Create under `src/pages/legal/`:
- `Privacy.tsx` — what we collect (email, answers, Stripe data), Lovable Cloud + Stripe processors, GDPR rights, contact.
- `Terms.tsx` — service description, acceptable use, account, payment terms, IP, limitation of liability, governing law (Shield Her Elevation LLC jurisdiction — I'll use a placeholder for the user to confirm).
- `Disclaimer.tsx` — Coaching is NOT therapy, medical, legal, or financial advice. Results vary. No income guarantees for transformation programs.
- `RefundPolicy.tsx` — Per-program refund windows (Reset 30 / Transformation 90 / Full AI), cancellation steps, dispute path.

Register all 4 in `src/App.tsx`. Add to `src/pages/Sitemap.tsx`.

### C. Premium footer rebuild
Extract into `src/components/SiteFooter.tsx` (single source of truth, reused on Index + future pages). Structure:

```text
┌───────────────────────────────────────────────────────────────────┐
│  FocusFlow AI by Coach Kay      Start with a Clarity Check  [→]   │
│  Premium tagline / 1-line mission                                 │
├───────────────────────────────────────────────────────────────────┤
│  Explore           Programs          Resources       Legal        │
│  Clarity Session   30-Day Reset      About           Privacy      │
│  Modules           90-Day Transform  Community       Terms        │
│  Challenges        Full AI 90-Day    Sitemap         Disclaimer   │
│  AI Coach          Partnership       Contact         Refund Policy│
├───────────────────────────────────────────────────────────────────┤
│  Master Certified Life Coach · Stripe Secure · Coaching ≠ Therapy │
│  © 2026 FocusFlow Elevation · Shield Her Elevation LLC            │
│  Made with care · Coach Kay Elevates                              │
└───────────────────────────────────────────────────────────────────┘
```

Includes: contact mailto, social row (placeholders for handles the user can confirm), micro-disclaimer line "Coaching is for personal development. Not a substitute for medical, mental health, legal, or financial advice."

### D. Verification
After edits I'll browse `/` → click footer links → verify each legal page renders, then run the Clarity Check end-to-end in the preview and confirm the share + email confirmation render. Report back with screenshots of the new footer and result screen.

## Technical notes
- All new pages use existing semantic tokens (deep navy / gold / cream) — no new CSS variables.
- SiteFooter takes a `navigate` from `react-router` and reuses existing `SEOHead` patterns on legal pages (noindex off — these should be indexed for trust signals).
- Deterministic insight uses a small `cyrb53` hash (no deps).
- Two confirmations I need from you before I draft the legal copy:
  1. Governing-law state for Shield Her Elevation LLC (e.g., Delaware, Texas, …)?
  2. Refund window per program — defaults I'll use unless you say otherwise: **Reset 30** = 7-day no-questions refund before first 1:1; **Transformation 90** = 7-day before kickoff call; **Full AI 90** = non-refundable after agent provisioning, 7-day before kickoff.

If you confirm those two (or say "use the defaults"), I'll ship everything in one pass.