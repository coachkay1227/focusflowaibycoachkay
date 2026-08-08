import { Link } from "react-router-dom";
import { ArrowRight, Check, CalendarDays, Trophy, Mail, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingLinks } from "@/hooks/use-booking-links";
import { trackEvent } from "@/lib/analytics";
import { wantsStrategyCall as earnsStrategyCall } from "@/lib/booking-thresholds";
import { buildBookingUrl, bookingProofLine } from "@/lib/booking-url";
import { logOrderNextStep } from "@/lib/order-next-step-log";

export interface NextStepsPanelProps {
  /** Headline shown above the confirmation. */
  headline: string;
  /** One-line framing under the headline. */
  lede: string;
  /** What they bought, when the backend could name it. */
  productName?: string | null;
  /** Pre-discount amount in cents, from the backend. Drives which call is offered. */
  amountSubtotalCents?: number | null;
  /** Amount actually charged, in cents. */
  amountTotalCents?: number | null;
  /** Receipt recipient, as Stripe recorded it. */
  customerEmail?: string | null;
  /** Stripe checkout mode — subscriptions always get the strategy call. */
  mode?: string | null;
  /** For analytics attribution. */
  sessionId?: string | null;
  /** Which fulfillment record confirmed this purchase. */
  orderSource?: string | null;
  /** Buyer name, when the backend recorded one. */
  customerName?: string | null;
}

const formatCents = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

/**
 * Post-purchase "what to do now" panel.
 *
 * Only ever rendered after the backend has confirmed BOTH a settled Stripe
 * payment and a real fulfillment record. Every fact shown here comes from that
 * backend response — never from URL parameters, which a visitor can edit.
 */
export const NextStepsPanel = ({
  headline,
  lede,
  productName,
  amountSubtotalCents,
  amountTotalCents,
  customerEmail,
  mode,
  sessionId,
  orderSource,
  customerName,
}: NextStepsPanelProps) => {
  const { freeClarityUrl, paidStrategyUrl } = useBookingLinks();

  const wantsStrategyCall = earnsStrategyCall({ amountSubtotalCents, mode });

  // Carry the verified order onto the booking so the session record proves
  // which plan and call type it belongs to.
  const bookingContext = {
    sessionType: wantsStrategyCall ? ("paid_strategy" as const) : ("free_clarity" as const),
    productName,
    orderRef: sessionId,
    orderSource,
    amountSubtotalCents,
    amountTotalCents,
    mode,
    email: customerEmail,
    name: customerName,
    placement: "order_success",
  };
  const bookingUrl = buildBookingUrl(
    wantsStrategyCall ? paidStrategyUrl : freeClarityUrl,
    bookingContext,
  );
  const bookingLabel = wantsStrategyCall
    ? "Book your 60-minute strategy session"
    : "Book your free 15-minute clarity call";
  const bookingNote = wantsStrategyCall
    ? "A separately booked paid session — pick a time that works for you."
    : "No charge, no pitch. Bring the one thing you're stuck on.";

  const track = (action: "book_call" | "start_challenge" | "start_here") => {
    void trackEvent("post_purchase_next_step", {
      action,
      session_id: sessionId,
      product_name: productName,
      call_type: wantsStrategyCall ? "paid_strategy" : "free_clarity",
    });
    // Admin audit trail: which action was chosen, and exactly where it led.
    const linkTarget = action === "book_call"
      ? bookingUrl
      : action === "start_challenge"
        ? "/challenges"
        : "/start";
    logOrderNextStep({
      action,
      sessionId,
      linkTarget,
      sessionType: wantsStrategyCall ? "paid_strategy" : "free_clarity",
      productName,
      amountSubtotalCents: amountSubtotalCents ?? null,
      placement: "order_success",
    });
  };

  const confirmed: { label: string; value: string }[] = [];
  if (productName) confirmed.push({ label: "Purchased", value: productName });
  if (typeof amountTotalCents === "number") {
    confirmed.push({ label: "Paid", value: formatCents(amountTotalCents) });
  }
  if (customerEmail) confirmed.push({ label: "Receipt sent to", value: customerEmail });

  return (
    <div className="max-w-3xl w-full mx-auto text-center">
      <div className="mx-auto mb-8 h-20 w-20 rounded-full border-2 border-primary flex items-center justify-center animate-in zoom-in-50 duration-500">
        <Check className="h-10 w-10 text-primary" strokeWidth={2} />
      </div>

      <h1 className="font-heading text-4xl sm:text-5xl text-foreground mb-4">{headline}</h1>
      <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
        {lede}
      </p>

      {confirmed.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/50 p-6 mb-10 text-left">
          <h2 className="font-mono-label text-xs uppercase tracking-wider text-muted-foreground mb-4">
            Confirmed
          </h2>
          <dl className="space-y-2 text-sm">
            {confirmed.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">{row.label}</dt>
                <dd className="text-foreground font-medium break-words text-right">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4 text-sm text-primary">
            <Unlock className="h-4 w-4 shrink-0" />
            <span>Your access is unlocked now — nothing else is pending.</span>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-primary/40 bg-card/50 p-6 mb-10 text-left">
        <h2 className="font-heading text-xl text-foreground mb-2">Start here</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Two minutes: your results, the one offer that fits you next, and a single step to
          take.
        </p>
        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
          onClick={() => track("start_here")}
        >
          <Link to="/start">
            Show me my next step <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <h2 className="font-heading text-2xl text-foreground mb-2">Or jump straight in</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Pick either one. You don't have to wait for anyone.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 mb-10 text-left">
        <div className="rounded-lg border border-primary/40 bg-card/50 p-6 flex flex-col">
          <CalendarDays className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-heading text-lg text-foreground mb-2">Talk it through</h3>
          <p className="text-sm text-muted-foreground mb-5 flex-1">{bookingNote}</p>
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
            onClick={() => track("book_call")}
          >
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
              {bookingLabel}
            </a>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground break-words">
            Booked as: {bookingProofLine(bookingContext)}
          </p>
        </div>

        <div className="rounded-lg border border-border/60 bg-card/50 p-6 flex flex-col">
          <Trophy className="h-6 w-6 text-accent mb-3" />
          <h3 className="font-heading text-lg text-foreground mb-2">Start moving today</h3>
          <p className="text-sm text-muted-foreground mb-5 flex-1">
            Choose a challenge that fits your week — from a 3-day reset to a full 30-day
            transformation. It starts the day you begin it.
          </p>
          <Button
            asChild
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary/10 w-full"
            onClick={() => track("start_challenge")}
          >
            <Link to="/challenges">Choose your first challenge</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card/30 p-6 mb-10 text-left">
        <h2 className="font-mono-label text-xs uppercase tracking-wider text-muted-foreground mb-4">
          What happens next
        </h2>
        <ul className="space-y-3 text-sm text-foreground/85">
          <li className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>
              Your receipt is in your inbox
              {customerEmail ? ` at ${customerEmail}` : ""} — check spam if you don't see it.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Unlock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>Your access is already active in your dashboard.</span>
          </li>
          <li className="flex items-start gap-3">
            <CalendarDays className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>Book your call whenever you're ready — there's no deadline.</span>
          </li>
          <li className="flex items-start gap-3">
            <Trophy className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <span>Your challenge begins the day you start it, at your pace.</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
          <Link to="/community">Join the Community</Link>
        </Button>
      </div>
    </div>
  );
};