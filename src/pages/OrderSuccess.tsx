import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { NextStepsPanel } from "@/components/NextStepsPanel";
import { DeliveryStatusPanel, type DeliveryStage } from "@/components/DeliveryStatusPanel";
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
  /** Pre-discount amount. Drives which call is offered, so coupons and $0
   *  internal test runs can't misclassify a real purchase. */
  amount_subtotal?: number | null;
  customer_email?: string | null;
  mode?: string;
  /** Which fulfillment table holds the order, from the backend. */
  fulfilled_in?: string | null;
  /** Per-stage delivery truth, every value read from a real row. */
  stages?: DeliveryStage[];
  complete?: boolean;
  needs_attention?: boolean;
}

/** Human label for a purchase when no package name or tier is available.
 *  Derived from the fulfillment table the backend actually found. */
const FULFILLMENT_LABELS: Record<string, string> = {
  business_audits: "AI Business Audit",
  one_time_orders: "One-Time Purchase",
  agent_orders: "Agent Build",
  book_orders: "Book Package",
  autism_orders: "Social Story Package",
};

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const tierParam = params.get("tier");
  const orderType = params.get("type");
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [mode, setMode] = useState<"loading" | "book" | "autism" | "non_book">("loading");
  const [verify, setVerify] = useState<VerifyState>(sessionId ? "checking" : "failed");
  const [verified, setVerified] = useState<VerifyResult | null>(null);
  const [stages, setStages] = useState<DeliveryStage[] | null>(null);
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
        if (res.stages) setStages(res.stages);
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
          {sessionId && stages && verify === "processing" && (
            <DeliveryStatusPanel
              sessionId={sessionId}
              stages={stages}
              onRecovered={setStages}
              className="mt-8"
            />
          )}
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
              <Link to="/modules">Back to Offers</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="mailto:hello@coachkayelevates.org">Contact Coach Kay</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fulfillment is confirmed. Everything below is driven by the backend
  // verification response and the fulfillment row — never by URL params.
  const isAutism = mode === "autism";
  const isBookish = isAutism || mode === "book";

  const headline = isAutism
    ? "Your Story Is On Its Way"
    : mode === "book"
      ? "Your Book Journey Begins"
      : "Payment Confirmed";

  const lede = isAutism
    ? "Your order is confirmed and your intake is in. Your itemized HSA/FSA receipt and Letter of Medical Necessity template will arrive by email shortly."
    : mode === "book"
      ? "Your order and your vision are both confirmed. Here's what you can do right now while the work gets underway."
      : tierLabel
        ? `Welcome to ${tierLabel}. Your access is unlocked — here's what to do now.`
        : "Your purchase is confirmed and your access is unlocked. Here's what to do now.";

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center px-6 py-16">
      <SEOHead
        title={
          isBookish
            ? "Order Confirmed — FocusFlow AI"
            : "Payment Confirmed — FocusFlow AI"
        }
        description="Your purchase is confirmed and your access is unlocked. Book your call or start your first challenge."
        path="/order-success"
        noIndex
      />
      <NextStepsPanel
        headline={headline}
        lede={lede}
        productName={
          summary?.package_name ??
          tierLabel ??
          (verified?.fulfilled_in ? FULFILLMENT_LABELS[verified.fulfilled_in] ?? null : null)
        }
        amountSubtotalCents={verified?.amount_subtotal ?? verified?.amount_total ?? null}
        amountTotalCents={verified?.amount_total ?? null}
        customerEmail={verified?.customer_email ?? null}
        mode={verified?.mode ?? null}
        sessionId={sessionId}
        orderSource={verified?.fulfilled_in ?? null}
      />
      {sessionId && stages && (
        <DeliveryStatusPanel
          sessionId={sessionId}
          stages={stages}
          onRecovered={setStages}
          className="mt-8 w-full max-w-2xl"
        />
      )}
    </div>
  );
}
