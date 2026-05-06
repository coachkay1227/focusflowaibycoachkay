import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const isChildren = selectedPackage?.category === "children";

  const orderTotal = useMemo(() => {
    const pkg = findPackage(watchedSlug);
    const pkgPrice = pkg?.priceCents ?? 0;
    const addonPrice = watchedAddons.reduce((sum, slug) => {
      const a = findAddon(slug);
      return sum + (a?.priceCents ?? 0);
    }, 0);
    return pkgPrice + addonPrice;
  }, [watchedSlug, watchedAddons]);

  const toggleAddon = (slug: string) => {
    const set = new Set(watchedAddons);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    setValue("addons", Array.from(set), { shouldValidate: true });
  };

  const onSubmit = async (data: IntakeFormData) => {
    setSubmitting(true);
    try {
      const { data: res, error } = await supabase.functions.invoke(
        "create-book-checkout",
        { body: data }
      );
      if (error) throw error;
      const url = (res as { url?: string })?.url;
      if (!url) throw new Error("Checkout URL missing");
      window.location.href = url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not start checkout";
      toast({ title: "Checkout failed", description: msg, variant: "destructive" });
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto bg-background border-border/60">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl text-foreground">
            Book Intake
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tell us about your vision so we can craft your book with intention.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 mt-4">
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
              {isChildren && (
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
              <span className="font-heading text-3xl text-primary">
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

          <div className="flex justify-end pt-4 border-t border-border/40">
            <Button
              type="submit"
              disabled={!agreeRev || !agreeFinal || submitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8"
            >
              {submitting ? "Redirecting…" : `Proceed to Payment — ${formatUSD(orderTotal)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
