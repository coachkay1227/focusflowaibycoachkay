import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AutismOrderRow {
  id: string;
  created_at: string;
  client_name: string;
  client_email: string;
  package_name: string;
  package_slug: string | null;
  order_total: number;
  status: string;
  child_first_name: string | null;
  scenario_focus: string | null;
  download_url: string | null;
  delivered_at: string | null;
}

const formatUSD = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export default function AdminAutismOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<AutismOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("autism_orders")
      .select("id, created_at, client_name, client_email, package_name, package_slug, order_total, status, child_first_name, scenario_focus, download_url, delivered_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    } else {
      setOrders((data ?? []) as AutismOrderRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deliver = async (order: AutismOrderRow) => {
    const url = (urlDraft[order.id] ?? "").trim();
    if (!url) {
      toast({ title: "Download URL required", description: "Paste the link to the finished PDF first.", variant: "destructive" });
      return;
    }
    try {
      new URL(url);
    } catch {
      toast({ title: "Invalid URL", description: "Must be a valid http(s) link.", variant: "destructive" });
      return;
    }
    setBusyId(order.id);
    const { error } = await supabase.functions.invoke("update-autism-order", {
      body: { id: order.id, status: "delivered", download_url: url },
    });
    setBusyId(null);
    if (error) {
      toast({ title: "Delivery failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Story delivered", description: `Email sent to ${order.client_email}` });
    }
    load();
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNav />
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl text-foreground">Autism Studio Orders</h1>
          <Button onClick={load} variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
            Refresh
          </Button>
        </div>

        <div className="rounded-lg border border-border/60 bg-card/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/20 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">Child / Scenario</th>
                  <th className="text-left px-4 py-3">Package</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3 min-w-[320px]">Deliver</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Loading…</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No autism orders yet.</td></tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="border-t border-border/40 align-top">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {o.id.slice(0, 8)}
                        <div className="text-[10px] mt-1">{new Date(o.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-foreground">{o.client_name}</div>
                        <div className="text-xs text-muted-foreground">{o.client_email}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="text-foreground">{o.child_first_name ?? "—"}</div>
                        <div className="text-muted-foreground">{o.scenario_focus ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-foreground">{o.package_name}</td>
                      <td className="px-4 py-3 text-right text-primary font-medium">{formatUSD(o.order_total)}</td>
                      <td className="px-4 py-3 text-xs">
                        <div className="text-foreground capitalize">{o.status.replace(/_/g, " ")}</div>
                        {o.delivered_at && (
                          <div className="text-[10px] text-muted-foreground mt-1">
                            Delivered {new Date(o.delivered_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {o.status === "paid" || o.status === "in_progress" ? (
                          <div className="flex flex-col gap-2">
                            <Input
                              value={urlDraft[o.id] ?? ""}
                              onChange={(e) => setUrlDraft((d) => ({ ...d, [o.id]: e.target.value }))}
                              placeholder="https://… PDF download link"
                              className="bg-background/40 border-border/60 text-xs"
                            />
                            <Button
                              size="sm"
                              disabled={busyId === o.id}
                              onClick={() => deliver(o)}
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              {busyId === o.id ? "Sending…" : "Deliver story"}
                            </Button>
                          </div>
                        ) : o.status === "delivered" && o.download_url ? (
                          <a href={o.download_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline break-all">
                            {o.download_url}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">Awaiting payment</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}