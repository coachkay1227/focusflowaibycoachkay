import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

interface Health {
  failures_7d: number;
  processed_7d: number;
  latest_failure: { stage: string; reason: string; message: string | null; created_at: string } | null;
  last_processed: { event_type: string; processed_at: string } | null;
  verifier_broken: boolean;
  status: "healthy" | "degraded" | "critical";
}

/** Surfaces Stripe webhook health so a broken fulfillment path is visible
 *  instead of silent. A failing verifier means no payment can be fulfilled. */
export const WebhookHealthBanner = () => {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    supabase.functions
      .invoke("admin-webhook-health")
      .then(({ data }) => {
        if (data && !data.error) setHealth(data as Health);
      })
      .catch(() => {});
  }, []);

  if (!health) return null;

  const critical = health.status === "critical";
  const degraded = health.status === "degraded";
  const Icon = critical ? ShieldAlert : degraded ? AlertTriangle : CheckCircle2;

  return (
    <div
      className={`mb-6 rounded-lg border p-4 ${
        critical
          ? "border-destructive/50 bg-destructive/10"
          : degraded
            ? "border-accent/40 bg-accent/5"
            : "border-border bg-card"
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${
            critical ? "text-destructive" : degraded ? "text-accent" : "text-primary"
          }`}
        />
        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {critical
              ? "Payment webhook is broken — purchases cannot be fulfilled"
              : degraded
                ? "Payment webhook reported failures"
                : "Payment webhook healthy"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {health.processed_7d} event{health.processed_7d === 1 ? "" : "s"} processed and{" "}
            {health.failures_7d} failure{health.failures_7d === 1 ? "" : "s"} in the last 7 days
            {health.last_processed
              ? ` · last event ${health.last_processed.event_type}`
              : " · no event processed yet"}
          </p>
          {health.latest_failure && (
            <p className="mt-1 break-words text-xs text-muted-foreground">
              Latest failure: {health.latest_failure.stage} / {health.latest_failure.reason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};