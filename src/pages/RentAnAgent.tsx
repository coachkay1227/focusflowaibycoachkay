import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Check, Sparkles, Bot, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import MobileNav from "@/components/MobileNav";
import OfferInquiryDialog from "@/components/offers/OfferInquiryDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  RENT_AGENT_TIERS,
  RENT_AGENT_ENTERPRISE,
  LEAD_ENGINE_TIERS,
  LEAD_ENGINE_ENTERPRISE,
  ENTRY_OFFERS,
} from "@/lib/offer-catalog";
import { webPage, breadcrumb, serviceSchema, SITE_URL, ORG_ID } from "@/lib/seo-schema";
import FAQSection from "@/components/FAQSection";
import { getFaqLane, faqPageSchema } from "@/data/faqs";
import { getSymmetricPricingGridClass } from "@/lib/grid";

const FOUNDING_STORAGE_KEY = "raa.founding";

const HOW_IT_WORKS = [
  {
    icon: Sparkles,
    title: "1. Diagnose",
    body: "Start with the $47 AI Business Audit or a discovery call. We map your workflows and identify what an agent can absorb.",
  },
  {
    icon: Bot,
    title: "2. Deploy",
    body: "Coach Kay's team configures your agent(s) on your stack — inbox, CRM, calendar, content, or custom flows.",
  },
  {
    icon: Zap,
    title: "3. Iterate",
    body: "Weekly check-ins, transparent dashboards, and continuous routing improvements. You scale outcomes — not headcount.",
  },
];

const RentAnAgent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [founding, setFounding] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem(FOUNDING_STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });
  const [busyPriceId, setBusyPriceId] = useState<string | null>(null);
  const [inquiry, setInquiry] = useState<{ open: boolean; lane: string; context?: string }>({
    open: false,
    lane: "",
  });

  const toggleFounding = (next: boolean) => {
    setFounding(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FOUNDING_STORAGE_KEY, String(next));
    }
  };

  const startCheckout = async (priceId: string, tierName: string, successPath?: string) => {
    if (!user) {
      toast({ title: "Sign in to subscribe", description: "Create an account so we can attach your subscription." });
      navigate(`/auth?next=${encodeURIComponent("/rent-an-agent")}`);
      return;
    }
    setBusyPriceId(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId,
          successPath: successPath ?? `/order-success?tier=${encodeURIComponent(tierName)}`,
          cancelPath: "/rent-an-agent?checkout=cancelled",
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
    webPage("/rent-an-agent", "Rent-an-Agent — Automation & Agent Systems", "CollectionPage"),
    serviceSchema({
      name: "Rent-an-Agent — Done-for-You AI Agent System",
      description: "Rent a fully-managed AI agent from Coach Kay's team. Custom AI automations, lead generation systems, and business workflows — built, deployed, and maintained for you.",
      url: `${SITE_URL}/rent-an-agent`,
      idSuffix: "rent-an-agent",
    }),
    serviceSchema({
      name: "AI Business Audit",
      description: "Get a personalized AI Business Audit for $47. Discover exactly where AI fits in your business — delivered within 24 hours by Coach Kay's AI coaching platform.",
      url: `${SITE_URL}/rent-an-agent`,
      price: 47,
      idSuffix: "ai-business-audit",
    }),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Rent-an-Agent", path: "/rent-an-agent" },
      ],
      "/rent-an-agent"
    ),
    faqPageSchema(
      getFaqLane("rent-an-agent")?.items ?? [],
      `${SITE_URL}/rent-an-agent#faq`
    ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${SITE_URL}/rent-an-agent#itemlist`,
      name: "Rent-an-Agent Subscription Tiers",
      itemListElement: RENT_AGENT_TIERS.map((tier, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: `Rent-an-Agent — ${tier.name}`,
          description: tier.tagline,
          provider: { "@id": ORG_ID },
          url: `${SITE_URL}/rent-an-agent`,
          offers: [
            {
              "@type": "Offer",
              name: "Founding",
              price: tier.founding.price.toFixed(2),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
            {
              "@type": "Offer",
              name: "Standard",
              price: tier.standard.price.toFixed(2),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          ],
        },
      })),
    },
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <SEOHead
        title="Rent-an-Agent — AI Agent Systems by Coach Kay"
        description="Rent a done-for-you AI agent from Coach Kay's team. Custom AI automations, lead generation systems, and business workflows — delivered and maintained for you."
        path="/rent-an-agent"
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
          AUTOMATION &amp; AGENT SYSTEMS
        </span>
        <h1 className="font-heading text-4xl sm:text-6xl font-light leading-tight mt-6"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}>
          Rent the agent. <span className="text-primary italic">Keep the leverage.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Subscribe to a dedicated AI agent — or a full squad — tuned to your business by Coach Kay's team. Inbox triage, sales follow-up, content production, and ops automation, all under one monthly retainer.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8"
            onClick={() => startCheckout(ENTRY_OFFERS.audit.priceId, "AI Business Audit", "/audit/landing")}
            disabled={busyPriceId === ENTRY_OFFERS.audit.priceId}
          >
            {busyPriceId === ENTRY_OFFERS.audit.priceId ? "Starting…" : "Start with $47 AI Audit"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-border"
            onClick={() => openInquiry("Rent-an-Agent — Discovery Call", "Book a 20-minute discovery call to scope the right tier.")}
          >
            Book a Discovery Call
          </Button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 px-6 sm:px-10 py-16 max-w-6xl mx-auto">
        <AnimatedSection>
          <div className="grid md:grid-cols-3 gap-5">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.title} className="rounded-lg border border-border/60 bg-card/40 backdrop-blur-sm p-6">
                <s.icon className="h-5 w-5 text-primary mb-3" strokeWidth={1.5} />
                <h3 className="font-heading text-lg text-foreground mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* FOUNDING TOGGLE + TIER GRID */}
      <section id="tiers" className="relative z-10 px-6 sm:px-10 pb-12 max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-10">
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">SUBSCRIPTION TIERS</span>
          <h2 className="font-heading text-3xl sm:text-4xl mt-3">Choose your agent stack</h2>

          <div className="mt-6 inline-flex items-center rounded-full border border-border/60 bg-card/40 p-1">
            <button
              type="button"
              onClick={() => toggleFounding(true)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                founding ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={founding}
            >
              Founding
              {founding && <span className="ml-2 text-[10px] opacity-80">Limited seats</span>}
            </button>
            <button
              type="button"
              onClick={() => toggleFounding(false)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                !founding ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={!founding}
            >
              Standard
            </button>
          </div>
        </AnimatedSection>

        <p className="text-xs text-center text-primary/80 mb-4">⚡ Founding pricing — locks in your rate permanently. Limited cohort.</p>

        <div className={`${getSymmetricPricingGridClass(RENT_AGENT_TIERS.length)} gap-5`}>
          {[...RENT_AGENT_TIERS].reverse().map((tier) => {
            const active = founding ? tier.founding : tier.standard;
            return (
              <div
                key={tier.key}
                className={`flex flex-col rounded-xl border bg-card/40 backdrop-blur-sm p-6 transition-colors ${
                  tier.highlighted ? "border-primary/60 ring-1 ring-primary/30" : "border-border/60 hover:border-primary/40"
                }`}
              >
                {tier.highlighted && (
                  <span className="inline-block self-start mb-3 text-[10px] tracking-[0.2em] uppercase text-primary bg-primary/10 border border-primary/30 rounded-full px-2 py-0.5">
                    Most Popular
                  </span>
                )}
                <h3 className="font-heading text-xl text-foreground">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground min-h-[2.5rem]">{tier.tagline}</p>
                <div className="mt-4 text-3xl font-bold text-primary">{active.priceDisplay}</div>
                {founding && (
                  <p className="mt-1 text-[11px] text-muted-foreground/80">
                    Locks in founding rate for the life of the subscription.
                  </p>
                )}
                <ul className="mt-5 space-y-2 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/85">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground italic">{tier.best_for}</p>
                <Button
                  onClick={() => startCheckout(active.priceId, `Rent-an-Agent ${tier.name} (${founding ? "Founding" : "Standard"})`)}
                  disabled={busyPriceId === active.priceId}
                  className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {busyPriceId === active.priceId ? "Starting…" : `Subscribe — ${active.priceDisplay}`}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Enterprise — centered banner, set apart from the tier grid */}
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-primary/40 ring-1 ring-primary/15 bg-gradient-to-br from-card/60 via-card/40 to-primary/5 backdrop-blur-sm p-8 md:p-10">
            <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 md:gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  <span className="font-mono-label text-[10px] tracking-[0.2em] uppercase text-primary bg-primary/10 border border-primary/30 rounded-full px-2 py-0.5">
                    By application
                  </span>
                </div>
                <h3 className="font-heading text-2xl text-foreground">{RENT_AGENT_ENTERPRISE.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{RENT_AGENT_ENTERPRISE.tagline}</p>
                <ul className="mt-5 space-y-2">
                  {RENT_AGENT_ENTERPRISE.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/85">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground italic">{RENT_AGENT_ENTERPRISE.best_for}</p>
              </div>
              <div className="flex flex-col gap-4 md:items-end">
                <div className="text-2xl font-semibold text-primary md:text-right">{RENT_AGENT_ENTERPRISE.priceDisplay}</div>
                <Button
                  variant="outline"
                  className="w-full md:w-auto border-primary/50 text-primary hover:bg-primary/10"
                  onClick={() => openInquiry("Rent-an-Agent — Enterprise", "Tell us about the scope: number of agents, integrations, compliance needs, and timeline.")}
                >
                  Request Enterprise Scope
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI LEAD ENGINE */}
      <section className="relative z-10 px-6 sm:px-10 py-16 max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-10">
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">AI LEAD ENGINE</span>
          <h2 className="font-heading text-3xl sm:text-4xl mt-3">
            Done-with-you outreach systems
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            From enriched lead lists to a full voice + LinkedIn + appointment booking stack. Each engagement is scoped to your CRM and outreach goals.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {LEAD_ENGINE_TIERS.map((tier) => {
            const highlighted = "highlighted" in tier && tier.highlighted;
            return (
              <div
                key={tier.name}
                className={`flex flex-col h-full rounded-xl border bg-card/40 backdrop-blur-sm p-6 transition-colors ${
                  highlighted
                    ? "border-primary/60 ring-1 ring-primary/30"
                    : "border-border/60 hover:border-primary/40"
                }`}
              >
                {highlighted && (
                  <span className="inline-block self-start mb-3 text-[10px] tracking-[0.2em] uppercase text-primary bg-primary/10 border border-primary/30 rounded-full px-2 py-0.5">
                    Most Popular
                  </span>
                )}
                <h3 className="font-heading text-xl text-foreground">Lead Engine — {tier.name}</h3>
                <p className="mt-2 text-sm text-foreground/85 font-medium leading-snug min-h-[3.5rem]">
                  {tier.headline}
                </p>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-primary">{tier.price}</div>
                  <div className="text-xs text-muted-foreground mt-1">{tier.setup}</div>
                </div>
                <ul className="mt-5 space-y-2 flex-1">
                  {tier.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground/85">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[11px] font-mono-label tracking-[0.18em] uppercase text-primary/80">
                  {tier.timeline}
                </p>
                <p className="mt-2 text-xs text-muted-foreground italic">{tier.best_for}</p>
                <Button
                  variant={highlighted ? "default" : "outline"}
                  className={`mt-6 w-full ${
                    highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border"
                  }`}
                  onClick={() => openInquiry(`AI Lead Engine — ${tier.name}`, "We'll scope your CRM, channels, and outreach volume on a discovery call.")}
                >
                  Request Scope
                </Button>
              </div>
            );
          })}
        </div>

        {/* Enterprise — centered banner */}
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-primary/40 ring-1 ring-primary/15 bg-gradient-to-br from-card/60 via-card/40 to-primary/5 backdrop-blur-sm p-8 md:p-10">
            <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 md:gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  <span className="font-mono-label text-[10px] tracking-[0.2em] uppercase text-primary bg-primary/10 border border-primary/30 rounded-full px-2 py-0.5">
                    By application
                  </span>
                </div>
                <h3 className="font-heading text-2xl text-foreground">{LEAD_ENGINE_ENTERPRISE.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{LEAD_ENGINE_ENTERPRISE.headline}</p>
                <ul className="mt-5 space-y-2">
                  {LEAD_ENGINE_ENTERPRISE.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground/85">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground italic">{LEAD_ENGINE_ENTERPRISE.best_for}</p>
              </div>
              <div className="flex flex-col gap-4 md:items-end">
                <div className="text-2xl font-semibold text-primary md:text-right">
                  {LEAD_ENGINE_ENTERPRISE.priceDisplay}
                </div>
                <Button
                  variant="outline"
                  className="w-full md:w-auto border-primary/50 text-primary hover:bg-primary/10"
                  onClick={() => openInquiry("AI Lead Engine — Enterprise", "Tell us about brands, regions, channels, compliance needs, and target volume.")}
                >
                  Request Enterprise Scope
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AUDIT REPEAT CTA */}
      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-sm p-8 sm:p-10 text-center">
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">START SMALL</span>
          <h2 className="font-heading text-2xl sm:text-3xl mt-3">
            Not sure where to start? Take the $47 AI Business Audit.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            5-minute diagnostic, AI routing recommendations, and a clear quick-win action list delivered to your inbox. Credited toward any Rent-an-Agent subscription.
          </p>
          <Button
            size="lg"
            className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8"
            onClick={() => startCheckout(ENTRY_OFFERS.audit.priceId, "AI Business Audit", "/audit/landing")}
            disabled={busyPriceId === ENTRY_OFFERS.audit.priceId}
          >
            {busyPriceId === ENTRY_OFFERS.audit.priceId ? "Starting…" : "Get my $47 audit"}
          </Button>
        </div>
      </section>

      <FAQSection
        eyebrow="Rent-an-Agent"
        items={getFaqLane("rent-an-agent")?.items ?? []}
      />

      <OfferInquiryDialog
        open={inquiry.open}
        onOpenChange={(open) => setInquiry((s) => ({ ...s, open }))}
        lane={inquiry.lane}
        context={inquiry.context}
      />
    </div>
  );
};

export default RentAnAgent;