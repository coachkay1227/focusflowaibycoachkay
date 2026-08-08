# Correct the Cbus AI Task Force, Collective AI, and site brand

## Goal
Undo the incorrect merger of two different things:

- **Cbus AI Task Force** is Coach Kay's Columbus-focused civic program.
- **Collective AI** is a separate enterprise and partner ecosystem.
- **Coach Kay Elevates** is the public-facing brand across this site.

## 1. Rebuild `/ai-task-force` as the actual program

Replace the relabeled Collective page with an audience-facing **Cbus AI Task Force** page based on the supplied draft.

Page structure:

1. **Hero:** “AI is reshaping Columbus. Columbus should have a seat at the table.”
2. **Why Now:** Columbus opportunity, readiness, public resources, jobs, and community voice.
3. **Four Focus Areas:**
   - Small Business & Workforce Readiness
   - Responsible AI in Public Life
   - Infrastructure & Community Impact
   - Access for Every Neighborhood
4. **Who It’s For:** business leaders, educators, community organizations, public servants, and Columbus residents.
5. **The Convener:** Coach Kay / Kenza Alaoui with only the confirmed credentials.
6. **Invitation Form:** name, email, and “What brings you to this table?”
7. **Close:** “Where Focus Goes, Energy Flows.”

Remove all John Moyler, independent-company, build-delivery, source-code ownership, SOW, engineering-capacity, and partner-network copy from this program page. Remove the current FAQ because it answers internal brand questions instead of visitor questions.

## 2. Make the invitation real

Connect “Request an Invitation” to a real lead submission path rather than a decorative form.

- Store each request with its source, contact details, message, status, and timestamp.
- Add protected admin visibility so Coach Kay can review requests.
- Show a clear success state and honest response expectation.
- Add spam protection, validation, rate limiting, database grants, and row-level access rules.
- Add a confirmation email only if it can use the existing transactional email system without inventing new promises.

## 3. Restore Collective AI as a separate enterprise

Restore `/collective` as its own public page instead of redirecting it to the Task Force.

- Present Collective AI as the separate enterprise founded by John Moyler.
- Present Coach Kay accurately as an AI partner, not owner or founder.
- Explain the partner ecosystem and larger-scope capacity there, not on the Cbus AI Task Force page.
- Link from Collective AI to the Cbus AI Task Force only as a distinct program or community initiative where context supports it.
- Keep `/ai-task-force` and `/collective` as separate routes, metadata entries, sitemap entries, structured data entities, and navigation destinations.

## 4. Correct public branding to Coach Kay Elevates

Replace public-facing **FocusFlow AI / Focus Flow AI / FocusFlow** branding with **Coach Kay Elevates** across:

- global logo and accessible labels
- page headers, navigation, and footer
- default and per-page SEO metadata
- structured data and machine-readable site descriptions
- manifest, social-preview artwork, robots comments, sitemap page, and public documentation
- public page copy and transactional email copy

Preserve the exact registered legal entity name only where legally necessary in policies, contracts, receipts, or disclosures. Do not mass-rename technical identifiers such as template keys, database fields, migration history, storage keys, or API constants unless each dependency is traced and safely migrated.

## 5. Remove contradictory legacy positioning

Audit every shipping reference to:

- AI Task Force
- Cbus AI Task Force
- Collective AI
- John Moyler
- independent company
- partner network
- FocusFlow naming

Update or remove contradictions in the Coach Kay page, Build Studio, advisory content, FAQ data, navigation descriptions, SEO schema, `llms.txt`, prerender data, and generated sitemap sources. Historical migrations and non-shipping comments remain untouched unless they affect runtime output.

## 6. Navigation and discoverability

- Label the program **Cbus AI Task Force** in navigation.
- Give Collective AI a separate, clearly labeled destination without presenting it as Coach Kay's program.
- Cross-link the two only where the relationship is explained accurately.
- Keep the page hierarchy audience-first. The Task Force page leads with Columbus participation, not ownership disclaimers.

## 7. Verification

- Run type checks, unit tests, production build, SEO guards, sitemap generation, and brand-copy regression checks.
- Add regression assertions that `/ai-task-force` cannot contain John Moyler, SOW, build-delivery, or independent-company copy.
- Add assertions that `/collective` and `/ai-task-force` remain separate routes with unique metadata.
- Browser-test desktop and mobile versions of both pages.
- Submit a Task Force invitation and verify the stored row, admin visibility, success state, and any confirmation email.
- Confirm no public-facing FocusFlow wordmark or generic FocusFlow metadata remains.

## Technical scope

Expected areas include the current `Collective.tsx` implementation, a dedicated Collective AI page, router and navigation definitions, branding components, SEO/schema sources, public metadata files, invitation persistence, admin review UI, and focused regression tests. Existing payment, auth, offer, and fulfillment logic will not be changed.
