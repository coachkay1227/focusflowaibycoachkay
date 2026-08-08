import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/lib/book-store";
import { trackEvent } from "@/lib/analytics";
import { TIER_LABELS } from "@/lib/tier-constants";
import type { AccessTier } from "@/hooks/use-access-level";

interface OrderSummary {
  package_name: string;
  order_total: number;
}

/** Backend-verified payment state. The UI must never claim success from a
 *  rendered screen alone: `confirmed` requires Stripe to report a settled
 *  payment AND fulfillment to exist in the database. */
type VerifyState = "checking" | "confirmed" | "processing" | "failed";

interface VerifyResult {
  state?: "confirmed" | "processing" | "unpaid" | "expired" | "unknown";
  amount_total?: number | null;
  mode?: string;
}

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const tierParam = params.get("tier");
  const orderType = params.get("type");
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"loading" | "book" | "autism" | "non_book">("loading");
  const [verify, setVerify] = useState<VerifyState>(sessionId ? "checking" : "failed");
  const [verified, setVerified] = useState<VerifyResult | null>(null);
  const attempts = useRef(0);

  // Step 1: verify the payment against Stripe and the fulfillment tables.
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    const poll = async () => {
      attempts.current += 1;
      try {
        const { data, error: fnErr } = await supabase.functions.invoke("verify-checkout-session", {
          body: { session_id: sessionId },
        });
        if (cancelled) return;
        const res = (data ?? null) as VerifyResult | null;
        if (fnErr || !res?.state) {
          if (attempts.current < 5) return void setTimeout(poll, 2500);
          return setVerify("failed");
        }
        setVerified(res);
        if (res.state === "confirmed") return setVerify("confirmed");
        if (res.state === "processing") {
          // Payment settled but the webhook has not landed yet — keep polling.
          setVerify("processing");
          if (attempts.current < 8) setTimeout(poll, 2500);
          return;
        }
        setVerify("failed");
      } catch {
        if (cancelled) return;
        if (attempts.current < 5) return void setTimeout(poll, 2500);
        setVerify("failed");
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || verify !== "confirmed") return;
    (async () => {
      try {
        const fnName = orderType === "autism" ? "verify-autism-order" : "verify-book-order";
        const { data, error } = await supabase.functions.invoke(fnName, {
          body: { session_id: sessionId },
        });
        if (error || !data || !(data as OrderSummary).package_name) {
          // No matching book_orders row — treat as a non-book checkout
          // (Rent-an-Agent subscription, AI Audit, Strategy Intensive, etc.)
          setMode("non_book");
          return;
        }
        setSummary(data as OrderSummary);
        setMode(orderType === "autism" ? "autism" : "book");
        void trackEvent(
          "studio_checkout_paid",
          {
            session_id: sessionId,
            package_name: (data as OrderSummary | null)?.package_name,
            order_total_cents: (data as OrderSummary | null)?.order_total,
            order_type: orderType ?? "book",
          },
          "studio"
        );
      } catch (err) {
        // Treat verification failure as a non-book order rather than a hard error.
        setMode("non_book");
      }
    })();
  }, [sessionId, orderType, verify]);

  const tierLabel =
    tierParam && (TIER_LABELS as Record<string, string>)[tierParam]
      ? TIER_LABELS[tierParam as AccessTier]
      : null;

  // Still verifying, or settled but not yet fulfilled: say exactly that.
  if (verify === "checking" || verify === "processing" || (verify === "confirmed" && mode === "loading")) {
    return (
      <div className="min-h-dvh bg-background text-foreground flex items-center justify-center px-6 py-16">
        <SEOHead
          title="Confirming Your Payment — FocusFlow AI"
          description="We're confirming your payment with our payment processor."
          path="/order-success"
          noIndex
        />
        <div className="max-w-xl w-full text-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-8" />
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-4">
            {verify === "processing" ? "Payment received — finalising your access" : "Confirming your payment"}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {verify === "processing"
              ? "Your payment went through. We're setting up your access now — this usually takes a few seconds. You can safely stay on this page."
              : "Checking with our payment processor. This only takes a moment."}
          </p>
        </div>
      </div>
    );
  }

  // Could not confirm a settled payment. Never show a success screen here.
  if (verify === "failed") {
    return (
      <div className="min-h-dvh bg-background text-foreground flex items-center justify-center px-6 py-16">
        <SEOHead
          title="We Couldn't Confirm Your Payment — FocusFlow AI"
          description="We could not confirm this payment. Reach out and we'll sort it out right away."
          path="/order-success"
          noIndex
        />
        <div className="max-w-xl w-full text-center">
          <div className="mx-auto mb-8 h-16 w-16 rounded-full border-2 border-destructive/60 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" strokeWidth={2} />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-4">
            We couldn't confirm this payment
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Nothing has been unlocked yet. If you were charged, you have not lost anything — email{" "}
            <a href="mailto:hello@coachkayelevates.org" className="text-primary underline">
              hello@coachkayelevates.org
            </a>{" "}
            with this page open and we'll fix it personally, fast.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
              <Link to="/pricing">Back to Pricing</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="mailto:hello@coachkayelevates.org">Contact Coach Kay</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "non_book") {
    return (
      <div className="min-h-dvh bg-background text-foreground flex items-center justify-center px-6 py-16">
        <SEOHead
          title="Payment Confirmed — FocusFlow AI"
          description="Thank you — your purchase is confirmed. Coach Kay's team will be in touch shortly with next steps."
          path="/order-success"
          noIndex
        />
        <div className="max-w-2xl w-full text-center">
          <div className="mx-auto mb-8 h-20 w-20 rounded-full border-2 border-primary flex items-center justify-center animate-in zoom-in-50 duration-500">
            <Check className="h-10 w-10 text-primary" strokeWidth={2} />
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl text-foreground mb-4">
            Payment Confirmed
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            {tierLabel
              ? `Welcome to ${tierLabel}. Your access has been unlocked and Coach Kay's team will follow up within 24 hours.`
              : "Thank you for your purchase. Coach Kay's team will follow up within 24 hours with next steps."}
          </p>
          <div className="rounded-lg border border-border/60 bg-card/50 p-6 mb-10 text-left max-w-md mx-auto">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              What happens next
            </h2>
            <ol className="space-y-3 text-sm text-foreground/85">
              {[
                "Check your inbox for your receipt.",
                "Coach Kay's team reviews your account.",
                "You'll receive a personal welcome within 24 hours.",
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full border border-primary/50 text-primary text-xs flex items-center justify-center font-medium shrink-0">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
              <Link to="/community">Join Our Community</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isAutism = mode === "autism";
  const headline = isAutism ? "Your Story Is On Its Way" : "Your Book Journey Begins";
  const lede = isAutism
    ? "We've received your order. Coach Kay's team will review your intake and follow up within 24 hours. Your itemized HSA/FSA receipt and Letter of Medical Necessity template will arrive by email shortly."
    : "We've received your order and your vision. Coach Kay's team will review your intake and be in touch within 24 hours.";

  return (
    <div className="min-h-dvh bg-background text-foreground flex items-center justify-center px-6 py-16">
      <SEOHead
        title="Order Confirmed — FocusFlow AI"
        description="Thank you for your FocusFlow AI order. We've received your intake and Coach Kay's team will be in touch within 24 hours with next steps."
        path="/order-success"
        noIndex
      />
      <div className="max-w-2xl w-full text-center">
        <div className="mx-auto mb-8 h-20 w-20 rounded-full border-2 border-primary flex items-center justify-center animate-in zoom-in-50 duration-500">
          <Check className="h-10 w-10 text-primary" strokeWidth={2} />
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl text-foreground mb-4">
          {headline}
        </h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          {lede}
        </p>

        {summary && (
          <div className="rounded-lg border border-border/60 bg-card/50 p-6 mb-10 text-left">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Order Summary
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Package</dt>
                <dd className="text-foreground font-medium">{summary.package_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Paid</dt>
                <dd className="text-primary font-heading text-lg">
                  {formatUSD(summary.order_total)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Confirmation</dt>
                <dd className="text-foreground">Check your inbox</dd>
              </div>
            </dl>
          </div>
        )}

        {error && (
          <p className="text-destructive text-sm mb-6">{error}</p>
        )}

        <ol className="text-left max-w-xl mx-auto space-y-3 mb-10">
          {[
            "Check your email for confirmation.",
            "We review your intake within 24 hours.",
            "Work begins after vision approval.",
            "Delivery by your turnaround date.",
          ].map((step, i) => (
            <li
              key={step}
              className="flex items-start gap-3 text-sm text-foreground/85"
            >
              <span className="h-6 w-6 rounded-full border border-primary/50 text-primary text-xs flex items-center justify-center font-medium shrink-0">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
            <Link to="/community">Join Our Community</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
