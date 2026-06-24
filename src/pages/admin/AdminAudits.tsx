import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/use-roles";

interface AuditRow {
  id: string;
  user_id: string | null;
  created_at: string;
  generated_at: string | null;
  recommended_offer: string | null;
  intake: unknown;
  report: unknown;
}

export default function AdminAudits() {
  const { isAdmin, loading: rolesLoading } = useRoles();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("business_audits" as never)
      .select("id, user_id, created_at, generated_at, recommended_offer, intake, report")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    else setAudits((data ?? []) as AuditRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (rolesLoading) return null;
  if (!isAdmin) { navigate("/dashboard"); return null; }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNav />
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl text-foreground">AI Business Audits</h1>
          <Button onClick={load} variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">Refresh</Button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{audits.length} total audits</p>
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : audits.length === 0 ? (
          <p className="text-muted-foreground">No audits yet.</p>
        ) : (
          <div className="rounded-lg border border-border/60 bg-card/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/20 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">Created</th>
                    <th className="text-left px-4 py-3">User ID</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Generated</th>
                    <th className="text-left px-4 py-3">Recommended Offer</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {audits.map((a) => {
                    const hasIntake = !!a.intake && typeof a.intake === "object" && Object.keys(a.intake as object).length > 0;
                    const hasReport = !!a.report;
                    const statusLabel = hasReport ? "complete" : hasIntake ? "pending generation" : "intake needed";
                    const statusColor = hasReport
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : hasIntake
                      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      : "bg-muted/30 text-muted-foreground border-border";
                    return (
                      <tr key={a.id} className="hover:bg-muted/5">
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {new Date(a.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {a.user_id ? a.user_id.slice(0, 8) + "…" : "guest"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusColor}>{statusLabel}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {a.generated_at ? new Date(a.generated_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{a.recommended_offer ?? "—"}</td>
                        <td className="px-4 py-3">
                          {hasReport && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => navigate(`/audit/report/${a.id}`)}
                            >
                              View Report
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
