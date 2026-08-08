import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLiveRefresh, type LiveRefreshState } from "@/hooks/use-live-refresh";
import { AdminNav } from "@/components/admin/AdminNav";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Send,
  Eye,
  ListPlus,
  RefreshCw,
  Mail,
  MessageSquare,
  CheckCircle2,
  Clock,
  CircleDashed,
  AlertTriangle,
  Radio,
  Pause,
  Play,
} from "lucide-react";

interface Touch {
  id: string;
  step: number;
  template_name: string;
  email: string;
  status: string;
  scheduled_for: string;
  sent_at: string | null;
  attempts: number | null;
  last_error: string | null;
  is_test: boolean;
}

interface StepDef {
  step: number;
  templateName: string;
  requiresReport: boolean;
}

interface AuditInfo {
  id: string;
  email: string | null;
  name: string | null;
  status: string;
  has_report: boolean;
  generated_at: string | null;
  created_at: string;
  stripe_session_id: string | null;
  phone: string | null;
  sms_consent_at: string | null;
  is_test: boolean;
  linked_user: boolean;
}

interface LookupResult {
  found: boolean;
  audit?: AuditInfo;
  suppressed?: boolean;
  steps?: StepDef[];
  touches?: Touch[];
}

interface PreviewResult {
  step: number;
  templateName: string;
  subject: string;
  html: string;
  recipient: string | null;
  requiresReport: boolean;
  hasReport: boolean;
  smsBody: string | null;
}

const statusTone: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  sent: "bg-primary/15 text-primary",
  skipped: "bg-muted text-muted-foreground",
  failed: "bg-destructive/15 text-destructive",
};

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "—");

const DAY_MS = 86_400_000;

/** Mirrors the worker's plan: Day N is scheduled N days after the purchase. */
function plannedSendAt(purchasedAt: string, step: number) {
  return new Date(new Date(purchasedAt).getTime() + step * DAY_MS);
}

/**
 * Why a step has no queue row yet, and what queueing will actually do. Written
 * for a human deciding whether to press the button.
 */
function missingStepReason(
  def: StepDef,
  audit: AuditInfo,
): { reason: string; effect: string } {
  const due = plannedSendAt(audit.created_at, def.step);
  const overdue = due.getTime() < Date.now();
  const effect = overdue
    ? `Queueing creates it dated ${fmt(due.toISOString())}, which is already past, so the worker sends it on its next run.`
    : `Queueing creates it scheduled for ${fmt(due.toISOString())}.`;

  if (def.requiresReport && !audit.has_report) {
    return {
      reason:
        "No queue row exists, and this step needs a generated report. The worker holds it until the report lands.",
      effect,
    };
  }
  return {
    reason:
      "No queue row exists, so nothing will ever send for this step on its own. This happens when the sequence was never planned at checkout, or the row was cleared.",
    effect,
  };
}

export default function AdminNurture() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [confirmStep, setConfirmStep] = useState<number | null>(null);
  const [confirmEnqueue, setConfirmEnqueue] = useState(false);

  const call = useCallback(
    async <T,>(body: Record<string, unknown>): Promise<T | null> => {
      const { data, error } = await supabase.functions.invoke("admin-nurture", { body });
      if (error) {
        let detail = error.message;
        try {
          const ctx = (error as { context?: Response }).context;
          if (ctx) detail = await ctx.text();
        } catch {
          /* keep the original message */
        }
        toast({ title: "Request failed", description: detail, variant: "destructive" });
        return null;
      }
      return data as T;
    },
    [toast],
  );

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setPreview(null);
    const data = await call<LookupResult>({ action: "lookup", query: query.trim() });
    setLoading(false);
    if (!data) return;
    setResult(data);
    if (!data.found) {
      toast({
        title: "No audit found",
        description: "Try the audit ID, the Stripe session ID, or the buyer's email.",
      });
    }
  };

  const refresh = async () => {
    const auditId = result?.audit?.id;
    if (!auditId) return;
    const data = await call<LookupResult>({ action: "lookup", auditId });
    if (data) setResult(data);
  };

  /**
   * Same read as Refresh, but silent. Polling must not toast on every failed
   * attempt, and must not clear a preview the admin is reading.
   * Returns whether the read succeeded so the poller can back off.
   */
  const quietRefresh = useCallback(async (): Promise<boolean> => {
    const auditId = result?.audit?.id;
    if (!auditId) return true;
    const { data, error } = await supabase.functions.invoke("admin-nurture", {
      body: { action: "lookup", auditId },
    });
    if (error) return false;
    const next = data as LookupResult;
    if (!next?.found) return false;
    setResult(next);
    return true;
  }, [result?.audit?.id]);

  const doPreview = async (step: number) => {
    const auditId = result?.audit?.id;
    if (!auditId) return;
    setBusy(`preview-${step}`);
    const data = await call<PreviewResult>({ action: "preview", auditId, step });
    setBusy(null);
    if (data) setPreview(data);
  };

  const doEnqueue = async () => {
    const auditId = result?.audit?.id;
    if (!auditId) return;
    setBusy("enqueue");
    const data = await call<{ inserted: number; reason?: string }>({ action: "enqueue", auditId });
    setBusy(null);
    if (!data) return;
    toast({
      title: data.inserted > 0 ? `Queued ${data.inserted} touch${data.inserted === 1 ? "" : "es"}` : "Nothing to queue",
      description:
        data.inserted > 0
          ? "The worker picks each one up on its scheduled day."
          : "Every step already exists for this audit.",
    });
    await refresh();
  };

  const doResend = async (step: number) => {
    const auditId = result?.audit?.id;
    if (!auditId) return;
    setBusy(`resend-${step}`);
    const data = await call<{ sent: boolean; recipient: string }>({ action: "resend", auditId, step });
    setBusy(null);
    if (!data) return;
    toast({ title: `Day ${step} sent`, description: `Delivered to ${data.recipient}.` });
    await refresh();
  };

  const audit = result?.audit;
  const touches = result?.touches ?? [];
  const steps = result?.steps ?? [];
  const missingSteps = audit ? steps.filter((d) => !touches.some((t) => t.step === d.step)) : [];
  const queuedSteps = steps.filter((d) => touches.some((t) => t.step === d.step));

  // Something can still change: a queued touch has not settled, or a
  // report-dependent step is still waiting on the report to generate.
  const hasWorkInFlight =
    !!audit &&
    (touches.some((t) => t.status === "pending") ||
      (steps.some((d) => d.requiresReport) && !audit.has_report));

  const live = useLiveRefresh({
    refresh: quietRefresh,
    active: hasWorkInFlight,
    enabled: !!audit,
    isBusy: busy !== null || loading,
    onFailureLimit: () =>
      toast({
        title: "Live updates paused",
        description: "Could not reach the nurture service. Use Refresh to try again.",
        variant: "destructive",
      }),
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Nurture Sequences | Admin" description="Preview, queue, and re-send audit nurture emails." path="/admin/nurture" noIndex />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <AdminNav />

        <div className="mb-8">
          <h1 className="font-heading text-3xl font-light flex items-center gap-3">
            <Mail className="h-7 w-7 text-primary" />
            Nurture Sequences
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Look up one audit buyer, see exactly where their Day 1 / 3 / 7 follow-up stands, preview
            each email with their real data, queue missing steps, or re-send one now.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") search();
            }}
            placeholder="Audit ID, Stripe session ID (cs_...), or buyer email"
            aria-label="Search for an audit"
          />
          <Button onClick={search} disabled={loading || !query.trim()} className="shrink-0">
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Searching..." : "Find audit"}
          </Button>
        </div>

        {result && !result.found && (
          <p className="text-muted-foreground">No audit matched that search.</p>
        )}

        {audit && (
          <div className="space-y-8">
            <section className="rounded-lg border border-border bg-card/30 p-5">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <h2 className="font-heading text-xl font-light">{audit.name || "Unnamed buyer"}</h2>
                {audit.is_test && <Badge variant="outline">Test</Badge>}
                {result.suppressed && <Badge className="bg-destructive/15 text-destructive">Suppressed</Badge>}
                {!audit.has_report && <Badge variant="outline">No report yet</Badge>}
                {audit.linked_user && <Badge variant="outline">Account linked</Badge>}
              </div>
              <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2 text-sm">
                <Field label="Email" value={audit.email ?? "— none on file —"} />
                <Field label="Audit status" value={audit.status} />
                <Field label="Audit ID" value={audit.id} mono />
                <Field label="Stripe session" value={audit.stripe_session_id ?? "—"} mono />
                <Field label="Purchased" value={fmt(audit.created_at)} />
                <Field label="Report generated" value={fmt(audit.generated_at)} />
                <Field
                  label="SMS"
                  value={
                    audit.phone && audit.sms_consent_at
                      ? `Consented ${fmt(audit.sms_consent_at)} (${audit.phone})`
                      : "No consent on file, email only"
                  }
                />
              </dl>
              <div className="flex flex-wrap gap-3 mt-5">
                <Button variant="outline" onClick={refresh} disabled={busy !== null}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={() => setConfirmEnqueue(true)}
                  disabled={busy !== null || !audit.email || missingSteps.length === 0}
                >
                  <ListPlus className="h-4 w-4 mr-2" />
                  {busy === "enqueue"
                    ? "Queueing..."
                    : missingSteps.length === 0
                      ? "All steps queued"
                      : `Queue ${missingSteps.length} missing step${missingSteps.length === 1 ? "" : "s"}`}
                </Button>
                <LiveIndicator state={live.state} onPause={live.pause} onResume={live.resume} />
              </div>
              {!audit.email && (
                <p className="text-sm text-muted-foreground mt-3">
                  This audit has no email address, so nothing can be queued or sent for it.
                </p>
              )}
            </section>

            <section>
              <h2 className="font-heading text-xl font-light mb-2">Queue coverage</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {missingSteps.length === 0
                  ? "Every step in this sequence has a row in the queue. Nothing needs to be added before you send."
                  : `${queuedSteps.length} of ${steps.length} steps are queued. The ${missingSteps.length} below have no row, so the worker will never send them until you queue them.`}
              </p>
              <div className="grid gap-3 sm:grid-cols-3 mb-4">
                {steps.map((def) => {
                  const touch = touches.find((t) => t.step === def.step);
                  const queued = touch !== undefined;
                  const overdue =
                    touch?.status === "pending" && new Date(touch.scheduled_for).getTime() < Date.now();
                  const Icon = !queued
                    ? CircleDashed
                    : touch!.status === "sent"
                      ? CheckCircle2
                      : touch!.status === "failed"
                        ? AlertTriangle
                        : Clock;
                  const tone = !queued
                    ? "border-dashed border-border text-muted-foreground"
                    : touch!.status === "failed"
                      ? "border-destructive/40 text-destructive"
                      : touch!.status === "sent"
                        ? "border-primary/40 text-primary"
                        : "border-border text-foreground";
                  return (
                    <div key={def.step} className={`rounded-lg border p-3 ${tone}`}>
                      <p className="flex items-center gap-2 font-medium">
                        <Icon className="h-4 w-4" />
                        Day {def.step}
                      </p>
                      <p className="text-xs mt-1">
                        {!queued
                          ? "Not queued"
                          : touch!.status === "sent"
                            ? `Sent ${fmt(touch!.sent_at)}`
                            : overdue
                              ? `Overdue since ${fmt(touch!.scheduled_for)}`
                              : `${touch!.status} · ${fmt(touch!.scheduled_for)}`}
                      </p>
                    </div>
                  );
                })}
              </div>
              {missingSteps.length > 0 && (
                <ul className="space-y-3">
                  {missingSteps.map((def) => {
                    const { reason, effect } = missingStepReason(def, audit);
                    return (
                      <li key={def.step} className="rounded-lg border border-dashed border-border p-4">
                        <p className="font-medium flex items-center gap-2">
                          <ListPlus className="h-4 w-4 text-primary" />
                          Day {def.step} will be added
                          <span className="text-xs font-mono text-muted-foreground">{def.templateName}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{reason}</p>
                        <p className="text-sm text-muted-foreground mt-1">{effect}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section>
              <h2 className="font-heading text-xl font-light mb-4">Sequence</h2>
              <div className="space-y-3">
                {steps.map((def) => {
                  const touch = touches.find((t) => t.step === def.step);
                  return (
                    <div
                      key={def.step}
                      className="rounded-lg border border-border bg-card/30 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">Day {def.step}</span>
                          <span className="text-xs text-muted-foreground font-mono">{def.templateName}</span>
                          <Badge className={statusTone[touch?.status ?? "pending"] ?? "bg-muted"}>
                            {touch ? touch.status : "not queued"}
                          </Badge>
                          {def.requiresReport && !audit.has_report && (
                            <Badge variant="outline">Waits for report</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {touch
                            ? touch.status === "sent"
                              ? `Sent ${fmt(touch.sent_at)}`
                              : `Scheduled ${fmt(touch.scheduled_for)}${
                                  touch.attempts ? ` · ${touch.attempts} attempt(s)` : ""
                                }`
                            : "No row in the queue for this step."}
                        </p>
                        {touch?.last_error && (
                          <p className="text-sm text-destructive mt-1 break-words">{touch.last_error}</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => doPreview(def.step)}
                          disabled={busy !== null}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {busy === `preview-${def.step}` ? "Loading..." : "Preview"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setConfirmStep(def.step)}
                          disabled={busy !== null || !audit.email || result.suppressed === true}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {busy === `resend-${def.step}` ? "Sending..." : "Send now"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>

      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading font-light">
              Day {preview?.step}: {preview?.subject}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Rendered with this buyer's real data. Goes to {preview?.recipient ?? "no address on file"}.
          </p>
          {preview !== null && audit && (
            touches.some((t) => t.step === preview.step) ? (
              <p className="text-sm text-muted-foreground">
                Day {preview.step} is already in the queue
                {(() => {
                  const t = touches.find((x) => x.step === preview.step)!;
                  return t.status === "sent"
                    ? `, sent ${fmt(t.sent_at)}.`
                    : ` as ${t.status}, scheduled ${fmt(t.scheduled_for)}.`;
                })()}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Day {preview.step} is not queued yet. {missingStepReason(
                  { step: preview.step, templateName: preview.templateName, requiresReport: preview.requiresReport },
                  audit,
                ).effect}
              </p>
            )
          )}
          {preview?.requiresReport && !preview?.hasReport && (
            <p className="text-sm text-destructive">
              This step needs a generated report. The worker holds it until one exists.
            </p>
          )}
          {preview?.html && (
            <iframe
              title="Email preview"
              srcDoc={preview.html}
              sandbox=""
              className="w-full h-[55vh] rounded-md border border-border bg-white"
            />
          )}
          {preview?.smsBody && (
            <div className="rounded-md border border-border p-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Text companion
              </p>
              <p className="text-sm text-muted-foreground mt-1">{preview.smsBody}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmStep !== null} onOpenChange={(open) => !open && setConfirmStep(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Day {confirmStep} now?</AlertDialogTitle>
            <AlertDialogDescription>
              This emails {audit?.email} immediately, even if that step already went out. Use it to
              repair a missed or failed send.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const step = confirmStep;
                setConfirmStep(null);
                if (step !== null) doResend(step);
              }}
            >
              Send it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmEnqueue} onOpenChange={setConfirmEnqueue}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Queue {missingSteps.length} missing step{missingSteps.length === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left">
                <p>
                  Steps already in the queue are left untouched. Only these get created for{" "}
                  {audit?.email}:
                </p>
                <ul className="space-y-2">
                  {audit &&
                    missingSteps.map((def) => (
                      <li key={def.step}>
                        <span className="font-medium text-foreground">Day {def.step}</span>{" "}
                        {missingStepReason(def, audit).effect}
                      </li>
                    ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmEnqueue(false);
                doEnqueue();
              }}
            >
              Queue them
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 break-words ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

/**
 * States the poller can be in, said plainly. The copy always tells the admin
 * whether what they are looking at is moving on its own or frozen.
 */
function LiveIndicator({
  state,
  onPause,
  onResume,
}: {
  state: LiveRefreshState;
  onPause: () => void;
  onResume: () => void;
}) {
  if (state === "idle") return null;

  const copy: Record<Exclude<LiveRefreshState, "idle">, string> = {
    polling: "Live, updating every 5s",
    reconnecting: "Reconnecting, showing last known status",
    "paused-hidden": "Paused while this tab is in the background",
    "paused-manual": "Live updates off",
    "paused-timeout": "Paused after 5 minutes of no change",
    settled: "All steps settled, live updates off",
  };

  const isRunning = state === "polling" || state === "reconnecting";
  const canResume = state === "paused-manual" || state === "paused-timeout";

  return (
    <div
      className="flex items-center gap-2 text-xs text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Radio
        className={`h-3.5 w-3.5 ${
          state === "polling"
            ? "text-primary animate-pulse"
            : state === "reconnecting"
              ? "text-destructive"
              : ""
        }`}
        aria-hidden
      />
      <span>{copy[state]}</span>
      {isRunning && (
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onPause}>
          <Pause className="h-3 w-3 mr-1" />
          Pause
        </Button>
      )}
      {canResume && (
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onResume}>
          <Play className="h-3 w-3 mr-1" />
          Resume
        </Button>
      )}
    </div>
  );
}

function FieldUnused({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 break-words ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
