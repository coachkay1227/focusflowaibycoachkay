import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/use-roles";
import SEOHead from "@/components/SEOHead";
import {
  PlayCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  MinusCircle,
  ExternalLink,
} from "lucide-react";

type CheckState = "pass" | "fail" | "pending" | "skipped";

interface Check {
  key: string;
  label: string;
  state: CheckState;
  detail: string;
  evidence?: Record<string, unknown>;
}

interface StatusResult {
  overall: "passed" | "failed" | "in_progress";
  session_id: string;
  audit_id: string | null;
  email: string;
  report_url: string | null;
  checks: Check[];
  checked_at: string;
}

interface StartResult {
  audit_id: string;
  session_id: string;
  checkout_url: string;
  email: string;
  amount_total: number;
  promo_remaining: number | null;
}

const RUN_KEY = "ffai_fulfillment_test_run";

const stateMeta: Record<CheckState, { icon: typeof CheckCircle2; className: string; label: string }> = {
  pass: { icon: CheckCircle2, className: "text-primary", label: "Pass" },
  fail: { icon: XCircle, className: "text-destructive", label: "Fail" },
  pending: { icon: Clock, className: "text-muted-foreground", label: "Waiting" },
  skipped: { icon: MinusCircle, className: "text-muted-foreground", label: "Skipped" },
};

export default function AdminFulfillmentTest() {
  const { isAdmin, loading: rolesLoading } = useRoles();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [starting, setStarting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [run, setRun] = useState<StartResult | null>(null);
  const [status, setStatus] = useState<StatusResult | null>(null);

  useEffect(() => {
    if (!rolesLoading && !isAdmin) navigate("/dashboard");
  }, [isAdmin, rolesLoading, navigate]);

  // Restore the in-flight run so returning from Stripe keeps the context.
  useEffect(() => {
    const saved = sessionStorage.getItem(RUN_KEY);
    if (saved) {
      try {
        setRun(JSON.parse(saved) as StartResult);
      } catch {
        sessionStorage.removeItem(RUN_KEY);
      }
    }
  }, []);

  const startTest = async () => {
    setStarting(true);
    setStatus(null);
    try {
      const { data, error } = await supabase.functions.invoke("run-audit-fulfillment-test", {
        body: { action: "start" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const result = data as StartResult;
      setRun(result);
      sessionStorage.setItem(RUN_KEY, JSON.stringify(result));
      window.open(result.checkout_url, "_blank", "noopener,noreferrer");
      toast({
        title: "Test checkout opened",
        description: "Complete the $0 checkout in the new tab, then run the status check.",
      });
    } catch (e) {
      toast({ title: "Could not start test", description: (e as Error).message, variant: "destructive" });
    } finally {
      setStarting(false);
    }
  };

  const checkStatus = async (sessionId?: string) => {
    const id = sessionId ?? run?.session_id;
    if (!id) return;
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("run-audit-fulfillment-test", {
        body: { action: "status", session_id: id, audit_id: run?.audit_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStatus(data as StatusResult);
    } catch (e) {
      toast({ title: "Status check failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setChecking(false);
    }
  };

  const overallBadge = () => {
    if (!status) return null;
    if (status.overall === "passed") {
      return <Badge className="bg-primary/15 text-primary border-primary/30">All stages verified</Badge>;
    }
    if (status.overall === "failed") {
      return <Badge variant="destructive">Fulfillment broken</Badge>;
    }
    return <Badge variant="outline">In progress</Badge>;
  };

  if (rolesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
        <SEOHead title="Fulfillment Test | Admin" noIndex />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <AdminNav />

        <header className="mb-6">
          <h1 className="font-display text-3xl text-foreground mb-2">Fulfillment Test</h1>
          <p className="text-muted-foreground text-sm">
            Runs a real $47 AI Business Audit purchase with the FFTEST100 promo (100% off, so you pay
            nothing) and reports the actual backend result of every fulfillment stage. Nothing here is
            simulated — each row reads the live Stripe or database record.
          </p>
        </header>

        <div className="rounded-lg border border-border bg-card/40 p-5 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={startTest} disabled={starting}>
              <PlayCircle className={`h-4 w-4 mr-2 ${starting ? "animate-pulse" : ""}`} />
              {starting ? "Opening checkout…" : "Run $47 FFTEST100 test"}
            </Button>
            <Button variant="outline" onClick={() => checkStatus()} disabled={checking || !run}>
              <RefreshCw className={`h-4 w-4 mr-2 ${checking ? "animate-spin" : ""}`} />
              Check results
            </Button>
            {run && (
              <Button variant="ghost" asChild>
                <a href={run.checkout_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Reopen checkout
                </a>
              </Button>
            )}
            {overallBadge()}
          </div>

          {run && (
            <dl className="mt-4 grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
              <div>
                <dt className="font-medium text-foreground">Test buyer</dt>
                <dd className="break-all">{run.email}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Stripe session</dt>
                <dd className="break-all font-mono">{run.session_id}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Pending audit row</dt>
                <dd className="break-all font-mono">{run.audit_id}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Promo redemptions left</dt>
                <dd>{run.promo_remaining ?? "unlimited"}</dd>
              </div>
            </dl>
          )}

          {!run && (
            <p className="mt-4 text-xs text-muted-foreground">
              The run is flagged <span className="font-mono">is_test = true</span>, so it never pollutes
              real orders or lead follow-up.
            </p>
          )}
        </div>

        {status && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-foreground">Results</h2>
              <span className="text-xs text-muted-foreground">
                Checked {new Date(status.checked_at).toLocaleTimeString()}
              </span>
            </div>

            {status.checks.map((check) => {
              const meta = stateMeta[check.state];
              const Icon = meta.icon;
              return (
                <div key={check.key} className="rounded-lg border border-border bg-card/30 p-4">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${meta.className}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium text-foreground">{check.label}</h3>
                        <Badge variant="outline" className="text-[10px]">
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground break-words">{check.detail}</p>
                      {check.evidence && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground">
                            Raw evidence
                          </summary>
                          <pre className="mt-2 overflow-x-auto rounded bg-background/60 p-2 text-[10px] text-muted-foreground">
                            {JSON.stringify(check.evidence, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {status.report_url && (
              <Button variant="outline" asChild className="mt-2">
                <a href={status.report_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open the delivered report
                </a>
              </Button>
            )}
          </section>
        )}
      </div>
    </div>
  );
}