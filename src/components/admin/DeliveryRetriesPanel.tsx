import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Send, Ban } from "lucide-react";

interface RetryRow {
  id: string;
  message_id: string;
  template_name: string;
  recipient_email: string;
  attempts: number;
  max_attempts: number;
  next_attempt_at: string;
  status: string;
  failure_class: string | null;
  last_error: string | null;
  created_at: string;
}

const tone: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  sent: "bg-primary/15 text-primary",
  exhausted: "bg-destructive/15 text-destructive",
  parked: "bg-secondary text-secondary-foreground",
};

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : ", ");

/**
 * Emails that failed on the provider's side and are being retried on a widening
 * backoff. `exhausted` and `parked` rows are the ones that need a human.
 */
export function DeliveryRetriesPanel() {
  const { toast } = useToast();
  const [rows, setRows] = useState<RetryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("email_delivery_retries")
      .select(
        "id,message_id,template_name,recipient_email,attempts,max_attempts,next_attempt_at,status,failure_class,last_error,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(50);
    setLoading(false);
    if (error) {
      toast({
        title: "Could not load delivery retries",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setRows((data ?? []) as RetryRow[]);
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const retryNow = async (row: RetryRow) => {
    setBusyId(row.id);
    const { error } = await supabase.functions.invoke("retry-failed-emails", {
      body: { retryId: row.id },
    });
    setBusyId(null);
    if (error) {
      toast({ title: "Retry failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Retry sent", description: `Attempted delivery to ${row.recipient_email}.` });
    void load();
  };

  const stopRetrying = async (row: RetryRow) => {
    setBusyId(row.id);
    const { error } = await supabase
      .from("email_delivery_retries")
      .update({ status: "parked", last_error: "stopped by admin" })
      .eq("id", row.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Could not stop retries", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Retries stopped", description: `${row.recipient_email} will not be retried.` });
    void load();
  };

  const needsAttention = rows.filter((r) => r.status === "exhausted" || r.status === "parked").length;

  return (
    <section className="rounded-lg border border-border bg-card/40 p-4 mb-6">
      <header className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="font-heading text-lg text-foreground">Delivery retries</h2>
          <p className="text-sm text-muted-foreground">
            Report emails that failed at the provider. Retried automatically on a widening
            backoff, then handed to you.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {needsAttention > 0 && (
            <Badge variant="outline" className="text-destructive border-destructive/40">
              {needsAttention} need attention
            </Badge>
          )}
          <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : "Nothing waiting on a retry. Every report email landed."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Recipient</th>
                <th className="px-3 py-2 font-medium">Template</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Attempts</th>
                <th className="px-3 py-2 font-medium">Next attempt</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="px-3 py-2 break-all text-foreground">{r.recipient_email}</td>
                  <td className="px-3 py-2 font-mono text-xs break-all text-muted-foreground">
                    {r.template_name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs ${tone[r.status] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {r.status}
                    </span>
                    {r.failure_class && (
                      <div className="text-xs text-muted-foreground mt-1">{r.failure_class}</div>
                    )}
                    {r.last_error && (
                      <div className="text-xs text-muted-foreground mt-1 max-w-[18rem] break-words">
                        {r.last_error}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {r.attempts} of {r.max_attempts}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {r.status === "pending" ? fmt(r.next_attempt_at) : ", "}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === r.id || r.status === "sent"}
                        onClick={() => void retryNow(r)}
                      >
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        Retry now
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === r.id || r.status !== "pending"}
                        onClick={() => void stopRetrying(r)}
                      >
                        <Ban className="h-3.5 w-3.5 mr-1.5" />
                        Stop retrying
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
