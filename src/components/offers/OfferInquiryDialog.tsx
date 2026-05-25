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

interface OfferInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Marketing lane (e.g. "Rent-an-Agent — Enterprise", "AI Lead Engine — Pro"). */
  lane: string;
  /** Brief context line shown in the dialog header. */
  context?: string;
}

/** Lightweight inquiry capture for offer pages. Posts to the existing
 *  apply-now edge function (type=inquiry) so the email + CRM
 *  fan-out stays in one place. */
const OfferInquiryDialog = ({ open, onOpenChange, lane, context }: OfferInquiryDialogProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");

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
          type: "inquiry",
          name: name.trim(),
          email: email.trim(),
          organization: organization.trim() || undefined,
          programName: lane,
          message: message.trim(),
        },
      });
      if (error) throw error;
      toast({ title: "Inquiry sent", description: "Coach Kay will be in touch soon." });
      onOpenChange(false);
      setName(""); setEmail(""); setOrganization(""); setMessage("");
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or email Hello@coachkayelevates.org directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Talk to Coach Kay</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {context ?? `Tell us about your needs for ${lane}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Interested in</Label>
            <Input value={lane} readOnly className="bg-muted/30 border-border text-sm" />
          </div>
          <div>
            <Label htmlFor="off-name">Name *</Label>
            <Input id="off-name" value={name} onChange={(e) => setName(e.target.value)} className="border-border" maxLength={100} required />
          </div>
          <div>
            <Label htmlFor="off-email">Email *</Label>
            <Input id="off-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border-border" maxLength={255} required />
          </div>
          <div>
            <Label htmlFor="off-org">Organization (optional)</Label>
            <Input id="off-org" value={organization} onChange={(e) => setOrganization(e.target.value)} className="border-border" maxLength={200} />
          </div>
          <div>
            <Label htmlFor="off-msg">Goals, team size, timeline *</Label>
            <Textarea id="off-msg" value={message} onChange={(e) => setMessage(e.target.value)} className="border-border min-h-[100px]" maxLength={2000} required />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {submitting ? "Sending…" : "Send Inquiry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OfferInquiryDialog;