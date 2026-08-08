# Fix the duplicated paths, naming, and missing AI Task Force

## What is wrong now

- **Transformation offers are duplicated four times across three pages.** `/modules` renders the program cards and then renders `PricingSection` again. The home page also renders `PricingSection`. `/truth` contains a separate hand-written three-card version.
- **The copies conflict.** `/truth` shows the Personal path at `$97` while the confirmed public offer is `$297`, and Full Transformation at `$2,997` while the confirmed public offer is `$2,497`.
- **The three cards do have destinations, but the page does not explain them clearly.** They point to individual program-detail pages for the 30-Day Personal Reset, 30-Day Business Reset, 90-Day Full AI Transformation, and Private Partnership.
- **The AI Task Force is hidden behind the label “Collective AI.”** There is no `/ai-task-force` route. The nav, footer, sitemap, and Build Studio use “Collective AI,” so a visitor looking for the AI Task Force will not recognize it.
- **The Task Force positioning is inconsistent.** `/collective` correctly names John Moyler as founder in some places, but also calls it “Coach Kay’s delivery team,” shortens Coach Kay to “Kay,” and says she leads the team. `public/llms.txt` incorrectly claims Coach Kay founded Collective AI.
- **Your name is wrong in multiple public locations.** Standalone “Kay” appears on `/truth`, `/collective`, `/advisory`, `/coach-kay`, `/agents`, and the footer. Public references must say **Coach Kay**. A personal-name reference, only when needed, must say **Kenza** or the confirmed public name **Kenza Alaoui**.

## Correction plan

### 1. Make `/modules` the one Transformation Paths destination

- Keep one clear offer catalog on `/modules`, backed by `src/data/programs.ts`.
- Remove the second `PricingSection` copy from `/modules`.
- Remove the full pricing grid from the home page. Replace it with one concise “Transformation Paths” entry that links to `/modules`.
- Remove the separate three-card pricing block and hard-coded `PATHS` data from `/truth`. Replace it with one contextual link to `/modules`.
- Keep “Transformation Paths” in navigation as a single link. A nav link is not a duplicate offer sheet.
- Retire `PricingSection` if nothing else uses it after consolidation.

### 2. Make every path understandable before someone clicks

On `/modules`, each public offer will clearly show:

- who it is for
- what is included
- duration
- confirmed price from the existing source of truth
- whether the next action is direct checkout or a conversation
- where the CTA goes

No new prices or promises will be invented.

### 3. Give the AI Task Force a visible, dedicated identity

- Add `/ai-task-force` as the clear public destination.
- Preserve `/collective` as a redirect so existing links and QR codes do not break.
- Rename the nav, footer, sitemap, Build Studio cross-link, and QR registry entry to **AI Task Force**.
- Make the page state plainly: it is an independent company founded by **John Moyler**; **Coach Kay is an AI partner**; it is not owned or founded by Coach Kay; Focus Flow AI LLC contracts Coach Kay’s work and brings in Task Force partners when a scope needs added capacity.
- Remove unsupported role and ownership claims such as “Coach Kay’s delivery team,” “she leads the team,” and the false founder statement in `public/llms.txt`.

### 4. Enforce the name rule sitewide

- Replace every public standalone “Kay,” “with Kay,” “Kay’s team,” and “talk to Kay” reference with **Coach Kay**, **Coach Kay’s partners**, or **Kenza** where a first-person personal name is actually appropriate.
- Keep “Coach Kay” as the default public identity.
- Add a regression check so standalone `Kay` cannot be reintroduced in public copy.

### 5. Verify the actual experience

- Add tests proving there is only one rendered Transformation offer catalog.
- Add route and link checks for `/modules`, every program CTA, `/ai-task-force`, and the legacy `/collective` redirect.
- Add assertions that confirmed prices match the program source of truth and that the old `$97` and `$2,997` path prices are gone.
- Run the existing unit, SEO, sitemap, and production build checks.
- Use the browser on desktop and mobile to confirm the nav wording, Transformation page, Task Force page, and every affected CTA visibly work.

## Result

Visitors will see one Transformation Paths catalog, know exactly what sits behind each offer, find the AI Task Force by name, and never see you called “Kay.”