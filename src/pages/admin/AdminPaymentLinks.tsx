import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/use-roles";
import { RefreshCw, Download, ExternalLink, Copy } from "lucide-react";

type CatalogStatus = "ok" | "missing_in_map" | "direct_stripe_url" | "bypasses_intake" | "route_missing";

interface CatalogRecord {
  type: "priceId" | "stripe_url" | "audit_entry" | "route_definition";
  value: string;
  file: string;
  line?: number;
  resolvedTarget?: string;
  label?: string;
  status: CatalogStatus;
}

interface CatalogReport {
  generatedAt: string;
  summary: { priceIdsReferenced: number; priceIdsRegistered: number; failures: number };
  failures: { rule: string; detail: string }[];
  records: CatalogRecord[];
}

interface StripePriceStatus {
  id: string;
  found: boolean;
  active?: boolean;
  productId?: string;
  productName?: string;
  productActive?: boolean;
  unitAmount?: number | null;
  currency?: string;
  interval?: string | null;
  created?: number;
  expiresAt?: string | null;
  error?: string;
}

type Filter = "all" | "active" | "inactive" | "expiring" | "failures";

const DAY_MS = 86_400_000;

function formatMoney(amount?: number | null, currency?: string) {
  if (amount == null || !currency) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.round((t - Date.now()) / DAY_MS);
}

export default function AdminPaymentLinks() {
  const { isAdmin, loading: rolesLoading } = useRoles();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [catalog, setCatalog] = useState<CatalogReport | null>(null);
  const [statusById, setStatusById] = useState<Record<string, StripePriceStatus>>({});
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!rolesLoading && !isAdmin) navigate("/dashboard");
  }, [isAdmin, rolesLoading, navigate]);

  useEffect(() => {
    fetch("/reports/payment-links.json")
      .then((r) => {
        if (!r.ok) throw new Error(`Report not found (${r.status})`);
        return r.json();
      })
      .then((data: CatalogReport) => setCatalog(data))
      .catch((e) => {
        toast({
          title: "Catalog report unavailable",
          description:
            "Run `bun run scripts/check-payment-links.ts` locally or wait for the next build. " +
            (e as Error).message,
          variant: "destructive",
        });
      })
      .finally(() => setLoadingCatalog(false));
  }, [toast]);

  const priceRows = useMemo(() => {
    if (!catalog) return [];
    // Group price records by priceId with aggregated references.
    const map = new Map<
      string,
      { id: string; label?: string; resolved?: string; catalogStatus: CatalogStatus; refs: { file: string; line?: number }[] }
    >();
    for (const r of catalog.records) {
      if (r.type !== "priceId") continue;
      const existing = map.get(r.value);
      if (existing) {
        existing.refs.push({ file: r.file, line: r.line });
        if (r.status !== "ok") existing.catalogStatus = r.status;
      } else {
        map.set(r.value, {
          id: r.value,
          label: r.label,
          resolved: r.resolvedTarget,
          catalogStatus: r.status,
          refs: [{ file: r.file, line: r.line }],
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id));
  }, [catalog]);

  const refreshStripe = async () => {
    if (priceRows.length === 0) return;
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("list-payment-links-status", {
        body: { priceIds: priceRows.map((r) => r.id) },
      });
      if (error) throw error;
      const next: Record<string, StripePriceStatus> = {};
      for (const p of (data?.prices ?? []) as StripePriceStatus[]) next[p.id] = p;
      setStatusById(next);
      toast({ title: "Refreshed from Stripe", description: `${Object.keys(next).length} prices synced.` });
    } catch (e) {
      toast({ title: "Refresh failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-load Stripe status once catalog is ready
  useEffect(() => {
    if (priceRows.length && Object.keys(statusById).length === 0 && !refreshing) {
      refreshStripe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRows.length]);

  const summary = useMemo(() => {
    const total = priceRows.length;
    let active = 0, inactive = 0, expiring = 0, failures = 0;
    for (const row of priceRows) {
      if (row.catalogStatus !== "ok") failures++;
      const s = statusById[row.id];
      if (!s) continue;
      if (s.found && s.active && s.productActive !== false) active++;
      else if (s.found) inactive++;
      const d = daysUntil(s.expiresAt);
      if (d != null && d <= 30) expiring++;
    }
    return { total, active, inactive, expiring, failures };
  }, [priceRows, statusById]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return priceRows.filter((row) => {
      const s = statusById[row.id];
      // Filter
      if (filter === "active" && !(s?.found && s.active && s.productActive !== false)) return false;
      if (filter === "inactive" && !(s?.found && (!s.active || s.productActive === false))) return false;
      if (filter === "expiring") {
        const d = daysUntil(s?.expiresAt);
        if (d == null || d > 30) return false;
      }
      if (filter === "failures" && row.catalogStatus === "ok") return false;
      // Search
      if (q) {
        const hay = [
          row.id,
          row.label ?? "",
          row.resolved ?? "",
          s?.productName ?? "",
          row.refs.map((r) => r.file).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [priceRows, statusById, filter, search]);

  const downloadCsv = () => {
    const headers = [
      "price_id",
      "label",
      "mode",
      "product_name",
      "amount",
      "currency",
      "interval",
      "stripe_active",
      "product_active",
      "expires_at",
      "catalog_status",
      "references",
    ];
    const rows = priceRows.map((row) => {
      const s = statusById[row.id];
      return [
        row.id,
        row.label ?? "",
        row.resolved ?? "",
        s?.productName ?? "",
        s?.unitAmount != null ? (s.unitAmount / 100).toFixed(2) : "",
        s?.currency ?? "",
        s?.interval ?? "",
        s?.active ?? "",
        s?.productActive ?? "",
        s?.expiresAt ?? "",
        row.catalogStatus,
        row.refs.map((r) => `${r.file}:${r.line ?? ""}`).join("|"),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-links-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (rolesLoading || loadingCatalog) {
    return (
      <div className="min-h-screen bg-background p-8">
        <AdminNav />
        <p className="text-muted-foreground">Loading catalog…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <AdminNav />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading">Payment Links</h1>
            <p className="text-sm text-muted-foreground">
              {catalog ? `Catalog generated ${new Date(catalog.generatedAt).toLocaleString()}` : "No catalog"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadCsv}>
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
            <Button size="sm" onClick={refreshStripe} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh from Stripe
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <SummaryCard label="Total" value={summary.total} />
          <SummaryCard label="Active" value={summary.active} tone="ok" />
          <SummaryCard label="Inactive" value={summary.inactive} tone={summary.inactive ? "warn" : undefined} />
          <SummaryCard label="Expiring ≤30d" value={summary.expiring} tone={summary.expiring ? "warn" : undefined} />
          <SummaryCard label="Catalog issues" value={summary.failures} tone={summary.failures ? "err" : undefined} />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {(["all", "active", "inactive", "expiring", "failures"] as Filter[]).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
          <Input
            placeholder="Search price ID, product, file…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-auto max-w-xs"
          />
        </div>

        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/50 text-left">
              <tr>
                <th className="p-3">Price</th>
                <th className="p-3">Product</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Stripe</th>
                <th className="p-3">Catalog</th>
                <th className="p-3">Expires</th>
                <th className="p-3">Refs</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const s = statusById[row.id];
                const expDays = daysUntil(s?.expiresAt);
                const expTone =
                  expDays == null ? "" : expDays < 0 ? "text-destructive" : expDays <= 30 ? "text-amber-500" : "";
                return (
                  <tr key={row.id} className="border-t border-border align-top">
                    <td className="p-3 font-mono text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(row.id)}
                          className="hover:text-primary"
                          title="Copy"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <span>{row.id}</span>
                      </div>
                      {row.label ? <div className="text-muted-foreground text-xs mt-1">{row.label}</div> : null}
                    </td>
                    <td className="p-3">
                      <div>{s?.productName ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{row.resolved ?? ""}</div>
                    </td>
                    <td className="p-3">
                      {formatMoney(s?.unitAmount, s?.currency)}
                      {s?.interval ? <span className="text-muted-foreground text-xs"> / {s.interval}</span> : null}
                    </td>
                    <td className="p-3">
                      {!s ? (
                        <Badge variant="outline">unknown</Badge>
                      ) : !s.found ? (
                        <Badge variant="destructive">not found</Badge>
                      ) : s.active && s.productActive !== false ? (
                        <Badge className="bg-green-600 hover:bg-green-600">active</Badge>
                      ) : (
                        <Badge variant="destructive">
                          {s.productActive === false ? "product archived" : "inactive"}
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      {row.catalogStatus === "ok" ? (
                        <Badge variant="outline">ok</Badge>
                      ) : (
                        <Badge variant="destructive">{row.catalogStatus}</Badge>
                      )}
                    </td>
                    <td className={`p-3 ${expTone}`}>
                      {s?.expiresAt
                        ? `${new Date(s.expiresAt).toLocaleDateString()} (${expDays! >= 0 ? "in " + expDays + "d" : Math.abs(expDays!) + "d ago"})`
                        : "—"}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {row.refs.slice(0, 3).map((r, i) => (
                        <div key={i}>
                          {r.file}
                          {r.line ? `:${r.line}` : ""}
                        </div>
                      ))}
                      {row.refs.length > 3 ? <div>+{row.refs.length - 3} more</div> : null}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    No prices match this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>

        {catalog && catalog.failures.length > 0 ? (
          <Card className="p-4 border-destructive/50">
            <h2 className="font-semibold mb-2">Catalog failures</h2>
            <ul className="text-sm space-y-1 text-muted-foreground">
              {catalog.failures.map((f, i) => (
                <li key={i}>
                  <span className="text-destructive">[{f.rule}]</span> {f.detail}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <ExternalLink className="h-3 w-3" /> Stripe status is live per session; refresh to re-fetch.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone?: "ok" | "warn" | "err" }) {
  const color =
    tone === "ok"
      ? "text-green-500"
      : tone === "warn"
        ? "text-amber-500"
        : tone === "err"
          ? "text-destructive"
          : "text-foreground";
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-heading mt-1 ${color}`}>{value}</div>
    </Card>
  );
}