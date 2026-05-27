
# Honest answers first

**1. The 6 scam alerts currently seeded — I made them up.**
They're archetypes pattern-matched to real categories (deepfake voice scams, fake browser extensions, pig-butchering, AI-millionaire funnels, etc.) but **none have a `source_url`** and none are tied to specific named incidents, perpetrators, or reporting outlets. That's on me. You're right — for a consumer-protection hub, validated > vibes. We'll replace them.

**2. Realtime IS wired** — `PauseHub.tsx` subscribes to `postgres_changes` on `scam_alerts` (INSERT/UPDATE/DELETE) and the table is in `supabase_realtime`. But there's **no visible signal** to the user that the page is live. We'll fix that.

**3. Tools directory is thin** — 23 tools, mostly Coach Kay's core stack. You named Manus, GenSpark, HeyGen, HitPaw, and "many more." We need a comprehensive directory with two link types per tool: a **direct signup URL** (default) and an optional **affiliate URL** when you have one. For tools where you'll grab affiliate later, I'll mark them `affiliate_pending: true` so you can fill them in without me re-editing the file.

---

# What I'll build

## A. Tools directory — comprehensive rebuild (`/ai-tools`)

Expand `src/data/ai-tools-directory.ts` from 23 → ~60+ tools across these categories (adding new ones in **bold**):

- AI Chat & Reasoning — ChatGPT, Claude, Gemini, Perplexity, **Grok**, **DeepSeek**, **Kimi**, **Mistral Le Chat**
- AI Build & No-Code — Lovable, Cursor, v0, Supabase, **Bolt.new**, **Replit Agent**, **Windsurf**, **Base44**, **Softr**, **Bubble**
- AI Agents & Research — **Manus**, **GenSpark**, **Operator (OpenAI)**, **Claude Computer Use**, n8n, Make, **Zapier AI**
- AI Voice & Audio — ElevenLabs, Descript, **Suno**, **Udio**, **Whisper / MacWhisper**, **Krisp**
- AI Video & Image — Midjourney, Runway, Canva, **HeyGen**, **HitPaw** (image/video upscaler), **Synthesia**, **Pika**, **Kling**, **Luma Dream Machine**, **Sora**, **Ideogram**, **Flux / BlackForestLabs**, **Topaz Labs**
- Productivity & Notes — Notion, Obsidian, Granola, **Fathom**, **Otter.ai**, **NotebookLM**, **Mem**
- Automation & Ops — GoHighLevel, n8n, Make, **Pipedream**, **Airtable AI**
- Payments & Delivery — Stripe, Beehiiv, **Resend**, **Kit (ConvertKit)**, **Whop**
- Community — Skool, Calendly, **Circle**, **Discord**

Each tool entry adds:
```ts
{
  name: "HeyGen",
  blurb: "...",
  category: "AI Video & Image",
  signup_url: "https://heygen.com",      // direct/public URL
  affiliate_url?: "https://...",         // optional, overrides signup when present
  affiliate_pending?: true,              // shows "Affiliate coming" instead of badge
  pricing: "Freemium",
}
```
UI: card shows "Try it →" (uses affiliate if set, else signup). If `affiliate_pending`, small gold note "Affiliate link coming — bookmark for later." Card link target is single-source-of-truth so when you paste affiliate URLs later, the whole card switches automatically.

I'll seed sensible defaults; **you fill in affiliate URLs you sign up for** — easy diff, no schema migration.

## B. Pause Hub — visible "Live" signal + real scams

**Live indicator (UI only):**
- Pulsing green dot + "Live feed · auto-updating" pill near the page header.
- When a new alert arrives via realtime, the existing toast fires AND the new card flashes a gold ring for 2s.
- "Last updated Xs ago" timestamp that ticks every 10s.

**Replace seeded alerts with real, sourced incidents.** I'll wipe the 6 fakes and seed ~8 validated ones, each with `source_url` to mainstream reporting. Working list (final wording confirmed against sources at build time):

1. **OpenAI Operator / Computer-Use agents — surveillance & credential exposure risk** (caution) — Wired/Ars coverage of agents that act on logged-in browsers.
2. **WormGPT & FraudGPT — uncensored LLMs sold for phishing** (red_flag) — SlashNext/Krebs reporting.
3. **Deepfake CFO video call — $25M Arup heist (Hong Kong, Feb 2024)** (red_flag) — CNN/FT reporting.
4. **AI-generated voice clone scams targeting families** (red_flag) — FTC consumer alert.
5. **Fake "ChatGPT" Chrome extensions stealing Facebook sessions** (red_flag) — Guardio Labs / BleepingComputer.
6. **Air Canada chatbot hallucination ruled binding** (watch) — informational, BBC/CBC — what AI confidently lying costs.
7. **"AI agency in a box" / done-for-you reseller funnels** (caution) — pattern alert, links to FTC guidance on biz-opp fraud.
8. **Pig-butchering + AI trading bot romance scams** (red_flag) — FBI IC3 report + ProPublica.

Each will have real `source_url`, real `body` with what happened + what to do, and `action_rules` you can actually follow. If a source doesn't pan out at build time I'll swap it for one that does — no fakes get re-seeded.

**Migration:** one SQL file that `DELETE FROM scam_alerts WHERE source_url IS NULL;` then inserts the validated 8. Idempotent via slug.

## C. Admin polish (small)

`/admin/scam-alerts` form: make `source_url` **required** with a helper line "No source, no publish. This is a validated-resources hub." Prevents future fake-feeling entries.

---

# What I am NOT touching this round

- F.O.C.U.S. pillar tags / `$0 only` toggle on the directory (still pending your earlier PRD answers).
- `/scams` separate route (folded into `/pause-hub`).
- Quiz, Poppins/Open Sans swap.
- Truth About AI page edits — you mentioned "OpenAI surveillance" warnings belong there too. Worth doing, but it's a separate scope; flag it and I'll plan it next round if you want.

# Acceptance check

1. `/ai-tools` shows 60+ tools, filters still work, every card has a working "Try it" link (signup or affiliate).
2. `/pause-hub` shows the pulsing "Live" pill; publishing from `/admin/scam-alerts` in tab A makes the card slide into tab B within ~1s with a gold flash.
3. Every visible alert has a clickable source link to a real article/report.
4. Admin form blocks publish without `source_url`.

# One thing I need from you (after I build)

A list of which tools you already have affiliate links for, OR confirmation I should set them all to `affiliate_pending: true` and you'll paste URLs in batch. Either works — say the word and I'll start.
