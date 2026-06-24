# The FocusFlow Email Engine — Full Build Plan

Goal: turn email into your #1 revenue channel. Every page, purchase, click, and idle moment becomes a triggered, segmented, branded touchpoint. Hormozi-grade offers, Coach Kay voice, automated end-to-end.

---

## 1. Strategy (the "why" before the "what")

Five email job-categories. Every email belongs to exactly one:

1. **Transactional** — receipts, confirmations, password resets, intake submitted, audit ready. Sent by Lovable Cloud, must hit inbox 100%.
2. **Lifecycle (onboarding)** — 5–9 emails per program after purchase. Builds momentum, reduces refunds, drives completion.
3. **Lead generation (nurture)** — free Clarity Check, AI Truth, lead magnets → 7–14 day sequence ending in a paid offer.
4. **Broadcast (newsletter / launches)** — weekly "AI Truth Drop," new product launches, scam alerts. Sent via Beehiiv (already wired).
5. **Re-engagement / win-back** — cart abandon, idle 14/30/60 days, failed payment, expired subscription.

Rule: Lovable = transactional + lifecycle. Beehiiv/GHL = broadcast + nurture. Never mix; deliverability dies when promo and receipts share a domain reputation.

---

## 2. Architecture

```text
User action (signup, purchase, form, idle)
        │
        ▼
  Edge function trigger (existing or new)
        │
        ├──► Lovable Cloud: send-transactional-email  (1:1, branded, queued, retried, logged)
        │        └─ email_send_log → admin dashboard
        │
        ├──► ghl-webhook  → GHL workflow → drip / SMS / tags
        │
        └──► newsletter-subscribe → Beehiiv (list growth + broadcast)
```

Two sender subdomains (critical for deliverability):
- `notify.coachkayelevates.org` — transactional + lifecycle (already set up)
- `news.coachkayelevates.org` — broadcasts via Beehiiv (new, isolates promo reputation)

---

## 3. The Email Map (every trigger across the site)

### A. Auth & account (transactional)
| Trigger | Template | Status |
|---|---|---|
| Signup | `welcome-to-focusflow` | ✅ exists |
| Email verify / magic link / recovery | auth-email-hook | ✅ exists |
| Password changed | `password-changed` | **add** |
| Email changed | auth hook | ✅ |

### B. Free tools → lead capture (nurture entry points)
| Trigger | Template | Sequence after |
|---|---|---|
| Clarity Check completed | `clarity-code-result` ✅ | **NEW 7-day Clarity Nurture** → offer 30-Day Reset |
| AI Business Audit completed | `audit-report-ready` ✅ | **NEW 5-email Audit Nurture** → offer Strategy Intensive / Rent-an-Agent |
| Newsletter signup | `newsletter-welcome` ✅ | Hand off to Beehiiv weekly broadcast |
| Starter Kit download | `starter-kit-delivered` | **add** + 5-day F.O.C.U.S. intro sequence |
| Exit-intent popup signup | `exit-intent-magnet` | **add** |

### C. Purchase confirmations (transactional)
| Product | Template | Status |
|---|---|---|
| Book order | `book-order-paid`, `book-order-status-update` | ✅ |
| Autism Social Stories | `autism-purchase-confirmation` | ✅ |
| AI Business Audit | `audit-purchase-confirmation` | ✅ |
| 30-Day Reset | `reset-welcome` | ✅ |
| 90-Day Transformation | `transformation-welcome` | ✅ |
| Rent-an-Agent (any tier) | **add** `rent-agent-welcome` + intake link |
| Build Studio | **add** `build-studio-welcome` + intake link |
| Strategy Intensive | **add** `strategy-intensive-welcome` + booking link |
| 6-Month Partnership | **add** `partnership-welcome` |
| Cohort code redemption | **add** `cohort-activated` |

### D. Lifecycle / onboarding sequences (the money makers)
For every paid program, a 5–9 email sequence drip-fed by `pg_cron`:

**Rent-an-Agent (7 emails, 30 days)** — Day 0 welcome+intake, D1 "what your agent is doing right now," D3 first deliverable preview, D7 mid-sprint check-in, D14 case study, D21 upsell to next tier, D30 testimonial request.

**30-Day Reset (9 emails)** — D0, D1, D3, D7, D10, D14, D21, D28 results, D30 upsell to 90-Day.

**90-Day Transformation (12 emails)** — phase 1/2/3 transitions, weekly accountability, mid-program upsell to Partnership.

**Build Studio (5 emails)** — kickoff, requirements confirmed, build update, delivery, 30-day review.

### E. Behavioral / abandoned (highest ROI)
| Trigger | Logic | Email |
|---|---|---|
| Stripe checkout started, not completed in 1h | `processed_stripe_events` + new `checkout_abandoned` table | "Your seat is held — 20% bonus if you complete in 24h" |
| Audit intake started, not submitted in 24h | `business_audits` where status=draft | "Your audit is 60% done" |
| Dashboard idle 14 days | `last_seen_at` on profiles | "Coach Kay noticed…" |
| Subscription past_due (Stripe webhook) | existing webhook | "Update card to keep your seat" |
| Subscription canceled | webhook | Win-back: 30-day pause offer |

### F. Broadcasts (Beehiiv, weekly)
- **Monday: AI Truth Drop** — one tool, one scam, one tactic
- **Thursday: Coach Kay Live Q&A reminder**
- **Sunday: Weekly Reset prompt** (drives Clarity Check completions → nurture loop)

---

## 4. Segmentation (so the right email reaches the right person)

Add `email_segments` table (computed nightly via cron):

```text
segment                     criteria
─────────────────────────── ─────────────────────────────────
prospect_cold               signed up, no purchase, <7 days
prospect_warm               completed clarity OR audit, no purchase
buyer_reset                 reset_30 tier
buyer_transformation        transformation_90 tier
buyer_rent_agent            rent_agent tier
buyer_premium               premium / corporate
churned                     was_paid AND tier=free AND last_paid >30d ago
power_user                  clarity_score > 70
```

Every broadcast and nurture branches on segment. Buyers never get "buy now" emails for what they already own.

---

## 5. What gets built (in build mode)

### Phase 1 — Plug the leaks (revenue critical)
1. Add `checkout_abandoned` detection (Stripe `checkout.session.expired` + 1h timer on incomplete sessions).
2. Add missing welcome templates: `rent-agent-welcome`, `build-studio-welcome`, `strategy-intensive-welcome`, `partnership-welcome`, `cohort-activated`, `starter-kit-delivered`, `password-changed`.
3. Wire every Stripe webhook tier-grant to fire the matching welcome email + intake link.

### Phase 2 — Lifecycle drips
4. New table `email_sequence_enrollments` (user_id, sequence_id, current_step, next_send_at, status).
5. New edge function `email-sequence-runner` triggered every 15 min by pg_cron — reads due rows, invokes `send-transactional-email`, advances step.
6. Author 5 sequences (Reset, Transformation, Rent-Agent, Build Studio, Clarity Nurture).

### Phase 3 — Behavioral triggers
7. Nightly cron `email-behavior-scan` — finds abandoned checkouts, idle users, draft audits, churned subscribers; enrolls them in matching sequences.
8. Last-touch suppression: if user paid in last 24h, skip nurture/upsell sends.

### Phase 4 — Broadcast & segmentation
9. Add `news.coachkayelevates.org` subdomain for Beehiiv.
10. Nightly Beehiiv segment sync (push segment tags so broadcasts can branch).
11. Admin page `/admin/emails` — uses existing `email_send_log` with dedup-by-message_id, segment counts, sequence enrollment view, manual "enroll user in sequence" button (admin-only).

### Phase 5 — Conversion lifts (Hormozi layer)
12. Every nurture email ends in **one** CTA, **one** offer, **one** deadline.
13. Add `utm_source=email&utm_campaign={sequence}&utm_content={step}` to every link → already-wired `analytics_events` captures attribution.
14. A/B subject line field on templates (variant_a / variant_b, 50/50 split, winner auto-promoted after 200 sends).
15. Add `unsubscribe_preferences` table — granular: transactional always, lifecycle/nurture/broadcast each toggleable. Regulators love it, deliverability loves it more.

---

## 6. Admin & observability

- `/admin/emails` dashboard: time range, template filter, status filter, summary stats, full log (all deduped by `message_id`).
- `/admin/sequences`: see who's enrolled, pause/resume, manual enroll.
- Weekly auto-digest to `Hello@coachkayelevates.org`: sends, opens (via Beehiiv), revenue attributed by `utm_campaign`, top failing templates.

---

## 7. Admin bypass (you, testing everything)
Admin email previews every template at `/admin/emails/preview/{template}` with sample data, can fire test sends to self, can enroll self into any sequence without paying.

---

## 8. Compliance & deliverability (the boring stuff that makes it all work)
- DKIM/SPF/DMARC on both subdomains (Lovable handles `notify.`, Beehiiv handles `news.`)
- One-click unsubscribe in every non-transactional email (RFC 8058)
- Suppression list honored across BOTH systems (sync nightly)
- Plain-text alt for every HTML template (already in React Email)
- Send caps: nurture max 1/day, broadcast max 2/week per user

---

## What I need from you before build mode

1. **Subdomain `news.coachkayelevates.org`** — OK to add for Beehiiv broadcasts? (keeps promo reputation off your transactional domain)
2. **Sequence priority** — build all 5 lifecycle sequences in phase 2, or start with Rent-an-Agent + 30-Day Reset only (highest revenue)?
3. **Voice samples** — do you have 2–3 past emails you've sent that capture the Coach Kay voice perfectly? I'll match them. If not, I'll draft from the existing template tone and you redline.
4. **Abandoned-checkout bonus** — what incentive can I offer in the recovery email? (e.g., 20% off, bonus 1:1 call, $50 credit) Pick one — I'll standardize across all programs.

Once you answer, I'll execute Phases 1–5 in order.