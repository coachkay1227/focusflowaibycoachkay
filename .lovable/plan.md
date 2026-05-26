# Route Studio → Autism Page (and Revert Nav Menu)

Got it. Two surgical changes:

## 1. Revert the new "Autism Stories" top-nav entry

Remove the link I added in:
- `src/components/DesktopNav.tsx`
- `src/components/MobileNav.tsx`

(Footer link + sitemap + llms.txt entry stay — those are SEO/discoverability only, not visible chrome.)

## 2. Make Studio's "Autism & Social Stories" tab route to `/autism-social-stories`

In `src/pages/Store.tsx`, intercept the category change:

```ts
import { useNavigate } from "react-router-dom";
// ...
const navigate = useNavigate();

<CategoryTabs
  active={category}
  onChange={(c) => {
    if (c === "autism") {
      navigate("/autism-social-stories");
      return;
    }
    setCategory(c);
  }}
/>
```

Effect: clicking the Autism tab from Studio jumps the user straight to the dedicated `/autism-social-stories` page (the full 6-package catalog, intake modal, HSA/FSA copy). The other 4 tabs still switch in-place as before.

## Bonus fix included

While I'm in `AutismSocialStories.tsx`, I'll also fix the `useReveal` bug that's leaving 4 of 6 package cards stuck at `opacity-0` below the fold — initialize `shown=true` for cards already in view, only animate cards that start off-screen. This is what was making the page look half-empty.

## Verification

After the patch I'll navigate to `/store`, click the Autism tab, confirm I land on `/autism-social-stories`, scroll, and confirm all 6 packages render visibly.