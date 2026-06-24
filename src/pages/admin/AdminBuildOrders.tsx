import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/use-roles";
import { useNavigate } from "react-router-dom";

interface BuildOrder {
  id: string;
  created_at: string;
  guest_email: string | null;
  guest_name: string | null;
  product_name: string;
  price_cents: number;
  order_type: string;
  status: string;
  user_id: string | null;
}

const formatUSD = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  in_progress: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function AdminBuildOrders() {
  const { isAdmin, loading: rolesLoading } = useRoles();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<BuildOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("build_studio_orders" as never)
      .select("id, created_at, guest_email, guest_name, product_name, price_cents, order_type, status, user_id")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    else setOrders((data ?? []) as BuildOrder[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await (supabase.from("build_studio_orders" as never) as ReturnType<typeof supabase.from>)
      .update({ status })
      .eq("id", id);
    setUpdatingId(null);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else load();
  };

  if (rolesLoading) return null;
  if (!isAdmin) { navigate("/dashboard"); return null; }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNav />
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl text-foreground">Build Studio Orders</h1>
          <Button onClick={load} variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">Refresh</Button>
        </div>
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground">No Build Studio orders yet.</p>
        ) : (
          <div className="rounded-lg border border-border/60 bg-card/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/20 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">When</th>
                    <th className="text-left px-4 py-3">Buyer</th>
                    <th className="text-left px-4 py-3">Product</th>
                    <th className="text-left px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Type</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/5">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{o.guest_name || "—"}</p>
                        <p className="text-muted-foreground text-xs">{o.guest_email || "signed-in user"}</p>
                      </td>
                      <td className="px-4 py-3">{o.product_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatUSD(o.price_cents)}</td>
                      <td className="px-4 py-3 capitalize">{o.order_type.replace("_", " ")}</td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_COLORS[o.status] ?? ""}>{o.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          disabled={updatingId === o.id}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="text-xs rounded border border-border bg-background px-2 py-1"
                        >
                          <option value="confirmed">confirmed</option>
                          <option value="in_progress">in_progress</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
