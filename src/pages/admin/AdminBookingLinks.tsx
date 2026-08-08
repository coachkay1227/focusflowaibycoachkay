import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Save, ExternalLink } from "lucide-react";
import { invalidateLeadGenCache } from "@/lib/lead-gen";
import {
  FALLBACK_FREE_CLARITY_URL,
  FALLBACK_PAID_STRATEGY_URL,
  invalidateBookingLinksCache,
} from "@/hooks/use-booking-links";

const FREE_KEY = "booking.free_clarity_url";
const PAID_KEY = "booking.paid_strategy_url";
const LEADGEN_KEY = "leadgen.offer_url";

type Row = { key: string; value: string; updated_at: string };

export default function AdminBookingLinks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [free, setFree] = useState("");
  const [paid, setPaid] = useState("");
  const [leadGen, setLeadGen] = useState("");
  const [freeUpdated, setFreeUpdated] = useState<string | null>(null);
  const [paidUpdated, setPaidUpdated] = useState<string | null>(null);
  const [leadGenUpdated, setLeadGenUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("key,value,updated_at")
        .in("key", [FREE_KEY, PAID_KEY, LEADGEN_KEY]);
      if (cancelled) return;
      if (error) {
        toast({ title: "Couldn't load settings", description: error.message, variant: "destructive" });
      }
      const rows = (data ?? []) as Row[];
      const f = rows.find((r) => r.key === FREE_KEY);
      const p = rows.find((r) => r.key === PAID_KEY);
      const l = rows.find((r) => r.key === LEADGEN_KEY);
      setFree(f?.value ?? FALLBACK_FREE_CLARITY_URL);
      setPaid(p?.value ?? FALLBACK_PAID_STRATEGY_URL);
      setLeadGen(l?.value ?? "");
      setFreeUpdated(f?.updated_at ?? null);
      setPaidUpdated(p?.updated_at ?? null);
      setLeadGenUpdated(l?.updated_at ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [toast]);

  const validate = (url: string) => /^https?:\/\/.+/i.test(url.trim());

  const save = async () => {
    if (!validate(free) || !validate(paid)) {
      toast({ title: "Invalid URL", description: "Both URLs must start with https://", variant: "destructive" });
      return;
    }
    // Empty is valid for the lead-gen link: it means "keep direct checkout".
    const leadGenValue = leadGen.trim();
    if (leadGenValue && !validate(leadGenValue)) {
      toast({ title: "Invalid lead-gen URL", description: "Leave it blank, or enter a URL starting with https://", variant: "destructive" });
      return;
    }
    setSaving(true);
    const rows = [
      { key: FREE_KEY, value: free.trim(), updated_by: user?.id ?? null },
      { key: PAID_KEY, value: paid.trim(), updated_by: user?.id ?? null },
      { key: LEADGEN_KEY, value: leadGenValue, updated_by: user?.id ?? null },
    ];
    const { error } = await supabase.from("app_settings").upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    invalidateBookingLinksCache();
    invalidateLeadGenCache();
    toast({ title: "Links updated", description: "New URLs apply immediately across the site." });
    const now = new Date().toISOString();
    setFreeUpdated(now);
    setPaidUpdated(now);
    setLeadGenUpdated(now);
  };

  const fmt = (iso: string | null) =>
    iso ? `Last updated ${new Date(iso).toLocaleString()}` : "Not yet saved";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <AdminNav />
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-light flex items-center gap-3">
            <Calendar className="h-7 w-7 text-primary" />
            Booking &amp; Offer Links
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Edit the two booking URLs used across the site, dashboard, and post-purchase emails.
            Changes apply immediately, no redeploy needed.
          </p>
        </div>

        <div className="space-y-8">
          <BookingField
            id="free-url"
            label="Free 15-min Clarity Call"
            description="Used on the assessment result page and other lower-intent CTAs for cold leads."
            value={free}
            onChange={setFree}
            updatedLabel={fmt(freeUpdated)}
            disabled={loading || saving}
          />
          <BookingField
            id="paid-url"
            label="Paid 60-min Strategy Call"
            description="Used in the Private Partnership offer, the dashboard 90-day panel, and post-purchase emails."
            value={paid}
            onChange={setPaid}
            updatedLabel={fmt(paidUpdated)}
            disabled={loading || saving}
          />
          <BookingField
            id="leadgen-url"
            label="Lead-Gen Page (mid & high-ticket offers)"
            description="Leave blank to keep direct Stripe checkout. Once set, every $297+ offer, transformation paths, Rent-an-Agent tiers, and Build Studio packages, sends visitors here instead of to checkout. The $47 AI Business Audit, Autism Social Stories, and the book store keep taking payment directly."
            value={leadGen}
            onChange={setLeadGen}
            updatedLabel={fmt(leadGenUpdated)}
            disabled={loading || saving}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={save} disabled={loading || saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingField({
  id, label, description, value, onChange, updatedLabel, disabled,
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  updatedLabel: string;
  disabled: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/30 p-6">
      <Label htmlFor={id} className="text-base font-medium">{label}</Label>
      <p className="text-sm text-muted-foreground mt-1 mb-4">{description}</p>
      <Input
        id={id}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="https://..."
        className="font-mono text-sm"
      />
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>{updatedLabel}</span>
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}