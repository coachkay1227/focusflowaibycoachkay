import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Save, Trash2, X, ShieldAlert } from "lucide-react";

type ThreatLevel = "red_flag" | "caution" | "watch" | "resolved";

interface ScamAlert {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  threat_level: ThreatLevel;
  category: string;
  action_rules: string[];
  source_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const EMPTY: Omit<ScamAlert, "id" | "created_at"> = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  threat_level: "watch",
  category: "AI scam",
  action_rules: [""],
  source_url: "",
  is_published: false,
  published_at: null,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function AdminScamAlerts() {
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(typeof EMPTY & { id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("scam_alerts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load alerts", description: error.message, variant: "destructive" });
    } else {
      setAlerts((data ?? []) as ScamAlert[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => setEditing({ ...EMPTY });
  const startEdit = (a: ScamAlert) =>
    setEditing({
      id: a.id,
      title: a.title,
      slug: a.slug,
      summary: a.summary,
      body: a.body,
      threat_level: a.threat_level,
      category: a.category,
      action_rules: a.action_rules.length ? a.action_rules : [""],
      source_url: a.source_url ?? "",
      is_published: a.is_published,
      published_at: a.published_at,
    });

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.summary.trim()) {
      toast({ title: "Title and summary required", variant: "destructive" });
      return;
    }
    if (editing.is_published && !editing.source_url?.trim()) {
      toast({
        title: "Source URL required to publish",
        description: "This is a validated-resources hub. No source, no publish.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const slug = editing.slug.trim() || slugify(editing.title);
    const payload = {
      title: editing.title.trim(),
      slug,
      summary: editing.summary.trim(),
      body: editing.body,
      threat_level: editing.threat_level,
      category: editing.category.trim() || "AI scam",
      action_rules: editing.action_rules.map((r) => r.trim()).filter(Boolean),
      source_url: editing.source_url?.trim() || null,
      is_published: editing.is_published,
      published_at: editing.is_published ? editing.published_at ?? new Date().toISOString() : null,
    };

    const { error } = editing.id
      ? await supabase.from("scam_alerts").update(payload).eq("id", editing.id)
      : await supabase.from("scam_alerts").insert(payload);

    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing.id ? "Alert updated" : "Alert created" });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this alert permanently?")) return;
    const { error } = await supabase.from("scam_alerts").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Alert deleted" });
    load();
  };

  const updateRule = (i: number, val: string) =>
    setEditing((e) => {
      if (!e) return e;
      const rules = [...e.action_rules];
      rules[i] = val;
      return { ...e, action_rules: rules };
    });

  const addRule = () =>
    setEditing((e) => (e ? { ...e, action_rules: [...e.action_rules, ""] } : e));

  const removeRule = (i: number) =>
    setEditing((e) =>
      e ? { ...e, action_rules: e.action_rules.filter((_, idx) => idx !== i) } : e
    );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <AdminNav />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl font-light flex items-center gap-3">
              <ShieldAlert className="h-7 w-7 text-primary" strokeWidth={1.5} />
              Scam Alerts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Publish alerts to <Link to="/pause-hub" className="text-primary hover:underline">/pause-hub</Link>. Updates appear live for every visitor.
            </p>
          </div>
          {!editing && (
            <Button onClick={startNew} className="gap-2">
              <Plus className="h-4 w-4" /> New alert
            </Button>
          )}
        </div>

        {editing && (
          <div className="rounded-xl border border-border bg-card p-6 mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl">{editing.id ? "Edit alert" : "New alert"}</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Title</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })}
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              </div>
              <div>
                <Label>Threat level</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editing.threat_level}
                  onChange={(e) => setEditing({ ...editing, threat_level: e.target.value as ThreatLevel })}
                >
                  <option value="red_flag">Red Flag</option>
                  <option value="caution">Caution</option>
                  <option value="watch">Watch</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <Label>Source URL <span className="text-destructive">*</span></Label>
                <Input
                  value={editing.source_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, source_url: e.target.value })}
                  placeholder="https://..."
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Required to publish. No source, no publish — this hub is built on validated resources.
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label>Summary (1-2 sentences)</Label>
                <Textarea
                  rows={2}
                  value={editing.summary}
                  onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Full body (markdown / plain text)</Label>
                <Textarea
                  rows={6}
                  value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <Label>Action rules (one per line)</Label>
                <div className="space-y-2 mt-1">
                  {editing.action_rules.map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={r} onChange={(e) => updateRule(i, e.target.value)} placeholder="What to do" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeRule(i)} aria-label={`Remove rule ${i + 1}`}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addRule} className="gap-1">
                    <Plus className="h-3 w-3" /> Add rule
                  </Button>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <input
                  id="pub"
                  type="checkbox"
                  checked={editing.is_published}
                  onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="pub" className="cursor-pointer">Published (visible on /pause-hub)</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alerts yet. Create your first one.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-card p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider mb-1">
                    <span className={`px-2 py-0.5 rounded-full border ${a.threat_level === "red_flag" ? "border-destructive/40 text-destructive" : a.threat_level === "caution" ? "border-primary/40 text-primary" : "border-border text-muted-foreground"}`}>
                      {a.threat_level.replace("_", " ")}
                    </span>
                    <span className="text-muted-foreground">{a.category}</span>
                    {a.is_published ? (
                      <span className="text-primary">● live</span>
                    ) : (
                      <span className="text-muted-foreground">○ draft</span>
                    )}
                  </div>
                  <h3 className="font-medium truncate">{a.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{a.summary}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(a)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(a.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}