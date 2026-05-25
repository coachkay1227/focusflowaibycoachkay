import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApplyNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "application" | "inquiry";
  programName?: string;
}

const ApplyNowDialog = ({ open, onOpenChange, mode, programName }: ApplyNowDialogProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");

  const isApplication = mode === "application";
  const title = isApplication ? "Apply Now" : "Contact Coach Kay";
  const description = isApplication
    ? `Application for ${programName}. Coach Kay reviews every application personally.`
    : "Tell us about your corporate training or private coaching needs.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("apply-now", {
        body: {
          type: mode,
          name: name.trim(),
          email: email.trim(),
          organization: organization.trim() || undefined,
          programName: programName || undefined,
          message: message.trim(),
        },
      });

      if (error) throw error;

      toast({
        title: isApplication ? "Application received!" : "Inquiry sent!",
        description: "Coach Kay will be in touch soon.",
      });

      // Confirmation email + GHL webhook are dispatched server-side from
      // the apply-now edge function so the email/CRM endpoints can be
      // locked down to service-role callers only.

      onOpenChange(false);
      setName("");
      setEmail("");
      setOrganization("");
      setMessage("");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or email Hello@coachkayelevates.org directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isApplication && programName && (
            <div>
              <Label className="text-xs text-muted-foreground">Program</Label>
              <Input value={programName} readOnly className="bg-muted/30 border-border text-sm" />
            </div>
          )}
          <div>
            <Label htmlFor="apply-name">Name *</Label>
            <Input id="apply-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="border-border" maxLength={100} required />
          </div>
          <div>
            <Label htmlFor="apply-email">Email *</Label>
            <Input id="apply-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="border-border" maxLength={255} required />
          </div>
          {!isApplication && (
            <div>
              <Label htmlFor="apply-org">Organization (optional)</Label>
              <Input id="apply-org" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Company or team name" className="border-border" maxLength={200} />
            </div>
          )}
          <div>
            <Label htmlFor="apply-message">{isApplication ? "Why are you interested? *" : "Tell us about your needs *"}</Label>
            <Textarea id="apply-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={isApplication ? "What are you hoping to achieve?" : "Describe your goals, team size, and timeline"} className="border-border min-h-[100px]" maxLength={2000} required />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {submitting ? "Sending…" : isApplication ? "Submit Application" : "Send Inquiry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyNowDialog;
