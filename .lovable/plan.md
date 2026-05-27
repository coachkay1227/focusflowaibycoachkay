
# VA Affiliate Link Brief + Site Readiness Audit

Two deliverables: (1) a message you can paste straight to your VA to collect every affiliate link, and (2) a clean audit of what's done, what's thin, and what could block launch.

---

## 1. Copy-Paste VA Brief

> **Subject:** Affiliate sign-ups for Coach Kay's AI Tools Hub
>
> Hey — I need you to register Coach Kay as an affiliate for every tool below and send me back the **direct affiliate link** (the trackable URL we'd give to a user clicking "Try it"). If a program requires approval, apply and note status. If a tool has no affiliate program, write "NO PROGRAM" and paste the plain signup URL instead.
>
> Use this email + name for all sign-ups: *[FILL IN]*. Payout method: *[FILL IN]*.
>
> Format every reply as:
> `Tool name | Affiliate link | Status (Live / Pending approval / No program) | Notes`
>
> **Priority — please do these in order:**
>
> **AI Chat & Reasoning**
> 1. Claude — https://claude.ai
> 2. Perplexity — https://perplexity.ai
>
> **AI Build & No-Code**
> 3. Lovable — https://lovable.dev (referral program is live)
> 4. Replit — https://replit.com
> 5. Softr — https://softr.io
>
> **AI Agents & Research**
> 6. Manus — https://manus.im
> 7. GenSpark — https://genspark.ai
>
> **AI Voice & Audio**
> 8. ElevenLabs — https://elevenlabs.io
> 9. Descript — https://descript.com
> 10. Krisp — https://krisp.ai
> 11. Otter.ai — https://otter.ai
>
> **AI Video & Image**
> 12. HeyGen — https://heygen.com
> 13. Synthesia — https://synthesia.io
> 14. HitPaw (FotorPea / VikPea) — https://www.hitpaw.com
> 15. Topaz Labs — https://topazlabs.com
> 16. Canva — https://canva.com
>
> **Productivity & Notes**
> 17. Notion — https://notion.so
> 18. Fathom — https://fathom.video
>
> **Automation & Ops**
> 19. GoHighLevel — https://gohighlevel.com (this one pays best, prioritise)
> 20. Make — https://make.com
> 21. Zapier — https://zapier.com
>
> **Payments & Delivery**
> 22. **Beehiiv** — https://beehiiv.com (Boosts / Partner program — apply ASAP)
> 23. Kit (ConvertKit) — https://kit.com
> 24. Whop — https://whop.com
>
> **Community & Booking**
> 25. Skool — https://www.skool.com
> 26. Circle — https://circle.so
> 27. Calendly — https://calendly.com
>
> Once you have the links, paste the table back to me. I'll drop them into the site in one batch.

When the VA returns links, I'll bulk-paste them into `src/data/ai-tools-directory.ts` (one field per row, `affiliate_url: "..."`), flip `affiliate_pending` off, and ship.

---

## 2. Site Readiness Audit

### ✅ Solid / shippable
- **Routing**: All 40+ routes registered in `App.tsx`. Legacy URLs (`/ai-starter-kit`, `/email-unsubscribe`, `/ai-tools-directory`, `/about`) redirect cleanly.
- **Auth gating**: `ProtectedRoute` on Dashboard, Profile, Coach Chat, Mirror Challenge, all `/admin/*`.
- **Pause Hub**: Now a real scam hub with 8 sourced incidents, live realtime feed, pulsing "Live" pill, gold flash on inserts. Admin form blocks publish without `source_url`.
- **AI Tools Directory**: 63 tools, 9 categories, affiliate-aware CTA logic, "Affiliate soon" badge.
- **Backend**: Cloud + RLS + edge functions wired. Stripe webhooks + tier mapping per memory.
- **Memory rules** locked: Pause Hub purpose, animation constraints, persistence patterns.

### ⚠️ Thin / needs attention (not blockers, but visible)
1. **Affiliate links** — 27 tools still on `affiliate_pending`. CTA works (falls back to signup), but money is left on the table until VA finishes (see brief above).
2. **Beehiiv newsletter wiring** — `AdminNewsletter` exists, but I should verify the publish/sync path to Beehiiv actually fires once you have the API key. Worth a 5-min smoke test.
3. **Scam alert volume** — 8 validated alerts is a good launch baseline but the feed will feel sparse after a week. Recommend: add a weekly cadence (you publish 2/week) OR an ingestion edge function pulling from FTC/FBI RSS.
4. **Truth About AI** — Page exists but doesn't yet carry the OpenAI surveillance / agent-risk angle you mentioned last turn. Open question still on the table.
5. **Mobile nav premium feel** — `DesktopNav` is the only nav file I see. Need to confirm the mobile drawer/menu has the same gold + Cormorant treatment, not a default shadcn sheet. Worth a quick QA pass on 647px viewport (your current preview).

### 🚧 Potential blockers worth a decision
- **Sign-in surface for premium pages**: confirm every premium-gated page redirects to `/auth` with a return URL, not a blank screen. I'd run through Dashboard / Coach / Mirror Challenge / Profile while signed out.
- **Stripe live keys vs test keys** — confirm we're on live mode before publish; webhook secret must match.
- **Custom domain SSL** — `coachkayai.life` and `www.coachkayai.life` are listed; make sure both resolve and one canonical-redirects to the other for SEO.
- **Sitemap** — `/sitemap` page + `public/sitemap.xml` exist. Need to verify `/ai-tools` and `/pause-hub` are in the XML so Google indexes them.
- **Beehiiv embed on `/`** — if newsletter capture above the fold is part of the funnel, make sure the form is live and posting somewhere real (not a stub).

### 🔍 Things I'd want you to look at before publish
- Walk `/` → `/ai-tools` → `/pause-hub` → `/coach-kay` → `/store` on mobile (your current 647px) and tell me if any feel "off-brand."
- Sign up as a brand-new user end-to-end and confirm: email verification → onboarding → dashboard → premium gate behavior.
- Click 5 random tool cards on `/ai-tools` — confirm they open in a new tab.

### Suggested next move
Send the VA brief today. While they work, I can:
- **(a)** Add OpenAI surveillance / agent-risk content to `/truth`, **or**
- **(b)** Build the FTC/FBI scam-alert ingestion function so Pause Hub stays fresh on its own, **or**
- **(c)** Run the mobile-nav premium-feel pass.

Tell me which of a/b/c to pick up next.
