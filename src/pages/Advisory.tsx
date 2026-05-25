import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import MobileNav from "@/components/MobileNav";
import OfferInquiryDialog from "@/components/offers/OfferInquiryDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ENTRY_OFFERS, ADVISORY_LANES } from "@/lib/offer-catalog";
import { webPage, breadcrumb, SITE_URL, ORG_ID } from "@/lib/seo-schema";

const Advisory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [busyPriceId, setBusyPriceId] = useState<string | null>(null);
  const [inquiry, setInquiry] = useState<{ open: boolean; lane: string; context?: string }>({
    open: false,
    lane: "",
  });

  const startCheckout = async (priceId: string, name: string, successPath?: string) => {
    if (!user) {
      toast({ title: "Sign in to continue", description: "Create an account so we can attach your purchase." });
      navigate(`/auth?next=${encodeURIComponent("/advisory")}`);
      return;
    }
    setBusyPriceId(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId,
          successPath: successPath ?? `/order-success?tier=${encodeURIComponent(name)}`,
          cancelPath: "/advisory?checkout=cancelled",
        },
      });
      if (error) throw error;
      const url = (data as { url?: string })?.url;
      if (!url) throw new Error("No checkout URL returned");
      window.location.href = url;
    } catch (e) {
      toast({
        title: "Checkout could not start",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusyPriceId(null);
    }
  };

  const openInquiry = (lane: string, context?: string) =>
    setInquiry({ open: true, lane, context });

  const jsonLd = [
    webPage("/advisory", "Advisory, Events & Premium Education", "CollectionPage"),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Advisory & Events", path: "/advisory" },
      ],
      "/advisory"
    ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${SITE_URL}/advisory#itemlist`,
      name: "Advisory, Speaking & Cohort Offers",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "Service",
            name: ENTRY_OFFERS.intensive.name,
            description: ENTRY_OFFERS.intensive.description,
            provider: { "@id": ORG_ID },
            offers: {
              "@type": "Offer",
              price: ENTRY_OFFERS.intensive.price.toFixed(2),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          },
        },
        ...ADVISORY_LANES.map((l, i) => ({
          "@type": "ListItem",
          position: i + 2,
          item: {
            "@type": "Service",
            name: l.name,
            description: l.description,
            provider: { "@id": ORG_ID },
          },
        })),
      ],
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <SEOHead
        title="Advisory, Speaking & Cohorts — Coach Kay"
        description="1-on-1 AI strategy intensives, executive advisory, corporate trainings, EAP, cohorts, and the Collective AI Summit. Pricing from $497 — enterprise scopes available."
        path="/advisory"
        jsonLd={jsonLd}
      />

      <header className="relative z-10 px-6 sm:px-10 pt-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="font-heading text-lg font-light" role="img" aria-label="FocusFlow AI">
          <span aria-hidden="true" className="text-primary font-medium">Focus</span>
          <span aria-hidden="true" className="text-foreground font-light">Flow AI</span>
        </div>
        <MobileNav />
      </header>

      {/* HERO */}
      <section className="relative z-10 px-6 sm:px-10 pt-12 pb-10 max-w-5xl mx-auto text-center">
        <span className="font-mono-label text-primary tracking-[0.28em] text-xs">
          ADVISORY · EVENTS · PREMIUM EDUCATION
        </span>
        <h1 className="font-heading text-4xl sm:text-6xl font-light leading-tight mt-6"
          style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}>
          Bring Coach Kay <span className="text-primary italic">into the room.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Strategy intensives, executive advisory, corporate trainings, cohorts, the Collective AI Summit, and AI University roadmap tracks — built for founders, teams, and institutions ready to compound clarity.
        </p>
      </section>

      {/* STRATEGY INTENSIVE — direct checkout */}
      <section className="relative z-10 px-6 sm:px-10 pb-10 max-w-4xl mx-auto">
        <AnimatedSection>
          <div className="rounded-2xl border border-primary/40 bg-primary/5 backdrop-blur-sm p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="flex-1">
                <span className="font-mono-label text-primary tracking-[0.28em] text-xs">FEATURED · DIRECT CHECKOUT</span>
                <h2 className="font-heading text-2xl sm:text-3xl mt-3 text-foreground">
                  {ENTRY_OFFERS.intensive.name}
                </h2>
                <div className="mt-2 text-primary text-2xl font-bold">{ENTRY_OFFERS.intensive.priceDisplay}</div>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {ENTRY_OFFERS.intensive.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {ENTRY_OFFERS.intensive.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground/85">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full sm:w-auto sm:min-w-[200px]">
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => startCheckout(ENTRY_OFFERS.intensive.priceId, "AI Strategy Intensive")}
                  disabled={busyPriceId === ENTRY_OFFERS.intensive.priceId}
                >
                  {busyPriceId === ENTRY_OFFERS.intensive.priceId ? "Starting…" : "Book my Intensive"}
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* OTHER LANES — inquiry */}
      <section className="relative z-10 px-6 sm:px-10 pb-16 max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-10">
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">SCOPED ENGAGEMENTS</span>
          <h2 className="font-heading text-3xl sm:text-4xl mt-3">Choose the right format</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm">
            Every engagement below is scoped on a discovery call before pricing is finalized. Coach Kay reviews each inquiry personally.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ADVISORY_LANES.map((lane) => (
            <div key={lane.key} className="flex flex-col rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 hover:border-primary/40 transition-colors">
              <h3 className="font-heading text-lg text-foreground">{lane.name}</h3>
              <div className="mt-2 text-primary font-semibold">{lane.price}</div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">{lane.description}</p>
              <ul className="mt-4 space-y-2">
                {lane.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-foreground/85">
                    <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="mt-5 w-full border-border"
                onClick={() => openInquiry(lane.name, "Tell us about audience size, format, dates, and outcomes.")}
              >
                Request Scope
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* AUDIT CROSS-CTA */}
      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-8 text-center">
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">DIAGNOSTIC FIRST</span>
          <h2 className="font-heading text-2xl sm:text-3xl mt-3">
            Unsure which engagement fits?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Start with the $47 AI Business Audit. We'll route you to the right advisory, training, or cohort path based on what surfaces.
          </p>
          <Button
            size="lg"
            className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8"
            onClick={() => startCheckout(ENTRY_OFFERS.audit.priceId, "AI Business Audit", "/audit/landing")}
            disabled={busyPriceId === ENTRY_OFFERS.audit.priceId}
          >
            {busyPriceId === ENTRY_OFFERS.audit.priceId ? "Starting…" : "Take the $47 audit"}
          </Button>
        </div>
      </section>

      <OfferInquiryDialog
        open={inquiry.open}
        onOpenChange={(open) => setInquiry((s) => ({ ...s, open }))}
        lane={inquiry.lane}
        context={inquiry.context}
      />
    </div>
  );
};

export default Advisory;