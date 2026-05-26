# Finish Phase 3.2.5B — Autism Lane Surface-Level Deployment

You're right — I built the page + backend but didn't expose it. The page exists at `/autism-social-stories` but nothing links to it, so it's effectively invisible. Here's the cleanup plan to finish what 3.2.5B left dangling, BEFORE moving on to Phase 3.2.5C.

## Files to modify (5 small surgical edits)

### 1. `src/components/DesktopNav.tsx`
Add nav entry after Studio:
```ts
{ label: "Autism Stories", path: "/autism-social-stories", icon: Heart, authOnly: false },
```
Import `Heart` from `lucide-react`.

### 2. `src/components/MobileNav.tsx`
Mirror the same entry so mobile drawer surfaces it.

### 3. `src/components/SiteFooter.tsx`
Add to the Explore/Offers column:
```ts
{ label: "Autism & Social Stories", to: "/autism-social-stories" },
```

### 4. `scripts/generate-sitemap.ts`
Add entry so Google indexes it:
```ts
{ path: "/autism-social-stories", priority: "0.9", changefreq: "weekly" },
```

### 5. `public/llms.txt`
Add a dedicated bullet under the offer list (the current line only mentions autism as a parenthetical under Studio). Add:
```
- [Autism & Social Stories](/autism-social-stories): Therapist-grade custom social stories. HSA/FSA eligible with LMN template included. Packages from $47 (single digital) to $3,997 (custom practice license). Used by BCBAs, SLPs, OTs, LPCs, and school IEP teams.
```

## Deferred to Phase 3.2.5D (not this lane)
- Coach Kay AI chat router awareness of autism intent → belongs with the router enhancement step you already planned for 3.2.5D
- LMN/HSA/provider-routing transactional email templates → separate email lane

## Verification after build
- Click nav link on desktop + mobile → lands on `/autism-social-stories`
- Footer link works
- `public/sitemap.xml` regenerates with the new entry on next dev/build
- `llms.txt` reflects the dedicated lane

After this is ✅, I'll proceed cleanly into Phase 3.2.5C (FAQ + AI discoverability) as you originally instructed.