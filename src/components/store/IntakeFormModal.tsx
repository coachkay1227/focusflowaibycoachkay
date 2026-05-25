import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";
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
import { trackEvent } from "@/lib/analytics";
import {
  ADDONS,
  BOOK_PURPOSES,
  ILLUSTRATION_STYLES,
  PACKAGES,
  REFERRAL_SOURCES,
  findAddon,
  findPackage,
  formatUSD,
  intakeSchema,
  type IntakeFormData,
} from "@/lib/book-store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPackageSlug: string | null;
}

const sectionTitle = "font-heading text-xl text-primary mb-4";
const labelCls = "text-xs uppercase tracking-wider text-muted-foreground";
const inputCls =
  "bg-background/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20";
const selectCls =
  "h-10 w-full rounded-md border border-border/60 bg-background/40 px-3 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20";

export function IntakeFormModal({ open, onOpenChange, defaultPackageSlug }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [totalPulse, setTotalPulse] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      client_name: "",
      client_email: user?.email ?? "",
      client_phone: "",
      referral_source: "Instagram",
      package_slug: defaultPackageSlug ?? PACKAGES[0].slug,
      book_title: "",
      book_purpose: "Personal gift",
      book_vision: "",
      characters: "",
      illustration_style: "No preference",
      special_requirements: "",
      addons: [],
      agree_revisions: undefined as unknown as true,
      agree_final_sale: undefined as unknown as true,
    },
  });

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      reset({
        client_name: "",
        client_email: user?.email ?? "",
        client_phone: "",
        referral_source: "Instagram",
        package_slug: defaultPackageSlug ?? PACKAGES[0].slug,
        book_title: "",
        book_purpose: "Personal gift",
        book_vision: "",
        characters: "",
        illustration_style: "No preference",
        special_requirements: "",
        addons: [],
        agree_revisions: undefined as unknown as true,
        agree_final_sale: undefined as unknown as true,
      });
    }
  }, [open, defaultPackageSlug, user?.email, reset]);

  const watchedSlug = watch("package_slug");
  const watchedAddons = watch("addons") || [];
  const agreeRev = watch("agree_revisions");
  const agreeFinal = watch("agree_final_sale");

  const selectedPackage = findPackage(watchedSlug);
  const isStorybook =
    selectedPackage?.category === "storybooks" ||
    selectedPackage?.category === "legacy" ||
    selectedPackage?.category === "autism";
  const isInquiry = !!selectedPackage?.inquiryOnly;

  const orderTotal = useMemo(() => {
    const pkg = findPackage(watchedSlug);
    const pkgPrice = pkg?.priceCents ?? 0;
    const addonPrice = watchedAddons.reduce((sum, slug) => {
      const a = findAddon(slug);
      return sum + (a?.priceCents ?? 0);
    }, 0);
    return pkgPrice + addonPrice;
  }, [watchedSlug, watchedAddons]);

  // Brief shimmer pulse whenever the total changes
  useEffect(() => {
    setTotalPulse(true);
    const t = setTimeout(() => setTotalPulse(false), 450);
    return () => clearTimeout(t);
  }, [orderTotal]);

  const toggleAddon = (slug: string) => {
    const set = new Set(watchedAddons);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    setValue("addons", Array.from(set), { shouldValidate: true });
  };

  const onSubmit = async (data: IntakeFormData) => {
    setSubmitting(true);
    setSubmitError(null);
    void trackEvent(
      "studio_intake_submit",
      {
        slug: data.package_slug,
        addons: data.addons,
        order_total_cents: orderTotal,
        inquiry: isInquiry,
      },
      selectedPackage?.category ?? null
    );
    try {
      if (isInquiry) {
        const { error: inqErr } = await supabase.functions.invoke("apply-now", {
          body: {
            type: "inquiry",
            name: data.client_name,
            email: data.client_email,
            programName: selectedPackage?.name ?? "Studio Inquiry",
            message: [
              `Package: ${selectedPackage?.name}`,
              `Purpose: ${data.book_purpose}`,
              data.book_title ? `Title idea: ${data.book_title}` : null,
              `Vision: ${data.book_vision}`,
              data.characters ? `Characters / Subject: ${data.characters}` : null,
              `Illustration style: ${data.illustration_style}`,
              data.special_requirements
                ? `Notes: ${data.special_requirements}`
                : null,
              data.client_phone ? `Phone: ${data.client_phone}` : null,
              `Source: ${data.referral_source}`,
            ]
              .filter(Boolean)
              .join("\n"),
          },
        });
        if (inqErr) throw inqErr;
        void trackEvent(
          "studio_inquiry_submitted",
          { slug: data.package_slug, package_name: selectedPackage?.name },
          selectedPackage?.category ?? null
        );
        toast({
          title: "Inquiry received",
          description: "Coach Kay's team will follow up by email shortly.",
        });
        setSubmitting(false);
        onOpenChange(false);
        return;
      }
      const { data: res, error } = await supabase.functions.invoke(
        "create-book-checkout",
        { body: data }
      );
      if (error) throw error;
      const url = (res as { url?: string })?.url;
      if (!url) throw new Error("Checkout URL missing");
      void trackEvent(
        "studio_checkout_started",
        {
          slug: data.package_slug,
          order_total_cents: orderTotal,
        },
        selectedPackage?.category ?? null
      );
      window.location.href = url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not start checkout";
      setSubmitError(msg);
      void trackEvent(
        "studio_checkout_failed",
        { slug: data.package_slug, message: msg, inquiry: isInquiry },
        selectedPackage?.category ?? null
      );
      toast({ title: "Checkout failed", description: msg, variant: "destructive" });
      setSubmitting(false);
      requestAnimationFrame(() => {
        formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  const onInvalid = () => {
    requestAnimationFrame(() => {
      formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const errorCount = Object.keys(errors).length;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!submitting) onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden bg-background border-border/60 p-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="font-heading text-3xl text-foreground">
              Book Intake
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tell us about your vision so we can craft your book with intention.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="relative space-y-10 mt-4 overflow-y-auto px-6 pb-32 sm:pb-6 max-h-[calc(92vh-7rem)]"
        >
          {(submitError || errorCount > 0) && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 animate-fade-in"
            >
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive">
                  {submitError
                    ? "We couldn't start your checkout"
                    : `Please review ${errorCount} field${errorCount === 1 ? "" : "s"} below`}
                </p>
                {submitError && (
                  <p className="text-destructive/80 mt-0.5">{submitError}</p>
                )}
              </div>
            </div>
          )}

          {/* Section 1 */}
          <section>
            <h3 className={sectionTitle}>1. About You</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className={labelCls}>Full Name</Label>
                <Input className={inputCls} {...register("client_name")} />
                {errors.client_name && (
                  <p className="text-xs text-destructive mt-1">{errors.client_name.message}</p>
                )}
              </div>
              <div>
                <Label className={labelCls}>Email Address</Label>
                <Input className={inputCls} type="email" {...register("client_email")} />
                {errors.client_email && (
                  <p className="text-xs text-destructive mt-1">{errors.client_email.message}</p>
                )}
              </div>
              <div>
                <Label className={labelCls}>Phone Number (optional)</Label>
                <Input className={inputCls} {...register("client_phone")} />
              </div>
              <div>
                <Label className={labelCls}>How did you hear about us?</Label>
                <select className={selectCls} {...register("referral_source")}>
                  {REFERRAL_SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className={sectionTitle}>2. Your Book</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className={labelCls}>Package</Label>
                <select className={selectCls} {...register("package_slug")}>
                  {PACKAGES.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} — {formatUSD(p.priceCents)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label className={labelCls}>Book title idea (optional)</Label>
                <Input className={inputCls} {...register("book_title")} />
              </div>
              <div className="sm:col-span-2">
                <Label className={labelCls}>What is this book for?</Label>
                <select className={selectCls} {...register("book_purpose")}>
                  {BOOK_PURPOSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label className={labelCls}>Tell us your vision for this book</Label>
                <Textarea
                  className={`${inputCls} min-h-[120px]`}
                  {...register("book_vision")}
                />
                {errors.book_vision && (
                  <p className="text-xs text-destructive mt-1">{errors.book_vision.message}</p>
                )}
              </div>
              {isStorybook && (
                <div className="sm:col-span-2">
                  <Label className={labelCls}>Main character(s) or subject</Label>
                  <Input className={inputCls} {...register("characters")} />
                </div>
              )}
              <div>
                <Label className={labelCls}>Preferred illustration style</Label>
                <select className={selectCls} {...register("illustration_style")}>
                  {ILLUSTRATION_STYLES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label className={labelCls}>
                  Any specific colors, themes, or must-haves? (optional)
                </Label>
                <Textarea
                  className={`${inputCls} min-h-[80px]`}
                  {...register("special_requirements")}
                />
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h3 className={sectionTitle}>3. Add-Ons</h3>
            <div className="space-y-2">
              {ADDONS.map((a) => {
                const checked = watchedAddons.includes(a.slug);
                return (
                  <label
                    key={a.slug}
                    className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      checked
                        ? "border-primary/60 bg-primary/5"
                        : "border-border/60 hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 accent-[hsl(var(--primary))]"
                      checked={checked}
                      onChange={() => toggleAddon(a.slug)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground">{a.name}</span>
                        <span className="text-primary font-medium">
                          + {formatUSD(a.priceCents)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Order Total
              </span>
              <span
                key={orderTotal}
                className={`font-heading text-3xl text-primary transition-all duration-300 ${
                  totalPulse
                    ? "scale-110 drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
                    : "scale-100"
                }`}
              >
                {formatUSD(orderTotal)}
              </span>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h3 className={sectionTitle}>4. Agreement</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 text-sm text-foreground/85">
                <input
                  type="checkbox"
                  className="mt-1 accent-[hsl(var(--primary))]"
                  {...register("agree_revisions")}
                />
                <span>
                  I understand revisions are limited to those included in my package and
                  turnaround begins after intake approval.
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm text-foreground/85">
                <input
                  type="checkbox"
                  className="mt-1 accent-[hsl(var(--primary))]"
                  {...register("agree_final_sale")}
                />
                <span>I agree all sales are final once work begins.</span>
              </label>
            </div>
          </section>

          {/* Desktop submit row */}
          <div className="hidden sm:flex items-center justify-between gap-4 pt-4 border-t border-border/40">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary/80" />
              {isInquiry
                ? "Custom-quote inquiry — no payment now"
                : "Secure checkout powered by Stripe"}
            </p>
            <Button
              type="submit"
              disabled={!agreeRev || !agreeFinal || submitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 min-w-[18rem]"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isInquiry ? "Sending inquiry…" : "Preparing secure checkout…"}
                </span>
              ) : (
                <>
                  {isInquiry
                    ? "Request Custom Quote"
                    : `Proceed to Payment — ${formatUSD(orderTotal)}`}
                </>
              )}
            </Button>
          </div>

          {/* Trust + policy footer */}
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed text-center pt-2">
            By submitting you agree that work begins on intake approval and all
            sales are final once production starts. Questions? Email{" "}
            <a
              href="mailto:Hello@coachkayelevates.org"
              className="text-primary hover:underline"
            >
              Hello@coachkayelevates.org
            </a>
            .
          </p>

          {/* Cinematic submitting overlay */}
          {submitting && (
            <div
              aria-live="polite"
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-md bg-background/80 backdrop-blur-sm animate-fade-in"
            >
              <div className="relative h-12 w-12">
                <span className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <Loader2 className="absolute inset-0 h-12 w-12 text-primary animate-spin" />
              </div>
              <p className="font-heading text-xl text-foreground">
                {isInquiry ? "Sending your inquiry" : "Preparing your secure checkout"}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Do not close this window
              </p>
            </div>
          )}
        </form>

        {/* Sticky mobile total + CTA */}
        <div className="sm:hidden absolute inset-x-0 bottom-0 z-10 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Total
            </span>
            <span
              key={`m-${orderTotal}`}
              className={`font-heading text-2xl text-primary transition-all duration-300 ${
                totalPulse ? "scale-110" : "scale-100"
              }`}
            >
              {formatUSD(orderTotal)}
            </span>
          </div>
          <Button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={!agreeRev || !agreeFinal || submitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isInquiry ? "Sending…" : "Preparing…"}
              </span>
            ) : (
              isInquiry ? "Request Custom Quote" : "Proceed to Payment"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
