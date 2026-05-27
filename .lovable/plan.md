
# Fix: Rebuild `/pause-hub` as the P.A.U.S.E. Scam Hub

## What went wrong
In msgs #897–#902 we locked the plan: Pause Hub = **P.A.U.S.E. Check** — a consumer-protection hub for AI scams, overhyped trends, and productivity traps, auto-refreshing via Supabase Realtime, published from `/admin`. In #914 I re-offered it as a vague "Pause practice/tool" and built a box-breathing meditation page. Wrong feature. Discarding it.

## What we build instead

### 1. Database (one migration)
- `scam_alerts` table: `id`, `title`, `slug`, `summary`, `body` (markdown), `threat_level` (enum: `red_flag`, `caution`, `watch`, `resolved`), `category` (e.g. "AI scam", "Overhyped trend", "Productivity trap"), `action_rules` (jsonb array of short do/don't bullets), `source_url`, `published_at`, `created_by`, `is_published`.
- RLS:
  - `anon` + `authenticated`: SELECT where `is_published = true`
  - `admin` role: full INSERT/UPDATE/DELETE
- Grants per public-schema rule.
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.scam_alerts;`
- Seed 6–8 starter alerts so the page isn't empty on launch.

### 2. `/pause-hub` page — rebuild from scratch
Delete the current breathwork implementation. New page:
- Hero: "The P.A.U.S.E. Check — before you click, swipe, or pay." Subtext on consumer protection mission.
- Live alert feed: cards sorted by `published_at desc`, grouped or filterable by `threat_level`. Each card shows threat badge (color-coded, no red as primary — gold/amber for caution, deep crimson reserved only for `red_flag`), category chip, title, summary, action rules as a checklist, "Read full alert" expand, source link.
- Filter chips: All / Red Flag / Caution / Watch / Resolved + category filter.
- Realtime subscription: `supabase.channel('scam_alerts').on('postgres_changes', ...)` — new alerts slide in at top, no refresh button, no polling. Toast on new alert while page is open.
- Empty state + skeleton loading.
- SEO: JSONLD `CollectionPage` + `ItemList` of alerts.

### 3. Admin publishing UI — `/admin/scam-alerts`
- List view of all alerts (published + drafts).
- Create / edit form: title, summary, body (markdown textarea), threat level, category, action rules (repeatable input), source URL, publish toggle.
- Wire into existing `AdminNav.tsx`.
- Service-role gated via existing `has_role(auth.uid(), 'admin')`.

### 4. Cleanup
- Remove breathwork-only code: box-breathing orb, daily prompts list, ritual cards.
- Keep route `/pause-hub` (already in nav, sitemap, MobileNav) — only the contents change.
- Update memory: `mem://features/pause-hub` describing the scam-hub purpose so this never drifts again.
- Update `CHANGELOG.md`.

## What I am NOT touching this round
- `/ai-tools` directory (separate PRD question, still open)
- `/scams` route from the PRD — folding into `/pause-hub` since Pause Hub IS the scam hub per original plan. If you'd rather have both `/scams` and `/pause-hub`, say so and I'll split.
- Quiz, F.O.C.U.S. pillar tags on the tool directory, Poppins/Open Sans font swap — all still pending answers from my earlier 4 questions.

## Technical notes
- Pure CSS animations only (per memory rule, no Framer/GSAP).
- Realtime free tier: 200 concurrent connections, 2M msgs/month — way under projected traffic.
- Edge functions: none needed; admin writes go through Supabase client with RLS.
- No new secrets required.

## Acceptance check before I say it's done
1. Visit `/pause-hub` while logged out → see live alerts.
2. Publish a new alert from `/admin/scam-alerts` in one tab → it appears in `/pause-hub` in another tab within ~1s, no refresh.
3. Unpublish → it disappears live.
4. Filter chips work; threat badges render correctly; mobile layout clean at 375px.

Ready to switch to build mode and execute.
