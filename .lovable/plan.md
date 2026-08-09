# Fill out the Collective AI page with their real consulting offering

Right now `/collective` only says who Collective AI is and points people back to the Cbus AI Task Force. It never tells a visitor what Collective AI actually does. Pull the real content from their consulting page and present it, with clear separation between their company and yours.

## What gets added

**Their consulting offering (three service cards, verbatim in substance from their page):**
- AI Strategy and Implementation. AI strategies aligned with business goals, integrated end to end.
- Custom AI Solutions. Bespoke AI models and applications for specific challenges.
- AI Training and Enablement. Teams get the knowledge and skills to use AI inside their organizations.

**How they work (three short points):**
- Expert team of seasoned AI practitioners across industries.
- Structured, agile methodology built for transparency and alignment.
- Fast deployment so results show up early.

**Their outbound call to action:** a "Book a consultation with Collective AI" button pointing to `https://collectiveai.info/consultation`, opening in a new tab, marked `rel="noopener noreferrer"`. A secondary text link to `https://collectiveai.info/consulting` for the full offering.

**Attribution line under the services:** one sentence stating this is Collective AI's own consulting practice, described here because Coach Kay serves as an AI partner. Enterprise consulting engagements are booked through Collective AI, not through Coach Kay Elevates.

## What stays the same

- The existing header, hero, and the three identity cards (the enterprise, Coach Kay's role, the Cbus program).
- The closing Cbus AI Task Force section stays as the last block so Columbus visitors still land in your program.
- No prices anywhere. Their page lists none, and none get invented.
- Existing SEO schema stays; the meta description gets one clause added so it names the consulting practice.

## Page order after the change

```text
Hero (separate enterprise, shared capacity)
Identity cards (enterprise / Coach Kay's role / Cbus program)
What Collective AI does  <- new
How they work            <- new
Book with Collective AI  <- new outbound CTA + attribution
Looking for the Columbus program? (existing Cbus CTA)
```

## Technical notes

- Single file edit: `src/pages/CollectiveAI.tsx`.
- Reuse existing tokens and lucide icons already imported plus a few more (Target, Wrench, GraduationCap, ShieldCheck, Gauge, Zap). No new dependencies, no new animation libraries.
- Verify: clean build, then open `/collective` and confirm both outbound links resolve and the Cbus CTA still sits last.