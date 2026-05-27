import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InquiryRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string | null;
  project_type: string;
  tier: string;
  budget_range: string | null;
  timeline: string | null;
  notes: string | null;
  status: string;
}

export default function AdminBuildInquiries() {
  const { toast } = useToast();
  const [rows, setRows] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("build_inquiries")
      .select("id, created_at, name, email, company, project_type, tier, budget_range, timeline, notes, status")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    else setRows((data ?? []) as InquiryRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNav />
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl text-foreground">Build Studio Inquiries</h1>
          <Button onClick={load} variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">Refresh</Button>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/20 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">When</th>
                  <th className="text-left px-4 py-3">Lead</th>
                  <th className="text-left px-4 py-3">Project</th>
                  <th className="text-left px-4 py-3">Tier</th>
                  <th className="text-left px-4 py-3">Budget / Timeline</th>
                  <th className="text-left px-4 py-3 min-w-[260px]">Notes</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No inquiries yet.</td></tr>
                ) : rows.map((r) => (
                  <tr key={r.id} className="border-t border-border/40 align-top">
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                      {r.company && <div className="text-xs text-muted-foreground">{r.company}</div>}
                    </td>
                    <td className="px-4 py-3 text-foreground">{r.project_type}</td>
                    <td className="px-4 py-3 text-xs text-primary">{r.tier}</td>
                    <td className="px-4 py-3 text-xs">
                      <div className="text-foreground">{r.budget_range ?? "—"}</div>
                      <div className="text-muted-foreground">{r.timeline ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/85 whitespace-pre-wrap">{r.notes ?? "—"}</td>
                    <td className="px-4 py-3 text-xs capitalize">{r.status.replace(/_/g, " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}