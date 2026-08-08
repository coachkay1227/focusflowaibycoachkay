# Production Audit (evidence-based) + Lead-Gen Repoint

No code, database, provider, or secret changes were made. Everything below is backed by a live query against Stripe, the production database, or the source files. Where I could not prove something, it is marked `unknown` rather than passed.

## The headline finding

**Nobody has ever completed a purchase on this site.** That is not an opinion from reading code — it is what the live Stripe account says.

- Last 50 live Checkout Sessions: **50 of 50 `expired` / `unpaid`**. Zero paid.
- Live subscriptions: **0**.
- Live succeeded payments: **1**, a single $250 charge from long before the current catalog.
- Production DB: `one_time_orders` 0 rows, `agent_orders` 0, `autism_orders` 0, `business_audits` 0, `processed_stripe_events` 0, `webhook_failures` 0.

So the fulfillment chain (webhook to order row to tier grant to confirmation email) has **never executed once in production**. It is not proven broken — it is proven *untested*. That distinction matters: the first real customer is currently also the first test.

## Classification table

| # | Item | Class | Evidence | Owner | Dependency | User impact today | Exact test to close it |
|---|---|---|---|---|---|---|---|
| 1 | 43 price IDs referenced in code | verified end-to-end (config only) | Queried each ID against live Stripe: all 43 exist, all `active`, amounts match catalog | Done | none | None | Already closed |
| 2 | Checkout to order row to tier grant | **unknown** | 0 paid sessions ever; 0 rows in every order table; 0 rows in `processed_stripe_events` | Kay + me | Stripe 100%-off coupon | First paying customer may pay and receive nothing | One live end-to-end purchase with a 100%-off coupon, then assert: `processed_stripe_events` +1, order row `paid`, `user_access_levels.tier` correct, confirmation email in `email_send_log` with a provider message id |
| 3 | Second live webhook endpoint | **broken (risk)** | Stripe has a 2nd enabled endpoint on `checkout.session.completed` pointing at `api.trigger.dev/.../cke-stripe-webhook-handler` | Kay decides | none | Two systems may both fulfill one payment (double email, double grant) | Confirm whether trigger.dev is still in use; if not, disable that endpoint |
| 4 | Subscription lifecycle | functional with gaps | Webhook handles exactly 3 events (`checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`); `customer.subscription.updated` and `invoice.payment_succeeded` are neither enabled nor handled | me | item 2 first | Cancel-at-period-end and renewals do not sync tier | Cancel a live sub at period end and observe no tier change |
| 5 | Purchase confirmation emails | **unknown** | `email_send_log` has only 4 template names ever: newsletter draft, newsletter welcome, clarity result, and `welcome-to-focusflow` which ended `dlq` x3 in April. Zero purchase emails ever sent | me | item 2 | Buyer may get no receipt | Covered by the item 2 test |
| 6 | Autism Studio products | functional with gaps | The 5 autism price IDs are in `PRICE_MODE_MAP`, but their products are in neither `PRODUCT_TIER_MAP` nor `NO_TIER_PRODUCTS`. The autism branch exits early on `autism_order_id` metadata, so it works only while that metadata is present | me | none | Missing metadata falls through to `unknown_product` and the buyer gets nothing | Add the 5 autism products to `NO_TIER_PRODUCTS` as a safety net, then buy one with the coupon |
| 7 | Public audit funnel | partial | Routes are public and `complete-audit-intake` exists, but `business_audits` has 0 rows, so the intake to report path has never run in production | me | item 2 | Unknown whether the $47 buyer ever receives a report | Buy the audit with the coupon and confirm a `business_audits` row with a non-null `report` and a working magic link |
| 8 | Roles / access control | verified | `auth.users` joined to roles: 2 admins, no `corporate` row anywhere, no user holds admin via tier | Done | none | None | Already closed |
| 9 | `hello@coachkayelevates.org` tier row | functional with gaps | That account predates the signup trigger and has no `user_access_levels` row, so `get_user_tier` returns `free` | me | none | None while admin bypass is on | Insert the missing row |
| 10 | Lead-gen destination hostname | **missing** | The FOCUS App project has no confirmed public hostname in this codebase; nothing to point CTAs at yet | Kay | publish FOCUS App + connect subdomain | Blocks the entire repoint | Publish that project, connect e.g. `focus.coachkayai.life`, confirm it loads |

## What I recommend, in order

**Step 1 — prove the money path once (blocks everything).** Create a 100%-off Stripe coupon, run one real checkout on the $47 audit and one on a $297 reset, and read the backend result each time: `processed_stripe_events`, the order row, the tier, and `email_send_log`. This is the only test that separates "looks done" from "is done." Until it passes, nothing else about revenue is knowable.

**Step 2 — close the three cheap gaps found above:** add the 5 autism products to `NO_TIER_PRODUCTS`, insert the missing tier row for the admin account, and decide the trigger.dev endpoint question.

**Step 3 — the lead-gen repoint.** Once the FOCUS App is published on a subdomain, the swap itself is mechanical and low-risk: 16 files carry offer CTAs, concentrated in `PricingSection.tsx`, `Modules.tsx`, `RentAnAgent.tsx`, `Advisory.tsx`, `CollectiveAIBuildStudio.tsx`, `ProgramDetail.tsx`, `AutismSocialStories.tsx`, and the two nav components. I would add one constant for the lead-gen URL and route the chosen CTAs through it, rather than editing 16 files by hand.

## One honest push-back

Repointing *every* offer to a lead-gen page means you stop taking money directly on this site. Given that Stripe shows zero completed purchases, that may be exactly right — capture the lead, sell on a call. But the low-ticket items ($47 audit, $47 autism story) usually convert better as direct buys than as form fills. I would keep those two on Stripe and repoint the mid and high-ticket offers. Tell me if you want all of them moved anyway and I will do that.

## Technical notes

- Evidence commands used: Stripe REST `GET /v1/prices/{id}` per referenced ID, `GET /v1/checkout/sessions?limit=50`, `GET /v1/subscriptions?status=all`, `GET /v1/webhook_endpoints`, plus read-only SQL counts against every order, log, and role table.
- `supabase/config.toml` shows `verify_jwt = false` on `stripe-webhook`, `create-checkout`, and `complete-audit-intake`, which is correct for those (signature and service-role checks happen in code).
- Session expiry on all 50 sessions is expected behavior for abandoned carts; the signal is the absence of any paid session, not the expiries.
