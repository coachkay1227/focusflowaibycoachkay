import { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { StatusBadge } from "@/components/store/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  findPackage,
  formatUSD,
  type BookCategory,
} from "@/lib/book-store";

interface OrderRow {
  id: string;
  created_at: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  referral_source: string;
  package_slug: string;
  package_name: string;
  package_price: number;
  book_purpose: string;
  book_vision: string;
  characters: string | null;
  illustration_style: string;
  special_requirements: string | null;
  addons: Array<string> | unknown;
  addons_total: number;
  order_total: number;
  status: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  admin_notes: string | null;
}

const STATUSES = ["pending_payment", "paid", "in_progress", "delivered", "cancelled"];
const CATEGORIES: Array<BookCategory | "all"> = ["all", "children", "coloring", "nonfiction"];

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [drawer, setDrawer] = useState<OrderRow | null>(null);
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("book_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) {
      toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    } else {
      setOrders((data ?? []) as OrderRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (categoryFilter !== "all") {
        const cat = findPackage(o.package_slug)?.category;
        if (cat !== categoryFilter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (
          !o.client_name.toLowerCase().includes(q) &&
          !o.client_email.toLowerCase().includes(q)
        ) return false;
      }
      if (from && new Date(o.created_at) < new Date(from)) return false;
      if (to && new Date(o.created_at) > new Date(`${to}T23:59:59`)) return false;
      return true;
    });
  }, [orders, statusFilter, categoryFilter, search, from, to]);

  const stats = useMemo(() => {
    const paidStatuses = ["paid", "in_progress", "delivered"];
    return {
      total: orders.length,
      revenue: orders
        .filter((o) => paidStatuses.includes(o.status))
        .reduce((s, o) => s + o.order_total, 0),
      pending: orders.filter((o) => o.status === "pending_payment").length,
      inProgress: orders.filter((o) => o.status === "in_progress").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };
  }, [orders]);

  const updateOrder = async (id: string, patch: { status?: string; admin_notes?: string }) => {
    const { data, error } = await supabase.functions.invoke("update-book-order", {
      body: { id, ...patch },
    });
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...(data as OrderRow) } : o)));
    if (drawer?.id === id) setDrawer({ ...drawer, ...(data as OrderRow) });
    toast({ title: "Order updated" });
  };

  const exportCsv = () => {
    const headers = [
      "id","created_at","client_name","client_email","client_phone","referral_source",
      "package_name","package_price","book_purpose","illustration_style","addons_total",
      "order_total","status","stripe_session_id",
    ];
    const rows = filtered.map((o) =>
      headers.map((h) => {
        const v = (o as unknown as Record<string, unknown>)[h];
        const s = v == null ? "" : String(v).replace(/"/g, '""');
        return `"${s}"`;
      }).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `book-orders-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openDrawer = (o: OrderRow) => {
    setDrawer(o);
    setNotes(o.admin_notes ?? "");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNav />
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl text-foreground">Book Orders</h1>
          <Button onClick={exportCsv} variant="outline" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total Orders", value: stats.total },
            { label: "Total Revenue", value: formatUSD(stats.revenue) },
            { label: "Pending Payment", value: stats.pending },
            { label: "In Progress", value: stats.inProgress },
            { label: "Delivered", value: stats.delivered },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border/60 bg-card/50 p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                {s.label}
              </div>
              <div className="font-heading text-2xl text-primary">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email"
              className="pl-9 bg-background/40 border-border/60"
            />
          </div>
          <select
            className="h-10 rounded-md border border-border/60 bg-background/40 px-3 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-border/60 bg-background/40 px-3 text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : CATEGORY_LABELS[c as BookCategory]}
              </option>
            ))}
          </select>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-[160px] bg-background/40 border-border/60"
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-[160px] bg-background/40 border-border/60"
          />
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border/60 bg-card/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/20 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">Package</th>
                  <th className="text-left px-4 py-3">Add-ons</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No orders found.</td></tr>
                ) : (
                  filtered.map((o) => {
                    const addonCount = Array.isArray(o.addons) ? o.addons.length : 0;
                    return (
                      <tr
                        key={o.id}
                        onClick={() => openDrawer(o)}
                        className="border-t border-border/40 hover:bg-muted/10 cursor-pointer"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {o.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-foreground">{o.client_name}</div>
                          <div className="text-xs text-muted-foreground">{o.client_email}</div>
                        </td>
                        <td className="px-4 py-3 text-foreground">{o.package_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{addonCount}</td>
                        <td className="px-4 py-3 text-right text-primary font-medium">
                          {formatUSD(o.order_total)}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={o.status}
                            onChange={(e) => updateOrder(o.id, { status: e.target.value })}
                            className="h-8 rounded-md border border-border/60 bg-background/40 px-2 text-xs"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => { if (!o) setDrawer(null); }}>
        <SheetContent className="bg-background border-border/60 w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-heading text-2xl text-foreground">
              Order Details
            </SheetTitle>
          </SheetHeader>
          {drawer && (
            <div className="mt-6 space-y-6 text-sm">
              <div className="flex items-center justify-between">
                <StatusBadge status={drawer.status} />
                <span className="font-heading text-2xl text-primary">
                  {formatUSD(drawer.order_total)}
                </span>
              </div>

              <Section title="Client">
                <Field label="Name" value={drawer.client_name} />
                <Field label="Email" value={drawer.client_email} />
                <Field label="Phone" value={drawer.client_phone ?? "—"} />
                <Field label="Referral" value={drawer.referral_source} />
              </Section>

              <Section title="Book">
                <Field label="Package" value={drawer.package_name} />
                <Field label="Purpose" value={drawer.book_purpose} />
                <Field label="Illustration" value={drawer.illustration_style} />
                {drawer.characters && <Field label="Characters" value={drawer.characters} />}
                <Field label="Vision" value={drawer.book_vision} multi />
                {drawer.special_requirements && (
                  <Field label="Requirements" value={drawer.special_requirements} multi />
                )}
              </Section>

              <Section title="Add-Ons">
                {Array.isArray(drawer.addons) && drawer.addons.length > 0 ? (
                  <ul className="text-foreground/85 space-y-1">
                    {(drawer.addons as string[]).map((s) => (
                      <li key={s}>• {s.replace(/^addon-/, "").replace(/-/g, " ")}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">None</p>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  Subtotal add-ons: {formatUSD(drawer.addons_total)}
                </div>
              </Section>

              <Section title="Stripe">
                {drawer.stripe_session_id ? (
                  <a
                    href={`https://dashboard.stripe.com/payments/${drawer.stripe_payment_intent_id ?? ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {drawer.stripe_session_id}
                  </a>
                ) : (
                  <p className="text-muted-foreground">No session</p>
                )}
              </Section>

              <Section title="Internal Notes">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-background/40 border-border/60 min-h-[100px]"
                />
                <Button
                  onClick={() => updateOrder(drawer.id, { admin_notes: notes })}
                  className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90"
                  size="sm"
                >
                  Save Notes
                </Button>
              </Section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-wider text-primary mb-2">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value, multi }: { label: string; value: string; multi?: boolean }) {
  return (
    <div className={multi ? "" : "flex justify-between gap-4"}>
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={`text-foreground/90 ${multi ? "block mt-1 whitespace-pre-wrap" : "text-right"}`}>
        {value}
      </span>
    </div>
  );
}
