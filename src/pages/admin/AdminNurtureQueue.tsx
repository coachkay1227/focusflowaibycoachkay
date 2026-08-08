import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminNav } from "@/components/admin/AdminNav";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RefreshCw, Copy, AlertTriangle } from "lucide-react";
import { DeliveryRetriesPanel } from "@/components/admin/DeliveryRetriesPanel";

interface QueueRow {
  id: string;
  audit_id: string;
  email: string;
  step: number;
  template_name: string;
  queue_status: string;
  scheduled_for: string;
  sent_at: string | null;
  attempts: number;
  last_error: string | null;
  is_test: boolean;
  idempotency_key: string;
  delivery_status: string | null;
  delivery_error: string | null;
  delivery_at: string | null;
  overdue: boolean;
}

interface StepSummary {
  step: number;
  templateName: string;
  total: number;
  pending: number;
  sent: number;
  skipped: number;
  failed: number;
  overdue: number;
  delivered: number;
  delivery_failed: number;
  suppressed: number;
  no_delivery_record: number;
}

const queueTone: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  sent: "bg-primary/15 text-primary",
  skipped: "bg-muted text-muted-foreground",
  failed: "bg-destructive/15 text-destructive",
};

const deliveryTone: Record<string, string> = {
  sent: "bg-primary/15 text-primary",
  pending: "bg-muted text-muted-foreground",
  suppressed: "bg-secondary text-secondary-foreground",
  dlq: "bg-destructive/15 text-destructive",
  failed: "bg-destructive/15 text-destructive",
  bounced: "bg-destructive/15 text-destructive",
  complained: "bg-destructive/15 text-destructive",
};

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "—");

const DAY_OPTIONS = [7, 30, 90];
const STATUS_OPTIONS = ["all", "pending", "sent", "skipped", "failed"];

export default function AdminNurtureQueue() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [perStep, setPerStep] = useState<StepSummary[]>([]);
  const [days, setDays] = useState(30);
  const [status, setStatus] = useState("all");
  const [stepFilter, setStepFilter] = useState<number | null>(null);
  const [includeTest, setIncludeTest] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-nurture", {
        body: {
          action: "queue",
          days,
          status,
          includeTest,
          ...(stepFilter ? { step: stepFilter } : {}),
        },
      });
      if (error) throw error;
      setRows((data?.rows ?? []) as QueueRow[]);
      setPerStep((data?.perStep ?? []) as StepSummary[]);
    } catch (err) {
      toast({
        title: "Could not load the nurture queue",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [days, status, stepFilter, includeTest, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast({ title: "Idempotency key copied" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const term = search.trim().toLowerCase();
  const visible = term
    ? rows.filter(
        (r) =>
          r.email.toLowerCase().includes(term) ||
          r.audit_id.toLowerCase().includes(term) ||
          r.idempotency_key.toLowerCase().includes(term),
      )
    : rows;

  const attention = rows.filter(
    (r) =>
      r.overdue ||
      r.queue_status === "failed" ||
      (r.queue_status === "sent" && r.delivery_status === null),
  ).length;

  return (
    <div className="min-h-dvh bg-background">
      <SEOHead title="Nurture Queue Status" description="Fulfillment status of the audit nurture sequence." path="/admin/nurture-queue" noIndex />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AdminNav />

        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl text-foreground">Nurture Queue Status</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Every queued Day 1, Day 3, and Day 7 touch, its delivery outcome, and the idempotency key it was sent under.
            </p>
          </div>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </header>

        <DeliveryRetriesPanel />

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {perStep.map((s) => (
            <div key={s.step} className="rounded-lg border border-border bg-card/40 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg text-foreground">Day {s.step}</h2>
                <Badge variant="outline">{s.total} queued</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-mono break-all">{s.templateName}</p>
              <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Delivered</dt>
                <dd className="text-right text-foreground">{s.delivered}</dd>
                <dt className="text-muted-foreground">Marked sent</dt>
                <dd className="text-right text-foreground">{s.sent}</dd>
                <dt className="text-muted-foreground">Pending</dt>
                <dd className="text-right text-foreground">{s.pending}</dd>
                <dt className="text-muted-foreground">Overdue</dt>
                <dd className={`text-right ${s.overdue > 0 ? "text-destructive" : "text-foreground"}`}>{s.overdue}</dd>
                <dt className="text-muted-foreground">Skipped</dt>
                <dd className="text-right text-foreground">{s.skipped}</dd>
                <dt className="text-muted-foreground">Queue failed</dt>
                <dd className={`text-right ${s.failed > 0 ? "text-destructive" : "text-foreground"}`}>{s.failed}</dd>
                <dt className="text-muted-foreground">Delivery failed</dt>
                <dd className={`text-right ${s.delivery_failed > 0 ? "text-destructive" : "text-foreground"}`}>{s.delivery_failed}</dd>
                <dt className="text-muted-foreground">Suppressed</dt>
                <dd className="text-right text-foreground">{s.suppressed}</dd>
                <dt className="text-muted-foreground">Sent, no log</dt>
                <dd className={`text-right ${s.no_delivery_record > 0 ? "text-destructive" : "text-foreground"}`}>{s.no_delivery_record}</dd>
              </dl>
            </div>
          ))}
          {perStep.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">No touches in this window.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex gap-1">
            {DAY_OPTIONS.map((d) => (
              <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>
                Last {d}d
              </Button>
            ))}
          </div>
          <div className="flex gap-1">
            {STATUS_OPTIONS.map((s) => (
              <Button key={s} size="sm" variant={status === s ? "default" : "outline"} onClick={() => setStatus(s)}>
                {s === "all" ? "All statuses" : s}
              </Button>
            ))}
          </div>
          <div className="flex gap-1">
            {[null, 1, 3, 7].map((s) => (
              <Button
                key={String(s)}
                size="sm"
                variant={stepFilter === s ? "default" : "outline"}
                onClick={() => setStepFilter(s)}
              >
                {s === null ? "All steps" : `Day ${s}`}
              </Button>
            ))}
          </div>
          <Button size="sm" variant={includeTest ? "default" : "outline"} onClick={() => setIncludeTest((v) => !v)}>
            {includeTest ? "Including test rows" : "Live only"}
          </Button>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by email, audit ID, or key"
            className="w-full sm:w-72"
          />
        </div>

        {attention > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {attention} touch{attention === 1 ? "" : "es"} need attention (overdue, failed, or sent without a delivery record).
          </div>
        )}

        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-3 py-2">Step</th>
                <th className="text-left font-medium px-3 py-2">Recipient</th>
                <th className="text-left font-medium px-3 py-2">Queue</th>
                <th className="text-left font-medium px-3 py-2">Delivery</th>
                <th className="text-left font-medium px-3 py-2">Scheduled</th>
                <th className="text-left font-medium px-3 py-2">Sent</th>
                <th className="text-left font-medium px-3 py-2">Tries</th>
                <th className="text-left font-medium px-3 py-2">Idempotency key</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="px-3 py-2 whitespace-nowrap">
                    Day {r.step}
                    {r.is_test && <Badge variant="outline" className="ml-2">test</Badge>}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-foreground break-all">{r.email}</div>
                    <div className="text-xs text-muted-foreground font-mono break-all">{r.audit_id}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs ${queueTone[r.queue_status] ?? "bg-muted text-muted-foreground"}`}>
                      {r.queue_status}
                    </span>
                    {r.overdue && <div className="text-xs text-destructive mt-1">overdue</div>}
                    {r.last_error && <div className="text-xs text-muted-foreground mt-1 max-w-[16rem] break-words">{r.last_error}</div>}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {r.delivery_status ? (
                      <span className={`inline-block rounded px-2 py-0.5 text-xs ${deliveryTone[r.delivery_status] ?? "bg-muted text-muted-foreground"}`}>
                        {r.delivery_status}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">no log</span>
                    )}
                    {r.delivery_error && (
                      <div className="text-xs text-destructive mt-1 max-w-[16rem] break-words">{r.delivery_error}</div>
                    )}
                    {r.delivery_at && <div className="text-xs text-muted-foreground mt-1">{fmt(r.delivery_at)}</div>}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{fmt(r.scheduled_for)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{fmt(r.sent_at)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.attempts}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-start gap-2">
                      <code className="text-xs break-all">{r.idempotency_key}</code>
                      <Button size="icon" variant="ghost" aria-label="Copy idempotency key" onClick={() => void copyKey(r.idempotency_key)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                    {loading ? "Loading..." : "No touches match these filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
