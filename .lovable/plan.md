# Finish the offer-sheet lock-in

Four offer-sheet items remain, plus the two logic problems you just named and a standing rule so I stop missing them.

## 0. Unblock the dev server (do this first)

The SEO contract check is failing and that stops the dev server from booting. The two routes added last turn are unclassified in `scripts/check-seo-regressions.ts`:

- `/start-a-build` goes in INDEXABLE (it is a public lead-gen entry point).
- `/admin/qr-codes` goes in ADMIN_EXEMPT.

Nothing below can be runtime-verified until this passes, because the preview is currently refusing connections.

## 1. Investment bands on the 12 apply-to-build offers

Exact prices and exact timelines come off every `inquiryOnly` offer (Business Builds, Custom AI Apps). Instant-checkout products keep their real prices: Quick Wins ($297 to $797) and Care Plans ($97/mo to $497/mo).

What replaces them:

```text
Full Marketing Site      Band: $2K to $4K    Typical: about 2 weeks
Lead-Gen Quiz Funnel     Band: $2K to $4K    Typical: about 2 weeks
E-Commerce Store         Band: $2K to $4K    Typical: about 2 weeks
Client Portal            Band: $3K to $5K    Typical: 2 to 3 weeks
Course / Membership      Band: $3K to $5K    Typical: about 3 weeks
Internal Ops Dashboard   Band: $3K to $5K    Typical: about 3 weeks
AI Tool / SaaS MVP       Band: $8K+          Typical: 3 to 4 weeks
Multi-Agent Workflow     Band: $10K+         Typical: about 4 weeks
Industry AI Assistant    Band: $10K+         Typical: about 4 weeks
White-Label Platform     Band: $13K+         Typical: about 4 weeks
```

Every band carries the same honest qualifier: estimate, final scope confirmed on a call. Tier headers move from hard ranges to investment-band language. The refund schedule copy comes off the Build Studio FAQ, replaced with terms language that routes to the scoping call, since terms belong in the SOW and not a public page.

## 2. Collective positioning

The current FAQ says the Collective is not a different company and is Coach Kay's delivery team. That is wrong. Correct positioning:

- The Collective is an independent company. Founder: John Moyler.
- Coach Kay is an AI partner in it, not its owner.
- Independent operators who meet often, coach together, support each other, and combine capacity for large builds and community-scale work.
- You contract with Focus Flow AI LLC for Coach Kay's work. Larger scopes bring in Collective partners.

Applies to the FAQ, the roles section framing, the page intro, and the Organization JSON-LD (drop `parentOrganization`, stop naming Coach Kay as founder of the Collective). The Build Studio FAQ gets the same correction so the two pages agree.

## 3. Navigation cleanup

"Autism Social Stories" stops being a top-level item and moves under the Books/Publishing group in both `DesktopNav.tsx` and `MobileNav.tsx`. The `/autism-social-stories` route stays live and every existing link keeps working.

## Technical notes

- `src/lib/build-studio-catalog.ts`: for `inquiryOnly` offers, `priceDisplay` becomes a band string and `turnaround` an approximate phrase. The numeric `price` field stays for internal sorting only and is never rendered for those offers. Card rendering in `CollectiveAIBuildStudio.tsx` already reads the display fields, so no logic change there.
- No Stripe price IDs added, removed, or edited. No database, policy, or edge function changes.
- Verification: typecheck, `bun run test` (87 tests), the payment-link guard script, then a browser pass on `/build-studio` confirming no exact price or hard timeline renders on any apply-to-build card and that `?offer=` deep links still land correctly.