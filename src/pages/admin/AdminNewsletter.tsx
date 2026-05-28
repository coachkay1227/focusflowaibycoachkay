import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Mail, RefreshCw } from "lucide-react";
import SEOHead from "@/components/SEOHead";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  synced_to_beehiiv: boolean;
  created_at: string;
}

const AdminNewsletter = () => {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, name, source, synced_to_beehiiv, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) console.error(error);
    setRows((data as Subscriber[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const exportCsv = () => {
    const header = ["email", "name", "source", "synced_to_beehiiv", "created_at"];
    const lines = [header.join(",")];
    for (const r of rows) {
      const safe = (v: string | boolean | null) =>
        v === null || v === undefined ? "" : `"${String(v).replace(/"/g, '""')}"`;
      lines.push(
        [safe(r.email), safe(r.name), safe(r.source), safe(r.synced_to_beehiiv), safe(r.created_at)].join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-dvh bg-background">
        <SEOHead title="Newsletter · Admin" description="Newsletter waitlist subscribers" path="/admin/newsletter" />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <AdminNav />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl text-foreground flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" /> Newsletter
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {rows.length} subscriber{rows.length === 1 ? "" : "s"} captured
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" onClick={exportCsv} disabled={rows.length === 0}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/30 overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No subscribers yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background/40 text-muted-foreground text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Source</th>
                    <th className="text-left px-4 py-3">Beehiiv</th>
                    <th className="text-left px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-border/30">
                      <td className="px-4 py-2 text-foreground">{r.email}</td>
                      <td className="px-4 py-2 text-muted-foreground">{r.name ?? "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{r.source ?? "—"}</td>
                      <td className="px-4 py-2">
                        {r.synced_to_beehiiv ? (
                          <span className="text-primary text-xs">synced</span>
                        ) : (
                          <span className="text-muted-foreground/60 text-xs">local</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground text-xs">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletter;