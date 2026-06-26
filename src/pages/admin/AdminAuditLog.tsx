import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/use-roles";

interface AuditRow {
  id: string;
  admin_id: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  metadata: unknown;
  created_at: string;
}

const PAGE_SIZE = 50;

export default function AdminAuditLog() {
  const { isAdmin, loading: rolesLoading } = useRoles();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [tableFilter, setTableFilter] = useState<string>("");

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from("admin_audit_log" as never)
      .select("id, admin_id, action, target_table, target_id, metadata, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (actionFilter) query = query.eq("action", actionFilter);
    if (tableFilter) query = query.eq("target_table", tableFilter);
    if (search.trim()) {
      const s = search.trim();
      query = query.or(
        `target_id.ilike.%${s}%,admin_id.ilike.%${s}%,action.ilike.%${s}%`
      );
    }

    const { data, error, count } = await query;
    if (error) {
      toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    } else {
      setRows((data ?? []) as AuditRow[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, actionFilter, tableFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const actions = useMemo(() => Array.from(new Set(rows.map((r) => r.action))).sort(), [rows]);
  const tables = useMemo(
    () => Array.from(new Set(rows.map((r) => r.target_table).filter(Boolean) as string[])).sort(),
    [rows]
  );

  if (rolesLoading) return null;
  if (!isAdmin) { navigate("/dashboard"); return null; }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNav />
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-3xl text-foreground">Admin Audit Log</h1>
            <p className="text-sm text-muted-foreground mt-1">{total} total entries</p>
          </div>
          <Button
            onClick={() => { setPage(0); load(); }}
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary/10"
          >
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <form
            className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); setPage(0); load(); }}
          >
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action / target / admin id…"
              className="w-72"
            />
            <Button type="submit" variant="secondary">Search</Button>
          </form>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            className="bg-card/30 border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All actions</option>
            {actions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={tableFilter}
            onChange={(e) => { setTableFilter(e.target.value); setPage(0); }}
            className="bg-card/30 border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All tables</option>
            {tables.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {(actionFilter || tableFilter || search) && (
            <Button
              variant="ghost"
              onClick={() => { setActionFilter(""); setTableFilter(""); setSearch(""); setPage(0); }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground">No audit entries match these filters.</p>
        ) : (
          <div className="rounded-lg border border-border/60 bg-card/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/20 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">When</th>
                    <th className="text-left px-4 py-3">Admin</th>
                    <th className="text-left px-4 py-3">Action</th>
                    <th className="text-left px-4 py-3">Target</th>
                    <th className="text-left px-4 py-3">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/5 align-top">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {r.admin_id ? r.admin_id.slice(0, 8) + "…" : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="bg-primary/15 text-primary border-primary/30">{r.action}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.target_table ? (
                          <span className="font-mono text-xs">
                            {r.target_table}
                            {r.target_id ? ` / ${r.target_id.slice(0, 8)}…` : ""}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all max-w-md">
                          {r.metadata ? JSON.stringify(r.metadata, null, 2) : "—"}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}