---
name: Care plan placement
description: Care plans attach to a build after purchase, never a Build Studio tier; Membership and Build Credits are off that page
type: feature
---
Care plans are never sold cold on the Build Studio offer sheet.

- `/build-studio` has three tiers only: Quick Wins, Business Builds, Custom AI Apps.
- Site Care ($97/mo) and Agent Care ($197/mo) carry `attachTo` keys in `build-studio-catalog.ts`. `attachedCarePlan(productName)` picks one, and `NextStepsPanel` offers it as "Step four: keep it running" after a settled non-subscription order. Skipping changes nothing about the order.
- Agent Care attaches to the AI Chatbot Widget. Site Care is the fallback (`"*"`) for every other Quick Win.
- Care for a site or assistant someone else built is inquiry-only, via `/start-a-build?offer=care` (or `?offer=agent_care`).
- Collective Membership and Build Credits are `hidden: true`. Their Stripe prices, webhook mappings, and existing subscriptions stay live. Do not re-add them to the Build Studio page without a decision.