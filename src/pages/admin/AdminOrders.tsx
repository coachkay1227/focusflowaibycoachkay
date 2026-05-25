import { useEffect, useMemo, useState } from "react";
import { Download, Search, X } from "lucide-react";
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
const CATEGORIES: Array<BookCategory | "all"> = [
  "all",
  "storybooks",
  "legacy",
  "authority",
  "creator",
  "autism",
];
const FILTERS_KEY = "admin-orders-filters-v1";
const PAGE_SIZES = [25, 50, 100, 200];

interface SavedFilters {
  statusFilter: string;
  categoryFilter: string;
  search: string;
  from: string;
  to: string;
  pageSize: number;
}

const DEFAULT_FILTERS: SavedFilters = {
  statusFilter: "all",
  categoryFilter: "all",
  search: "",
  from: "",
  to: "",
  pageSize: 50,
};

function loadSavedFilters(): SavedFilters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  try {
    const raw = window.localStorage.getItem(FILTERS_KEY);
    if (!raw) return DEFAULT_FILTERS;
    return { ...DEFAULT_FILTERS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FILTERS;
  }
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const initial = useMemo(loadSavedFilters, []);
  const [statusFilter, setStatusFilter] = useState<string>(initial.statusFilter);
  const [categoryFilter, setCategoryFilter] = useState<string>(initial.categoryFilter);
  const [search, setSearch] = useState(initial.search);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [pageSize, setPageSize] = useState<number>(initial.pageSize);
  const [page, setPage] = useState(1);
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

  // Persist filters
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FILTERS_KEY,
        JSON.stringify({ statusFilter, categoryFilter, search, from, to, pageSize }),
      );
    } catch {
      // ignore
    }
  }, [statusFilter, categoryFilter, search, from, to, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, categoryFilter, search, from, to, pageSize]);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const filtersActive =
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    search !== "" ||
    from !== "" ||
    to !== "";

  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setSearch("");
    setFrom("");
    setTo("");
  };

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
    const headers: Array<{ key: string; label: string; get: (o: OrderRow) => string | number | null }> = [
      { key: "id", label: "Order ID", get: (o) => o.id },
      { key: "created_at", label: "Created At", get: (o) => new Date(o.created_at).toISOString() },
      { key: "status", label: "Status", get: (o) => STATUS_LABELS[o.status] ?? o.status },
      { key: "client_name", label: "Client Name", get: (o) => o.client_name },
      { key: "client_email", label: "Client Email", get: (o) => o.client_email },
      { key: "client_phone", label: "Client Phone", get: (o) => o.client_phone ?? "" },
      { key: "referral_source", label: "Referral Source", get: (o) => o.referral_source },
      { key: "package_slug", label: "Package Slug", get: (o) => o.package_slug },
      { key: "package_name", label: "Package Name", get: (o) => o.package_name },
      { key: "package_category", label: "Category", get: (o) => {
        const cat = findPackage(o.package_slug)?.category;
        return cat ? CATEGORY_LABELS[cat] : "";
      } },
      { key: "package_price_usd", label: "Package Price (USD)", get: (o) => (o.package_price / 100).toFixed(2) },
      { key: "addons", label: "Add-Ons", get: (o) => Array.isArray(o.addons) ? (o.addons as string[]).join(" | ") : "" },
      { key: "addons_count", label: "Add-Ons Count", get: (o) => Array.isArray(o.addons) ? o.addons.length : 0 },
      { key: "addons_total_usd", label: "Add-Ons Total (USD)", get: (o) => (o.addons_total / 100).toFixed(2) },
      { key: "order_total_usd", label: "Order Total (USD)", get: (o) => (o.order_total / 100).toFixed(2) },
      { key: "book_purpose", label: "Book Purpose", get: (o) => o.book_purpose },
      { key: "book_vision", label: "Book Vision", get: (o) => o.book_vision },
      { key: "characters", label: "Characters", get: (o) => o.characters ?? "" },
      { key: "illustration_style", label: "Illustration Style", get: (o) => o.illustration_style },
      { key: "special_requirements", label: "Special Requirements", get: (o) => o.special_requirements ?? "" },
      { key: "admin_notes", label: "Admin Notes", get: (o) => o.admin_notes ?? "" },
      { key: "stripe_session_id", label: "Stripe Session ID", get: (o) => o.stripe_session_id ?? "" },
      { key: "stripe_payment_intent_id", label: "Stripe Payment Intent ID", get: (o) => o.stripe_payment_intent_id ?? "" },
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v).replace(/"/g, '""').replace(/\r?\n/g, " ");
      return `"${s}"`;
    };
    const rows = filtered.map((o) => headers.map((h) => escape(h.get(o))).join(","));
    const csv = [headers.map((h) => escape(h.label)).join(","), ...rows].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `book-orders-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} order(s) exported.` });
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
        <div className="flex flex-wrap gap-3 mb-4 items-center">
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
          {filtersActive && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} of {orders.length}
          </div>
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
                  paginated.map((o) => {
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

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-8 rounded-md border border-border/60 bg-background/40 px-2 text-xs"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="border-border/60"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="border-border/60"
              >
                Next
              </Button>
            </div>
          </div>
        )}
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
