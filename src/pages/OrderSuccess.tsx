import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
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

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const tierParam = params.get("tier");
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"loading" | "book" | "non_book">("loading");

  useEffect(() => {
    if (!sessionId) {
      // No session id — likely a non-book flow (e.g. legacy redirect).
      setMode("non_book");
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-book-order", {
          body: { session_id: sessionId },
        });
        if (error || !data || !(data as OrderSummary).package_name) {
          // No matching book_orders row — treat as a non-book checkout
          // (Rent-an-Agent subscription, AI Audit, Strategy Intensive, etc.)
          setMode("non_book");
          return;
        }
        setSummary(data as OrderSummary);
        setMode("book");
        void trackEvent(
          "studio_checkout_paid",
          {
            session_id: sessionId,
            package_name: (data as OrderSummary | null)?.package_name,
            order_total_cents: (data as OrderSummary | null)?.order_total,
          },
          "studio"
        );
      } catch (err) {
        // Treat verification failure as a non-book order rather than a hard error.
        setMode("non_book");
      }
    })();
  }, [sessionId]);

  const tierLabel =
    tierParam && (TIER_LABELS as Record<string, string>)[tierParam]
      ? TIER_LABELS[tierParam as AccessTier]
      : null;

  if (mode === "non_book") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-16">
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

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-16">
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
          Your Book Journey Begins
        </h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          We&apos;ve received your order and your vision. Coach Kay&apos;s team will review
          your intake and be in touch within 24 hours.
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
