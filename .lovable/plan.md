## What's changing

The "Pledges" section on `/truth` currently says four flat things — including one ("No affiliate links") that's *not true* and one ("Honest pricing") that's already covered elsewhere. We're rewriting it to:

1. Tell the truth about affiliate links (transparency, not denial).
2. Anti-position Kay against everything she's *not* — gatekeeping coaches, tier-locked wisdom, fake gurus, hype.
3. Pull the mindset / life-coaching identity in through the **Uplift** and **Support** pillars of the F.O.C.U.S. framework.
4. Add a new "Coach Kay's Tool Picks" surface so the affiliate transparency has a real home.

## New pledges (replacing the 4 current ones)

Eight pledges in a 2-column grid on desktop, single column on mobile. Each card keeps the existing OfferCard-adjacent geometry (icon, title, body), but uses stronger anti-positioning copy.

1. **No gatekeeping** — *"What I coach in a $5K container, I'll teach in a $0 module. The tier unlocks depth and access — never the truth itself."* (icon: `Unlock`)
2. **Yes, affiliate links — flagged every time** — *"I use the tools I recommend. When a link pays me, you'll see a clear tag. The pick is the pick whether it pays or not."* (icon: `Tag`)
3. **Mindset + strategy, not motivation theater** — *"Life coaching belongs inside the system, not on a stage. Uplift and Support are pillars of F.O.C.U.S. — not upsells."* (icon: `HeartHandshake`)
4. **No fake scarcity** — *"No 'doors close at midnight,' no countdown timers, no fabricated cohorts. If a seat is limited, it's because the room is."* (icon: `Clock`)
5. **No discovery-call paywall** — *"Every price is on the page. You'll never have to book a call to find out what something costs."* (icon: `Eye`)
6. **No screenshot flexing** — *"I won't show you my income, my followers, or my Stripe dashboard to sell you anything. Results speak in your life, not mine."* (icon: `ShieldOff`)
7. **Plain language, always** — *"If I can't explain it to your grandma, I won't put it in front of you. AI is the tool — clarity is the product."* (icon: `Compass`)
8. **I'll tell you 'no'** — *"If you don't need what I sell, I'll send you somewhere that fits — even if that somewhere is rest. Trust over revenue, every time."* (icon: `AlertTriangle`)

The section's eyebrow stays `Why people trust this room` and the title becomes **"What I'll never do — and what I promise instead."**

## Bridge to F.O.C.U.S. (mindset/life-coaching tie-in)

Directly under the pledges grid, add a short bridge block — one sentence + a 2-tile mini-strip — that says:

> "Mindset isn't a separate program. It lives inside **Uplift** (rebuild your inner operating system) and **Support** (have a coach in your corner when the work gets hard). Both are pillars of the F.O.C.U.S. framework."

Two compact tiles:
- **Uplift** → links to `/modules?pillar=U`
- **Support** → links to `/modules?pillar=S`

Each tile uses the existing `PillarBadge` color and a 1-line description from `FOCUS_PILLARS`.

## New section: Coach Kay's Tool Picks

Add a new section on `/truth` directly after the bridge (before the existing Skills section), so the affiliate-links pledge has a real, transparent home.

- Eyebrow: `What I actually use`
- Title: **"Coach Kay's tool picks"**
- Subhead: *"The stack behind every program. Affiliate links are tagged. No tool here gets a placement it didn't earn in my own workflow."*
- 6–8 cards in a responsive grid. Each card: tool name, 1-line "why I use it," category chip (AI / Productivity / Coaching / Build), outbound link, and an `Affiliate` tag when applicable.
- Cards are a small new component `src/components/truth/ToolPickCard.tsx` (reuses the OfferCard visual language — border, padding, hover lift — but slimmer, since these aren't priced offers).
- Data lives in a new file `src/data/tool-picks.ts` so Kay can edit the list without touching the page.

Initial seed list (Kay can edit later): Lovable, ChatGPT, Claude, Notion, ElevenLabs, Descript, Stripe, Skool. Affiliate flags default to `false`; Kay flips them on per-tool.

## Files touched

- `src/pages/TruthAboutAI.tsx` — replace `TRUST_PILLARS` array (4 → 8), retitle the section, add F.O.C.U.S. bridge block, add new Tool Picks section.
- `src/components/truth/ToolPickCard.tsx` — new component.
- `src/data/tool-picks.ts` — new data file with the seed list and a `Tool` type.

No backend, no schema, no edge functions. Pure presentation + content.

## Out of scope

- No new program data, pricing, or routes.
- No changes to the existing OfferCard, ProgramCard, or pricing geometry.
- No edits to other pages — the FOCUS framing already lives on `/modules` and `/programs/*`.
