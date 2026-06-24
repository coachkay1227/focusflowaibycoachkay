import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/use-roles";

interface EnrollmentRow {
  id: string;
  user_id: string;
  module_id: string;
  status: string;
  created_at: string;
  sessions_count: number;
}

interface ChallengeRow {
  id: string;
  user_id: string;
  challenge_type: string;
  status: string;
  current_day: number;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  enrolled: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  in_progress: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function AdminEnrollments() {
  const { isAdmin, loading: rolesLoading } = useRoles();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<"modules" | "challenges">("modules");
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [enrRes, chalRes] = await Promise.all([
      supabase
        .from("module_enrollments" as never)
        .select("id, user_id, module_id, status, created_at, sessions_count")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("challenge_progress" as never)
        .select("id, user_id, challenge_type, status, current_day, created_at")
        .order("created_at", { ascending: false })
        .limit(500),
    ]);
    if (enrRes.error) toast({ title: "Failed to load enrollments", description: enrRes.error.message, variant: "destructive" });
    else setEnrollments((enrRes.data ?? []) as EnrollmentRow[]);
    if (chalRes.error) toast({ title: "Failed to load challenges", description: chalRes.error.message, variant: "destructive" });
    else setChallenges((chalRes.data ?? []) as ChallengeRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (rolesLoading) return null;
  if (!isAdmin) { navigate("/dashboard"); return null; }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNav />
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-3xl text-foreground">Enrollments</h1>
          <Button onClick={load} variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">Refresh</Button>
        </div>

        <div className="flex gap-2 mb-6">
          {(["modules", "challenges"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                tab === t
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {t === "modules" ? `Modules (${enrollments.length})` : `Challenges (${challenges.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : tab === "modules" ? (
          <div className="rounded-lg border border-border/60 bg-card/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/20 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">Enrolled</th>
                    <th className="text-left px-4 py-3">User ID</th>
                    <th className="text-left px-4 py-3">Module</th>
                    <th className="text-left px-4 py-3">Sessions</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {enrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/5">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(e.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {e.user_id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3">{e.module_id}</td>
                      <td className="px-4 py-3">{e.sessions_count}</td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_COLORS[e.status] ?? ""}>{e.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border/60 bg-card/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/20 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">Started</th>
                    <th className="text-left px-4 py-3">User ID</th>
                    <th className="text-left px-4 py-3">Challenge</th>
                    <th className="text-left px-4 py-3">Day</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {challenges.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/5">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {c.user_id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3">{c.challenge_type}</td>
                      <td className="px-4 py-3">{c.current_day}</td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_COLORS[c.status] ?? ""}>{c.status}</Badge>
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
