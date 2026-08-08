import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Status = "new" | "reviewing" | "invited" | "declined";
interface Invitation { id: string; name: string; email: string; message: string; source: string; status: Status; created_at: string; }

export default function AdminTaskForceInvitations() {
  const [rows, setRows] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("task_force_invitations").select("id,name,email,message,source,status,created_at").order("created_at", { ascending: false });
    if (error) toast({ title: "Could not load invitations", description: error.message, variant: "destructive" });
    else setRows((data ?? []) as Invitation[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("task_force_invitations").update({ status }).eq("id", id);
    if (error) toast({ title: "Could not update request", description: error.message, variant: "destructive" });
    else setRows((current) => current.map((row) => row.id === id ? { ...row, status } : row));
  };
  return <div className="min-h-dvh bg-background text-foreground"><div className="max-w-7xl mx-auto px-6 py-8"><AdminNav /><div className="flex items-center justify-between mb-8"><div><h1 className="font-heading text-3xl">Cbus AI Task Force Requests</h1><p className="text-sm text-muted-foreground mt-1">Invitation requests submitted from the public program page.</p></div><Button variant="outline" onClick={load}>Refresh</Button></div><div className="space-y-4">{loading ? <p className="text-muted-foreground">Loading…</p> : rows.length === 0 ? <p className="text-muted-foreground">No requests yet.</p> : rows.map((row) => <article key={row.id} className="rounded-lg border border-border/60 bg-card/30 p-5"><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"><div><h2 className="font-heading text-xl">{row.name}</h2><a href={`mailto:${row.email}`} className="text-sm text-primary hover:underline">{row.email}</a><p className="text-xs text-muted-foreground mt-1">{new Date(row.created_at).toLocaleString()}</p></div><select aria-label={`Status for ${row.name}`} value={row.status} onChange={(e) => void updateStatus(row.id, e.target.value as Status)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="new">New</option><option value="reviewing">Reviewing</option><option value="invited">Invited</option><option value="declined">Declined</option></select></div><p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{row.message}</p></article>)}</div></div></div>;
}