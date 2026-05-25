import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/lib/book-store";
import { trackEvent } from "@/lib/analytics";

interface OrderSummary {
  package_name: string;
  order_total: number;
}

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session id");
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-book-order", {
          body: { session_id: sessionId },
        });
        if (error) throw error;
        setSummary(data as OrderSummary);
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
        setError(err instanceof Error ? err.message : "Could not verify order");
      }
    })();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-16">
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
