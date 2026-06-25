import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Send } from "lucide-react";

interface Issue {
  id: string;
  issue_number: number;
  subject: string;
  preview_text: string | null;
  scam_section: string;
  truth_section: string;
  play_section: string;
  status: string;
  sent_at: string | null;
  sent_count: number;
  suppressed_count: number;
  failed_count: number;
}

export default function AdminNewsletterDraft() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const { data, error } = await supabase
        .from("newsletter_issues")
        .select("id, issue_number, subject, preview_text, scam_section, truth_section, play_section, status, sent_at, sent_count, suppressed_count, failed_count")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast({ title: "Could not load draft", description: error?.message ?? "Not found", variant: "destructive" });
        navigate("/admin");
        return;
      }
      setIssue(data as Issue);
      setLoading(false);
    })();
  }, [id, navigate]);

  const save = async () => {
    if (!issue) return;
    setSaving(true);
    const { error } = await supabase
      .from("newsletter_issues")
      .update({
        subject: issue.subject,
        preview_text: issue.preview_text,
        scam_section: issue.scam_section,
        truth_section: issue.truth_section,
        play_section: issue.play_section,
      })
      .eq("id", issue.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Draft updated." });
    }
  };

  const send = async () => {
    if (!issue) return;
    if (!confirm(`Send issue #${issue.issue_number} to ALL newsletter subscribers right now?`)) return;
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-weekly-newsletter", {
      body: { issue_id: issue.id },
    });
    setSending(false);
    if (error) {
      toast({ title: "Send failed", description: error.message, variant: "destructive" });
      return;
    }
    const result = data as { sent?: number; suppressed?: number; failed?: number } | null;
    toast({
      title: "Issue sent",
      description: `Sent ${result?.sent ?? 0} · Suppressed ${result?.suppressed ?? 0} · Failed ${result?.failed ?? 0}`,
    });
    // refetch
    const { data: refreshed } = await supabase
      .from("newsletter_issues")
      .select("id, issue_number, subject, preview_text, scam_section, truth_section, play_section, status, sent_at, sent_count, suppressed_count, failed_count")
      .eq("id", issue.id)
      .maybeSingle();
    if (refreshed) setIssue(refreshed as Issue);
  };

  if (loading || !issue) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    );
  }

  const isSent = issue.status === "sent";

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light">Newsletter Issue #{issue.issue_number}</h1>
            <p className="text-sm text-muted-foreground capitalize">
              Status: {issue.status}
              {isSent && ` · ${issue.sent_count} sent · ${issue.suppressed_count} suppressed · ${issue.failed_count} failed`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={saving || isSent} onClick={save}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
            <Button disabled={sending || isSent} onClick={send}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {isSent ? "Already sent" : "Send to all subscribers"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Subject line</Label>
          <Input
            value={issue.subject}
            disabled={isSent}
            onChange={(e) => setIssue({ ...issue, subject: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Preview text</Label>
          <Input
            value={issue.preview_text ?? ""}
            disabled={isSent}
            onChange={(e) => setIssue({ ...issue, preview_text: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>1. Scam Alert</Label>
          <Textarea
            rows={6}
            value={issue.scam_section}
            disabled={isSent}
            onChange={(e) => setIssue({ ...issue, scam_section: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>2. Truth Drop</Label>
          <Textarea
            rows={5}
            value={issue.truth_section}
            disabled={isSent}
            onChange={(e) => setIssue({ ...issue, truth_section: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>3. AI Play</Label>
          <Textarea
            rows={6}
            value={issue.play_section}
            disabled={isSent}
            onChange={(e) => setIssue({ ...issue, play_section: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}