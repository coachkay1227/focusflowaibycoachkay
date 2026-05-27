import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BuildApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-selected offer name, e.g. "AI Tool / SaaS MVP". */
  projectType: string;
  /** Tier label for routing/segmenting on the admin side. */
  tier: string;
}

const BUDGETS = ["Under $5K", "$5K–$10K", "$10K–$15K", "$15K+"];
const TIMELINES = ["ASAP (2 weeks)", "1 month", "2–3 months", "Flexible"];

/** Qualification form for Tier 2+ Build Studio engagements.
 *  Writes to public.build_inquiries (RLS allows anon insert) AND fires the
 *  existing apply-now edge function so Coach Kay gets an email immediately. */
const BuildApplicationDialog = ({
  open, onOpenChange, projectType, tier,
}: BuildApplicationDialogProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [timeline, setTimeline] = useState(TIMELINES[1]);
  const [notes, setNotes] = useState("");

  const reset = () => {
    setName(""); setEmail(""); setCompany(""); setNotes("");
    setBudget(BUDGETS[1]); setTimeline(TIMELINES[1]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !notes.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // 1) Persist to build_inquiries for admin tracking.
      const { error: dbErr } = await supabase.from("build_inquiries").insert({
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || null,
        project_type: projectType,
        tier,
        budget_range: budget,
        timeline,
        notes: notes.trim(),
        source: "collective-ai-build-studio",
      });
      if (dbErr) throw dbErr;

      // 2) Notify Coach Kay via the existing apply-now fan-out.
      const message = `Project: ${projectType}\nTier: ${tier}\nBudget: ${budget}\nTimeline: ${timeline}\n\n${notes.trim()}`;
      const { error: emailErr } = await supabase.functions.invoke("apply-now", {
        body: {
          type: "inquiry",
          name: name.trim(),
          email: email.trim(),
          organization: company.trim() || undefined,
          programName: `Build Studio — ${projectType}`,
          message,
        },
      });
      if (emailErr) {
        // DB record is already in — surface a softer message, don't fail UX.
        console.warn("apply-now notification failed", emailErr);
      }

      toast({
        title: "Inquiry sent",
        description: "Coach Kay reviews every build request personally. Expect a reply within one business day.",
      });
      reset();
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "Something went wrong",
        description:
          e instanceof Error
            ? e.message
            : "Please try again or email Hello@coachkayelevates.org directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Start your build</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Tell us about the project. We'll scope it and reply within one business day.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Project</Label>
            <Input value={projectType} readOnly className="bg-muted/30 border-border text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bs-name">Name *</Label>
              <Input id="bs-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
            </div>
            <div>
              <Label htmlFor="bs-email">Email *</Label>
              <Input id="bs-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
            </div>
          </div>
          <div>
            <Label htmlFor="bs-company">Company (optional)</Label>
            <Input id="bs-company" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={200} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bs-budget">Budget</Label>
              <select
                id="bs-budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="bs-timeline">Timeline</Label>
              <select
                id="bs-timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="bs-notes">What are we building? *</Label>
            <Textarea
              id="bs-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What problem solves this for you? Who's the user? Any references or examples?"
              className="min-h-[110px]"
              maxLength={2000}
              required
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {submitting ? "Sending…" : "Send build request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BuildApplicationDialog;