import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Cog, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import MobileNav from "@/components/MobileNav";
import BuildApplicationDialog from "@/components/build-studio/BuildApplicationDialog";
import OfferCard from "@/components/offers/OfferCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BUILD_STUDIO_TIERS,
  QUICK_WINS,
  BUSINESS_BUILDS,
  CUSTOM_AI_APPS,
  CARE_PLANS,
  type BuildStudioTierId,
  type BuildTierOffer,
} from "@/lib/build-studio-catalog";
import { webPage, breadcrumb, SITE_URL, ORG_ID } from "@/lib/seo-schema";
import { getSymmetricGridClass } from "@/lib/grid";

const PILLARS = [
  {
    icon: Zap,
    title: "Speed",
    body: "Most builds ship in days, not months. We use AI to compress 4 months of agency work into 14 days.",
  },
  {
    icon: Cog,
    title: "Systems",
    body: "Every build is a system you own — code, content, automations. Not a static brochure you'll outgrow.",
  },
  {
    icon: Crown,
    title: "Sovereignty",
    body: "You keep the code. You keep the assets. You keep control. The Collective builds with you, not at you.",
  },
];

const PROCESS = [
  { step: "01", title: "Brief", body: "15-min call or written brief. We scope the build and lock the price." },
  {
    step: "02",
    title: "Build",
    body: "We build with AI-leveraged speed — first preview within 48 hours for Tier 1, 1 week for larger.",
  },
  { step: "03", title: "Launch", body: "We deploy, wire your domain, and walk you through the handoff." },
  { step: "04", title: "Care", body: "Optional monthly care plan keeps it humming — updates, edits, monitoring." },
];

const FAQS = [
  {
    q: "Is this really built with AI?",
    a: "Yes — and that's the point. We use Lovable + AI agents to compress what agencies bill 4 months for into days. You get the same outcome at a fraction of the cost.",
  },
  {
    q: "Do I own the code?",
    a: "Fully. Every build hands off with the full source code, the database, and the deploy. You can take it anywhere.",
  },
  {
    q: "What if I want changes after launch?",
    a: "Quick-Win tier comes with one round of revisions. Larger builds include two rounds. After that, add a Care plan or pay hourly.",
  },
  {
    q: "Can I see examples before I buy?",
    a: "Yes — book a 15-minute scoping call (free for Tier 2+) and we'll walk through past builds and your specific use case.",
  },
  {
    q: "What's not included?",
    a: "Hosting fees (most builds use free or low-cost hosts), domain registration, paid integrations (Stripe, email provider, etc), and third-party API costs.",
  },
  {
    q: "Refunds?",
    a: "Tier 1 (Quick Wins): full refund before we start, 50% after first preview. Tier 2+ scoped via contract — half down, half on launch.",
  },
];

const tierIcon = (id: BuildStudioTierId) => {
  if (id === "quick_wins") return Zap;
  if (id === "business") return Cog;
  if (id === "custom_ai") return Sparkles;
  return Crown;
};

const CollectiveAIBuildStudio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTier, setActiveTier] = useState<BuildStudioTierId>("quick_wins");
  const [busyPriceId, setBusyPriceId] = useState<string | null>(null);
  const [appDialog, setAppDialog] = useState<{ open: boolean; projectType: string; tier: string }>({
    open: false,
    projectType: "",
    tier: "",
  });

  const activeOffers: readonly BuildTierOffer[] = useMemo(() => {
    return BUILD_STUDIO_TIERS.find((t) => t.id === activeTier)?.offers ?? [];
  }, [activeTier]);

  const startCheckout = async (offer: BuildTierOffer) => {
    if (!offer.priceId) return;
    setBusyPriceId(offer.priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId: offer.priceId,
          successPath: `/order-success?tier=${encodeURIComponent(offer.name)}`,
          cancelPath: "/collective-ai-build-studio?checkout=cancelled",
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

  const openApp = (offer: BuildTierOffer, tierLabel: string) =>
    setAppDialog({ open: true, projectType: offer.name, tier: tierLabel });

  const jsonLd = [
    webPage("/collective-ai-build-studio", "Collective AI Build Studio — From Idea to Live in Days", "CollectionPage"),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Collective AI Build Studio", path: "/collective-ai-build-studio" },
      ],
      "/collective-ai-build-studio",
    ),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${SITE_URL}/collective-ai-build-studio#service`,
      name: "Collective AI Build Studio",
      description:
        "AI-leveraged build studio. Landing pages, dashboards, lead-gen tools, and custom AI apps shipped in days — not months. From $297 one-time to $14,997 custom builds, plus recurring care plans.",
      provider: { "@id": ORG_ID },
      areaServed: "Global",
      offers: [...QUICK_WINS, ...CARE_PLANS, ...BUSINESS_BUILDS, ...CUSTOM_AI_APPS].map((o) => ({
        "@type": "Offer",
        name: o.name,
        price: o.price.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/collective-ai-build-studio`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${SITE_URL}/collective-ai-build-studio#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <SEOHead
        title="Collective AI Build Studio — From Idea to Live in Days"
        description="Custom AI websites, dashboards, lead-gen tools, and SaaS apps built in days, not months. Productized AI build studio by Coach Kay. Tier 1 from $297, full builds from $2,497."
        path="/collective-ai-build-studio"
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
          <span aria-hidden="true" className="text-primary font-medium">
            Focus
          </span>
          <span aria-hidden="true" className="text-foreground font-light">
            Flow AI
          </span>
        </div>
        <MobileNav />
      </header>

      {/* HERO */}
      <section className="relative z-10 px-6 sm:px-10 pt-16 pb-12 max-w-5xl mx-auto text-center">
        <span className="font-mono-label text-primary tracking-[0.28em] text-xs">
          COLLECTIVE AI BUILD STUDIO · LED BY COACH KAY
        </span>
        <h1
          className="font-heading text-4xl sm:text-6xl font-light leading-tight mt-6"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
        >
          From idea to live in days. <br />
          <span className="text-primary italic">From launch to scale on autopilot.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          What agencies build in 4 months, the Collective ships in 14 days — because we build <em>with</em> AI, not
          around it. Landing pages, dashboards, lead-gen tools, AI apps, and the care plans that keep them growing.
        </p>
        <p className="mt-4 text-xs text-muted-foreground/80">
          Delivered by the{" "}
          <Link to="/collective" className="text-primary hover:underline">
            Collective AI team
          </Link>{" "}
          · Contracted under Focus Flow AI LLC
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8"
            onClick={() => document.getElementById("what-we-build")?.scrollIntoView({ behavior: "smooth" })}
          >
            Start a build
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary/10 px-8"
            onClick={() =>
              setAppDialog({ open: true, projectType: "Not sure yet — let's scope it", tier: "Discovery" })
            }
          >
            Book a scoping call
          </Button>
        </div>
      </section>

      {/* MANIFESTO STRIP */}
      <section className="relative z-10 px-6 sm:px-10 pb-16 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-5">
          {PILLARS.map((p) => (
            <AnimatedSection key={p.title}>
              <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-7 h-full">
                <p.icon className="h-6 w-6 text-primary" />
                <h3 className="font-heading text-2xl mt-4 text-foreground">{p.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* WHAT WE BUILD — TIER TABS */}
      <section id="what-we-build" className="relative z-10 px-6 sm:px-10 pb-20 max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-10">
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">WHAT WE BUILD</span>
          <h2 className="font-heading text-3xl sm:text-4xl mt-3">Pick your build, ship in days.</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm">
            Quick Wins ship via instant checkout. Larger builds get a 15-minute scoping call.
          </p>
        </AnimatedSection>

        {/* Tier selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {BUILD_STUDIO_TIERS.map((t) => {
            const Icon = tierIcon(t.id);
            const active = activeTier === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTier(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-colors border ${
                  active
                    ? "bg-primary/15 text-primary border-primary/50"
                    : "bg-card/30 text-muted-foreground border-border/60 hover:text-foreground hover:border-primary/30"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="font-medium">{t.label}</span>
                <span className="text-xs opacity-70">{t.price}</span>
              </button>
            );
          })}
        </div>

        {/* Offer grid */}
        <div className={`${getSymmetricGridClass(activeOffers.length)} gap-5 items-stretch`}>
          {activeOffers.map((o) => {
            const tierLabel = BUILD_STUDIO_TIERS.find((t) => t.id === activeTier)?.label ?? "";
            const isCheckout = Boolean(o.priceId);
            const busy = isCheckout && busyPriceId === o.priceId;
            return (
              <OfferCard
                key={o.key}
                eyebrow={o.turnaround}
                badge={o.highlighted ? "Most Popular" : undefined}
                title={o.name}
                tagline={o.tagline}
                features={[...o.features]}
                price={o.priceDisplay}
                variant={o.highlighted ? "featured" : "standard"}
                primaryCta={
                  isCheckout
                    ? { label: busy ? "Starting…" : "Buy now", onClick: () => startCheckout(o) }
                    : { label: "Apply to build", onClick: () => openApp(o, tierLabel) }
                }
              />
            );
          })}
        </div>
      </section>

      {/* PROCESS */}
      <section className="relative z-10 px-6 sm:px-10 pb-20 max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-10">
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">THE PROCESS</span>
          <h2 className="font-heading text-3xl sm:text-4xl mt-3">Brief → Build → Launch → Care</h2>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROCESS.map((step) => (
            <div key={step.step} className="rounded-xl border border-border/60 bg-card/30 p-6">
              <div className="font-mono text-primary text-sm tracking-widest">{step.step}</div>
              <h3 className="font-heading text-xl mt-2 text-foreground">{step.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 px-6 sm:px-10 pb-20 max-w-3xl mx-auto">
        <AnimatedSection className="text-center mb-8">
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">FAQ</span>
          <h2 className="font-heading text-3xl sm:text-4xl mt-3">Common questions</h2>
        </AnimatedSection>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-xl border border-border/60 bg-card/30 p-5">
              <summary className="flex items-center justify-between cursor-pointer text-foreground font-medium list-none">
                <span>{f.q}</span>
                <span className="text-primary text-xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA + by-invitation */}
      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-primary/40 bg-primary/5 backdrop-blur-sm p-10 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl text-foreground">
            Ready to build the thing you keep talking about?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Buy a Quick Win in two clicks, or apply for a full build. Either way, you'll have something live in days.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8"
              onClick={() => {
                setActiveTier("quick_wins");
                document.getElementById("what-we-build")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Browse Quick Wins
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 px-8"
              onClick={() =>
                setAppDialog({ open: true, projectType: "Not sure yet — let's scope it", tier: "Discovery" })
              }
            >
              Apply for a full build
            </Button>
          </div>
          <p className="mt-8 text-xs text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
            <strong className="text-foreground/80">By invitation:</strong> Fractional AI Product Lead retainers,
            enterprise build pods, and equity builds. Email{" "}
            <a href="mailto:Hello@coachkayelevates.org" className="text-primary underline">
              Hello@coachkayelevates.org
            </a>{" "}
            for institutional scopes.
          </p>
        </div>
      </section>

      <BuildApplicationDialog
        open={appDialog.open}
        onOpenChange={(open) => setAppDialog((s) => ({ ...s, open }))}
        projectType={appDialog.projectType}
        tier={appDialog.tier}
      />
    </div>
  );
};

export default CollectiveAIBuildStudio;
