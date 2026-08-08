# Post-Purchase "What To Do Now" Next-Steps Screen

## The problem

Right now a confirmed purchase ends on a screen that says *"Coach Kay's team will follow up within 24 hours"* with two buttons: **Go to Dashboard** and **Join Our Community**. That is a dead end. The buyer has just paid, and nothing tells them what actually happens next or gives them a concrete action. There is no way to book a call and no way to start a challenge.

The good news: the hard part is already built and now proven working. The screen already refuses to claim success until the backend confirms both a settled Stripe payment and a real fulfillment row. This plan only changes what a **confirmed** buyer sees. It does not touch the verification logic.

## What gets built

A real next-steps screen on `/order-success`, shown only after fulfillment is confirmed:

1. **Fulfillment confirmation with evidence, not vibes.** Instead of a bare checkmark, show what was actually confirmed: what they bought, what they paid, the email the receipt went to, and that their access is unlocked. All of this comes from the backend verification response, not from URL parameters a visitor could edit.

2. **Two clear primary actions, side by side.**
   - **Book your call** — opens the correct booking link for what they bought.
   - **Start your first challenge** — sends them to `/challenges` to pick the one that fits, per your choice to let people choose rather than pushing one.

3. **An honest "what happens next" timeline** that replaces the vague 24-hour promise: receipt is in your inbox now, your access is unlocked now, book your call when ready, and your challenge starts the day you begin it.

4. **Secondary links** to Dashboard and Community, demoted below the two primary actions.

### Which booking link

Per your answer, this depends on the purchase, decided from the amount Stripe actually charged **before discounts**:

| Purchase | Call offered |
|---|---|
| The $47 AI Business Audit | Free 15-minute clarity call |
| $297 and above, or any subscription | Paid 60-minute strategy call |

Using the pre-discount subtotal matters: the internal `FFTEST100` test makes the total $0, and classifying on the total would misroute every test run and any future coupon purchase.

When the paid strategy call is shown, the screen states plainly that it is a separately booked paid session. It will not imply a purchase they did not make.

## Technical notes

**Source of truth.** All displayed facts come from the existing `verify-checkout-session` response, never from URL params. That function already returns `state`, `mode`, `amount_total`, `customer_email`, `fulfilled_in`, and `record_id`.

**One small backend addition.** `verify-checkout-session` will also return `amount_subtotal` (the pre-discount amount) so the booking tier cannot be skewed by coupons. This is an additive field; nothing reads it today, so nothing can break.

**Files changed**
- `src/pages/OrderSuccess.tsx` — replace the confirmed-state markup for all purchase modes with the new next-steps layout. The `checking`, `processing`, and `failed` states stay exactly as they are.
- `src/components/NextStepsPanel.tsx` (new) — the reusable confirmation + actions panel, so the book and non-book paths do not drift apart.
- `supabase/functions/verify-checkout-session/index.ts` — add `amount_subtotal` to the response.

**Reused, not rebuilt**
- `use-booking-links.ts` for booking URLs, so your `/admin/booking-links` settings keep working with no code change and the hardcoded fallbacks still protect against a failed database read.
- Existing design tokens and `Button` variants. No hardcoded colors, no new dependencies, no animation libraries.

**Analytics.** Fire a tracked event when a buyer clicks Book Call or Start Challenge, so you can finally see whether the screen converts instead of guessing.

## Failure cases handled

- **Booking URL unreachable** — the hook's hardcoded fallbacks apply; the button never renders dead.
- **Coupon or $0 test purchase** — pre-discount subtotal drives the call tier, so tests behave like real purchases.
- **Payment confirmed but product unrecognised** — the screen still confirms fulfillment and offers both actions rather than showing an empty panel.
- **Refresh or back navigation** — verification re-runs against the backend and reaches the same conclusion; no state is trusted from the browser.
- **Someone opening `/order-success` with a forged `tier` or made-up `session_id`** — unchanged behaviour: no success screen, no unlocked messaging.

## Explicitly out of scope

Email nurture sequences, changing which products exist or what they cost, and the audit report screen. This is the one screen and its two actions.

## Verification before I call it done

- Run the `/admin/fulfillment-test` $0 audit end to end and confirm the screen shows the confirmed panel with the **free clarity call** (proving the subtotal rule works under a 100% discount).
- Confirm a $297+ purchase path resolves to the **paid strategy call**.
- Confirm both booking URLs resolve to the values currently in your admin booking settings, not the fallbacks.
- Confirm an unpaid or unknown `session_id` still shows no success screen.
- Typecheck and production build clean.

I will not report this working from a rendered screen alone. Evidence comes from the fulfillment test's backend checks plus the actual resolved URLs.

## Rollback

Three files, all additive or contained. Reverting `OrderSuccess.tsx` restores the previous screen immediately; the new component and the extra backend field are inert once unreferenced.