import { useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, MinusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type StageState = "pending" | "done" | "failed" | "not_applicable";

export interface DeliveryStage {
  key: "payment" | "order" | "access_link" | "report" | "email";
  label: string;
  state: StageState;
  detail: string;
}

type RecoveryAction = "resend_next_steps" | "reissue_access_link" | "regenerate_report";

interface DeliveryStatusPanelProps {
  sessionId: string;
  stages: DeliveryStage[];
  /** Called with the refreshed stages after a recovery action succeeds. */
  onRecovered?: (stages: DeliveryStage[]) => void;
  className?: string;
}

/** Recovery offered for each stage that is not done. One button, one action. */
const STAGE_ACTIONS: Partial<Record<DeliveryStage["key"], { action: RecoveryAction; label: string }>> = {
  email: { action: "resend_next_steps", label: "Resend my next-steps email" },
  access_link: { action: "reissue_access_link", label: "Re-issue my access link" },
  report: { action: "regenerate_report", label: "Restart my report" },
};

function StageIcon({ state }: { state: StageState }) {
  if (state === "done") return <CheckCircle2 className="h-4 w-4 text-primary" />;
  if (state === "failed") return <AlertTriangle className="h-4 w-4 text-destructive" />;
  if (state === "pending") return <Clock className="h-4 w-4 text-muted-foreground" />;
  return <MinusCircle className="h-4 w-4 text-muted-foreground/50" />;
}

/**
 * Shows the real state of every delivery stage for one paid order, read from
 * the backend. It never claims a stage is delivered when the row says pending,
 * and offers exactly one recovery button per stuck stage.
 */
export function DeliveryStatusPanel({
  sessionId,
  stages,
  onRecovered,
  className = "",
}: DeliveryStatusPanelProps) {
  const [busy, setBusy] = useState<RecoveryAction | null>(null);

  const visible = stages.filter((s) => s.state !== "not_applicable");
  if (visible.length === 0) return null;

  const run = async (action: RecoveryAction) => {
    setBusy(action);
    try {
      const { data, error } = await supabase.functions.invoke("fulfillment-recovery", {
        body: { session_id: sessionId, action },
      });
      const res = data as { stages?: DeliveryStage[]; error?: string } | null;
      if (error || !res?.stages) {
        toast.error(res?.error || "That didn't go through. Email hello@coachkayelevates.org and we'll sort it out.");
        return;
      }
      onRecovered?.(res.stages);
      toast.success("Done. The status below is now live from your order.");
    } catch {
      toast.error("That didn't go through. Email hello@coachkayelevates.org and we'll sort it out.");
    } finally {
      setBusy(null);
    }
  };

  const stuck = visible.filter((s) => s.state !== "done" && STAGE_ACTIONS[s.key]);

  return (
    <section
      className={`rounded-lg border border-border bg-card/40 p-5 text-left ${className}`}
      aria-label="Delivery status"
    >
      <h2 className="font-mono-label text-[11px] tracking-[0.2em] text-primary/80">
        DELIVERY STATUS
      </h2>
      <ul className="mt-3 space-y-2.5">
        {visible.map((s) => (
          <li key={s.key} className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0">
              <StageIcon state={s.state} />
            </span>
            <span className="text-sm">
              <span className="text-foreground">{s.label}</span>
              <span className="text-muted-foreground">, {s.detail}</span>
            </span>
          </li>
        ))}
      </ul>

      {stuck.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
          {stuck.map((s) => {
            const cfg = STAGE_ACTIONS[s.key]!;
            return (
              <Button
                key={s.key}
                size="sm"
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary/10"
                disabled={busy !== null}
                onClick={() => run(cfg.action)}
              >
                {busy === cfg.action && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                {cfg.label}
              </Button>
            );
          })}
        </div>
      )}

      {stuck.length === 0 && (
        <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          Everything for this order has landed. If something still looks off, email{" "}
          <a href="mailto:hello@coachkayelevates.org" className="text-primary underline">
            hello@coachkayelevates.org
          </a>{" "}
          and I'll look at it personally.
        </p>
      )}
    </section>
  );
}

export default DeliveryStatusPanel;