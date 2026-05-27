import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { getFaqLane, faqPageSchema } from "@/data/faqs";
import { webPage, breadcrumb, SITE_URL } from "@/lib/seo-schema";
import { Button } from "@/components/ui/button";
import OfferInquiryDialog from "@/components/offers/OfferInquiryDialog";
import AutismIntakeModal from "@/components/autism/AutismIntakeModal";
import {
  AUTISM_DISPLAY,
  AUTISM_GIFT_WRAP_LABEL,
  type AutismDisplayPackage,
} from "@/data/autismCatalog";

const checkoutPackages = AUTISM_DISPLAY.filter((p) => !p.inquiryOnly);
const inquiryPackages = AUTISM_DISPLAY.filter((p) => p.inquiryOnly);

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    // Only animate cards that start below the fold; in-view cards stay visible.
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) return;
    setShown(false);
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, shown };
}

function PackageCard({
  pkg,
  onBuy,
  onInquiry,
}: {
  pkg: AutismDisplayPackage;
  onBuy: (slug: string, giftWrap: boolean) => void;
  onInquiry: (pkg: AutismDisplayPackage) => void;
}) {
  const [giftWrap, setGiftWrap] = useState(false);
  const { ref, shown } = useReveal();
  return (
    <div
      id={pkg.anchor}
      ref={ref}
      className={`scroll-mt-24 rounded-lg border border-border/60 bg-card/40 p-6 flex flex-col transition-all duration-700 ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <h3 className="font-heading text-2xl text-foreground">{pkg.name}</h3>
      <p className="font-heading text-4xl text-primary mt-3">{pkg.priceLabel}</p>
      <p className="text-sm text-muted-foreground mt-2">{pkg.bestFor}</p>
      <ul className="mt-5 space-y-2 text-sm text-foreground/85 flex-1">
        {pkg.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {pkg.giftWrapEligible && !pkg.inquiryOnly && (
        <label className="mt-5 flex items-start gap-3 text-sm text-foreground/85 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 accent-[hsl(var(--primary))]"
            checked={giftWrap}
            onChange={(e) => setGiftWrap(e.target.checked)}
          />
          <span>Add gift wrap + personalized note (+{AUTISM_GIFT_WRAP_LABEL})</span>
        </label>
      )}

      <div className="mt-6">
        {pkg.inquiryOnly ? (
          <Button
            onClick={() => onInquiry(pkg)}
            variant="outline"
            className="w-full border-primary/40 text-primary hover:bg-primary/10"
          >
            Request Scope
          </Button>
        ) : (
          <Button
            onClick={() => onBuy(pkg.slug, giftWrap)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Buy Now — {pkg.priceLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function AutismSocialStories() {
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [intakeSlug, setIntakeSlug] = useState<string | null>(null);
  const [intakeGiftWrap, setIntakeGiftWrap] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryLane, setInquiryLane] = useState("");

  const openBuy = (slug: string, giftWrap: boolean) => {
    setIntakeSlug(slug);
    setIntakeGiftWrap(giftWrap);
    setIntakeOpen(true);
  };
  const openInquiry = (pkg: AutismDisplayPackage) => {
    setInquiryLane(`Autism & Social Stories — ${pkg.name}`);
    setInquiryOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Autism & Social Stories — Coach Kay Elevates"
        description="AI-personalized, therapist-grade social stories for autism and special needs. HSA/FSA-ready, IEP-aligned, with a Letter of Medical Necessity included."
        path="/autism-social-stories"
        jsonLd={[
          webPage(
            "/autism-social-stories",
            "Autism & Social Stories",
            "CollectionPage"
          ),
          breadcrumb(
            [
              { name: "Home", path: "/" },
              { name: "Autism & Social Stories", path: "/autism-social-stories" },
            ],
            "/autism-social-stories"
          ),
          faqPageSchema(
            getFaqLane("autism")?.items ?? [],
            `${SITE_URL}/autism-social-stories#faq`
          ),
        ]}
      />

      {/* Hero */}
      <section className="px-6 pt-24 pb-16 max-w-5xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary/80 mb-4">
          Coach Kay Elevates Studio
        </p>
        <h1 className="font-heading text-5xl sm:text-6xl text-foreground leading-tight">
          Autism & Social Stories
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          AI-personalized, therapist-grade social stories built for the children,
          families, and providers who need them most.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <a href="#packages">See packages</a>
          </Button>
          <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
            <a href="#reimbursement">Reimbursement & eligibility</a>
          </Button>
        </div>
      </section>

      {/* This is for you */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <h2 className="font-heading text-3xl text-foreground text-center mb-10">
          This is for you if you're a…
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: "Parent or family", body: "You need one story today for a real moment your child is facing.", anchor: "single" },
            { title: "Therapist or clinician", body: "You're building a library you can use across clients and sessions.", anchor: "toolkit" },
            { title: "School or clinic", body: "You're equipping a team with IEP-aligned, scoped resources.", anchor: "school" },
          ].map((c) => (
            <a
              key={c.title}
              href={`#${c.anchor}`}
              className="rounded-lg border border-border/60 bg-card/40 p-6 hover:border-primary/40 transition-colors"
            >
              <h3 className="font-heading text-xl text-primary">{c.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{c.body}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="scroll-mt-24 px-6 py-16 max-w-6xl mx-auto">
        <h2 className="font-heading text-3xl text-foreground text-center mb-3">
          Packages
        </h2>
        <p className="text-center text-muted-foreground text-sm max-w-xl mx-auto mb-10">
          Every package includes an itemized HSA/FSA receipt, a Letter of Medical
          Necessity template, and IEP-aligned objective language.
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          {checkoutPackages.map((p) => (
            <PackageCard key={p.slug} pkg={p} onBuy={openBuy} onInquiry={openInquiry} />
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {inquiryPackages.map((p) => (
            <PackageCard key={p.slug} pkg={p} onBuy={openBuy} onInquiry={openInquiry} />
          ))}
        </div>
      </section>

      {/* Reimbursement & Eligibility */}
      <section id="reimbursement" className="scroll-mt-24 px-6 py-16 max-w-4xl mx-auto">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-8">
          <h2 className="font-heading text-3xl text-foreground">
            Reimbursement & Eligibility
          </h2>
          <p className="mt-4 text-foreground/85 leading-relaxed">
            Coach Kay Elevates social stories may be eligible for:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-foreground/85">
            {[
              "HSA / FSA reimbursement",
              "Insurance reimbursement under behavioral health benefits",
              "School voucher programs (e.g., Ohio's Jon Peterson Scholarship)",
              "Special education funding",
            ].map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>

          <h3 className="font-heading text-xl text-primary mt-8">
            Every purchase includes
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-foreground/85">
            {[
              "Detailed itemized receipt suitable for HSA/FSA submission",
              "Letter of Medical Necessity template for your provider",
              "IEP-aligned objective language for school documentation",
              "Therapeutic methodology notes for provider review",
            ].map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-muted-foreground/90 leading-relaxed">
            <strong className="text-foreground/80">Note:</strong> Eligibility for
            reimbursement is determined by your specific plan or provider. We
            provide documentation; your provider and plan determine coverage.
          </p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center">
        <p className="text-muted-foreground">
          Not sure which package fits?{" "}
          <Link to="/coach" className="text-primary hover:underline">
            Ask Coach Kay
          </Link>{" "}
          and we'll point you to the right one.
        </p>
      </section>

      <FAQSection
        eyebrow="Autism & Social Stories"
        items={getFaqLane("autism")?.items ?? []}
      />



      <AutismIntakeModal
        open={intakeOpen}
        onOpenChange={setIntakeOpen}
        packageSlug={intakeSlug}
        initialGiftWrap={intakeGiftWrap}
      />
      <OfferInquiryDialog
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        lane={inquiryLane}
        context="Tell us about the children, goals, and timeline you're scoping for."
      />
    </div>
  );
}