import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AUTISM_GIFT_WRAP_LABEL,
  AUTISM_GIFT_WRAP_PRICE_CENTS,
  findDisplayPackage,
} from "@/data/autismCatalog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  packageSlug: string | null;
  initialGiftWrap?: boolean;
}

const labelCls = "text-xs uppercase tracking-wider text-muted-foreground";
const inputCls =
  "bg-background/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20";
const selectCls =
  "h-10 w-full rounded-md border border-border/60 bg-background/40 px-3 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20";

const formatUSD = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export function AutismIntakeModal({ open, onOpenChange, packageSlug, initialGiftWrap }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pkg = packageSlug ? findDisplayPackage(packageSlug) : null;

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState(user?.email ?? "");
  const [clientPhone, setClientPhone] = useState("");
  const [useCase, setUseCase] = useState<"parent" | "therapist" | "school">("parent");
  const [childFirstName, setChildFirstName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childInterests, setChildInterests] = useState("");
  const [scenarioFocus, setScenarioFocus] = useState("");
  const [special, setSpecial] = useState("");
  const [providerName, setProviderName] = useState("");
  const [providerEmail, setProviderEmail] = useState("");
  const [giftWrap, setGiftWrap] = useState(!!initialGiftWrap);
  const [giftRecipient, setGiftRecipient] = useState("");
  const [giftNote, setGiftNote] = useState("");
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    if (open) {
      setErr(null);
      setClientName("");
      setClientEmail(user?.email ?? "");
      setClientPhone("");
      setUseCase(pkg?.audience === "therapist" ? "therapist" : pkg?.audience === "school" ? "school" : "parent");
      setChildFirstName("");
      setChildAge("");
      setChildInterests("");
      setScenarioFocus("");
      setSpecial("");
      setProviderName("");
      setProviderEmail("");
      setGiftWrap(!!initialGiftWrap && !!pkg?.giftWrapEligible);
      setGiftRecipient("");
      setGiftNote("");
      setAgree(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, packageSlug]);

  if (!pkg) return null;

  const total =
    pkg.priceCents + (giftWrap && pkg.giftWrapEligible ? AUTISM_GIFT_WRAP_PRICE_CENTS : 0);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || scenarioFocus.trim().length < 10 || !agree) {
      toast({ title: "Please complete the required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const { data: res, error } = await supabase.functions.invoke("create-autism-checkout", {
        body: {
          client_name: clientName.trim(),
          client_email: clientEmail.trim(),
          client_phone: clientPhone.trim() || "",
          use_case: useCase,
          child_first_name: childFirstName.trim() || "",
          child_age: childAge.trim() || "",
          child_interests: childInterests.trim() || "",
          scenario_focus: scenarioFocus.trim(),
          special_requirements: special.trim() || "",
          provider_name: providerName.trim() || "",
          provider_email: providerEmail.trim() || "",
          package_slug: pkg.slug,
          gift_wrap: giftWrap && !!pkg.giftWrapEligible,
          gift_recipient: giftRecipient.trim() || "",
          gift_note: giftNote.trim() || "",
        },
      });
      if (error) throw error;
      const url = (res as { url?: string })?.url;
      if (!url) throw new Error("Checkout URL missing");
      window.location.href = url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not start checkout";
      setErr(msg);
      toast({ title: "Checkout failed", description: msg, variant: "destructive" });
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!submitting) onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto bg-background border-border/60">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl text-foreground">
            {pkg.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tell us about the child and scenario so we can craft this story with intention.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 pt-2">
          {err && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {err}
            </div>
          )}

          <section className="space-y-3">
            <h3 className="font-heading text-lg text-primary">1. About you</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className={labelCls}>Full name *</Label>
                <Input className={inputCls} value={clientName} onChange={(e) => setClientName(e.target.value)} maxLength={120} required />
              </div>
              <div>
                <Label className={labelCls}>Email *</Label>
                <Input type="email" className={inputCls} value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} maxLength={255} required />
              </div>
              <div>
                <Label className={labelCls}>Phone (optional)</Label>
                <Input className={inputCls} value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} maxLength={40} />
              </div>
              <div>
                <Label className={labelCls}>I'm purchasing as a *</Label>
                <select className={selectCls} value={useCase} onChange={(e) => setUseCase(e.target.value as "parent" | "therapist" | "school")}>
                  <option value="parent">Parent / family member</option>
                  <option value="therapist">Therapist / clinician</option>
                  <option value="school">School / district</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-heading text-lg text-primary">2. About the child</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className={labelCls}>Child's first name (optional)</Label>
                <Input className={inputCls} value={childFirstName} onChange={(e) => setChildFirstName(e.target.value)} maxLength={80} />
              </div>
              <div>
                <Label className={labelCls}>Age (optional)</Label>
                <Input className={inputCls} value={childAge} onChange={(e) => setChildAge(e.target.value)} maxLength={20} />
              </div>
              <div className="sm:col-span-2">
                <Label className={labelCls}>Interests, characters, or things they love (optional)</Label>
                <Input className={inputCls} value={childInterests} onChange={(e) => setChildInterests(e.target.value)} maxLength={400} />
              </div>
              <div className="sm:col-span-2">
                <Label className={labelCls}>What scenario or goal should the story focus on? *</Label>
                <Textarea
                  className={`${inputCls} min-h-[110px]`}
                  value={scenarioFocus}
                  onChange={(e) => setScenarioFocus(e.target.value)}
                  maxLength={2000}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label className={labelCls}>Special requirements (optional)</Label>
                <Textarea
                  className={`${inputCls} min-h-[70px]`}
                  value={special}
                  onChange={(e) => setSpecial(e.target.value)}
                  maxLength={2000}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-heading text-lg text-primary">3. Provider info (optional, for LMN routing)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className={labelCls}>Provider name</Label>
                <Input className={inputCls} value={providerName} onChange={(e) => setProviderName(e.target.value)} maxLength={120} />
              </div>
              <div>
                <Label className={labelCls}>Provider email</Label>
                <Input type="email" className={inputCls} value={providerEmail} onChange={(e) => setProviderEmail(e.target.value)} maxLength={255} />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/80">
              We'll include a Letter of Medical Necessity template and an itemized HSA/FSA
              receipt with every order, addressed to you and (when provided) your provider.
            </p>
          </section>

          {pkg.giftWrapEligible && (
            <section className="space-y-3">
              <h3 className="font-heading text-lg text-primary">4. Gift wrap</h3>
              <label className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer ${giftWrap ? "border-primary/60 bg-primary/5" : "border-border/60 hover:border-primary/30"}`}>
                <input
                  type="checkbox"
                  className="mt-1 accent-[hsl(var(--primary))]"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">Add gift wrap + personalized note</span>
                    <span className="text-primary font-medium">+ {AUTISM_GIFT_WRAP_LABEL}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Includes premium presentation packaging and a handwritten note from Coach Kay.
                  </p>
                </div>
              </label>
              {giftWrap && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className={labelCls}>Gift recipient name</Label>
                    <Input className={inputCls} value={giftRecipient} onChange={(e) => setGiftRecipient(e.target.value)} maxLength={120} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className={labelCls}>Personalized note (up to 500 chars)</Label>
                    <Textarea
                      className={`${inputCls} min-h-[70px]`}
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      maxLength={500}
                    />
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="flex items-center justify-between border-t border-border/40 pt-4">
            <span className={labelCls}>Order total</span>
            <span className="font-heading text-3xl text-primary">{formatUSD(total)}</span>
          </section>

          <label className="flex items-start gap-3 text-sm text-foreground/85">
            <input
              type="checkbox"
              className="mt-1 accent-[hsl(var(--primary))]"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span>
              I understand work begins once intake is reviewed and all sales are final
              once production starts. Reimbursement eligibility is determined by my plan
              or provider. Coach Kay Elevates provides documentation only.
            </span>
          </label>

          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary/80" />
              Secure checkout powered by Stripe
            </p>
            <Button
              type="submit"
              disabled={submitting || !agree}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing checkout…
                </span>
              ) : (
                <>Proceed to Payment — {formatUSD(total)}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AutismIntakeModal;