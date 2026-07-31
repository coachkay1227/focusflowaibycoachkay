## Goal
Clear the two remaining Lighthouse findings on the published site:
1. `lighthouse_performance` — slow LCP
2. `lighthouse_accessibility` — low text contrast

Both are re-verified only against the published build, so we will land targeted source fixes, then publish.

---

## 1. Performance / LCP fixes

The homepage LCP candidate is the hero H1 (mobile) and the Coach Kay portrait (desktop). Both are gated by the render-blocking Google Fonts stylesheet.

**index.html**
- Make the Google Fonts stylesheet non-render-blocking using the standard `rel="preload" as="style" onload="this.rel='stylesheet'"` pattern (with a `<noscript>` fallback). This lets the H1 paint immediately with the system fallback while the web font loads (`display=swap` already set on the Google URL).
- Add a dedicated `<link rel="preload" as="image" href="/src/assets/coach-kay.jpeg" fetchpriority="high" media="(min-width: 768px)">` so the desktop LCP image starts fetching before React boots. (Skip on mobile where hero is text.)
- Fix the malformed `<meta name="theme-color">` block (line 14-18 has a line break inside the attribute name).
- Remove the stray `G-XXXXXXXXXX` GA placeholder script — it's a dead 3rd-party request on every page load and inflates TBT.

**src/pages/Index.tsx**
- Confirm portrait `<img>` already has `fetchPriority="high"`, `loading="eager"`, width/height. No change needed beyond the preload above.

---

## 2. Contrast fixes

Failing rule targets muted / opacity-reduced text on the deep navy background. `--muted-foreground` is already `45 25% 70%` (passes AA), but many pages layer opacity on top (`/60`, `/50`, `/40`) which drops it below 4.5:1.

**Sweep the following files** and replace opacity-attenuated muted/foreground text used for readable copy (paragraphs, labels, list items, form help text) with the plain token:

- `text-muted-foreground/40|/50|/60` → `text-muted-foreground`
- `text-foreground/50|/60` → `text-foreground/80` (kept slightly muted where designed, but above AA)
- Keep `/70` and above as-is (already ≥ AA against navy).

Target files (already grepped, 6+ hits each first):
`src/pages/Index.tsx`, `Assessment.tsx`, `PauseHub.tsx`, `MirrorChallenge.tsx`, `ClaritySession.tsx`, `AdminContent.tsx`, `Challenges.tsx`, `ResultScreen.tsx`, `Kiosk.tsx`, `Auth.tsx`, `CoachChat.tsx`, `TruthAboutAI.tsx`, `AiToolsDirectory.tsx`, `Sitemap.tsx`, `AgentIntake.tsx`, `ResetPassword.tsx`, `Dashboard.tsx`, `CollectiveAIBuildStudio.tsx`, `PauseHub.tsx`, `legal/LegalLayout.tsx`, `legal/Disclaimer.tsx`, `AdminNewsletter.tsx`, `AutismSocialStories.tsx`, `AuditReport.tsx`, `AuditLanding.tsx`, `StarterKit.tsx`, `Modules.tsx`, `RentAnAgent.tsx`, `AgentBuilder.tsx`, `Community.tsx`, `AdminDashboard.tsx`.

Do the replacement via a scripted `sed` sweep restricted to those patterns, then spot-check the hero, pricing, and legal pages visually.

---

## 3. Verify & publish

1. `bun run build` — confirm clean.
2. Publish.
3. Ask Lovable to re-run the SEO scan; mark both findings fixed once Lighthouse rescores.

## Technical notes
- `display=swap` is already in the Google Fonts URL, so switching the stylesheet to non-blocking is safe — text renders in DM Sans / Cormorant fallback and swaps in without a layout shift beyond what we already accept.
- The image preload is scoped with `media` so mobile doesn't pay for a desktop-only asset.
- No component API changes; opacity-token sweep is purely presentational.