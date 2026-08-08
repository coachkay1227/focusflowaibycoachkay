import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import MobileNav from "@/components/MobileNav";
import OfferCard from "@/components/offers/OfferCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AGENT_BUILDS } from "@/lib/offer-catalog";
import { webPage, breadcrumb, serviceSchema, SITE_URL, ORG_ID } from "@/lib/seo-schema";

const AgentBuilds = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  /** Only the AI Brain reaches this: a fixed foundation with nothing to scope. */
  const startCheckout = async (key: string, priceId: string, name: string) => {
    if (!user) {
      toast({
        title: "Sign in to buy",
        description: "Create an account so we can attach your build.",
      });
      navigate(`/auth?next=${encodeURIComponent("/agents/builds")}`);
      return;
    }
    setBusyKey(key);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId,
          successPath: `/order-success?tier=${encodeURIComponent(name)}`,
          cancelPath: "/agents/builds?checkout=cancelled",
        },
      });
      if (error) throw error;
      const url = (data as { url?: string } | null)?.url;
      if (!url) throw new Error("No checkout URL returned");
      window.location.href = url;
    } catch (e) {
      toast({
        title: "Checkout could not start",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusyKey(null);
    }
  };

  const jsonLd = [
    webPage("/agents/builds", "Agent Builds — Your First AI Agent", "CollectionPage"),
    serviceSchema({
      name: "AI Agent Builds",
      description:
        "Standalone AI agent builds from Coach Kay's team. Start with the $197 AI Brain, then add a trained agent that answers, follows up, and books, live in about 72 hours.",
      url: `${SITE_URL}/agents/builds`,
      idSuffix: "ai-agent-builds",
    }),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Automation & Agent Systems", path: "/agents" },
        { name: "Agent Builds", path: "/agents/builds" },
      ],
      "/agents/builds",
    ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${SITE_URL}/agents/builds#itemlist`,
      name: "Agent Builds",
      itemListElement: AGENT_BUILDS.map((build, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: build.name,
          description: build.tagline,
          provider: { "@id": ORG_ID },
          url: `${SITE_URL}/agents/builds`,
          // Only the fixed-price foundation publishes a price. Scoped builds
          // carry a "from" band in the UI and no price in structured data.
          ...(build.price
            ? {
                offers: {
                  "@type": "Offer",
                  price: build.price.toFixed(2),
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                },
              }
            : {}),
        },
      })),
    },
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <SEOHead
        title="AI Agent Builds: Live in 72 Hours"
        description="One trained AI agent built for you, from $297. Starts with the $197 AI Brain, the knowledge base every agent draws from. Built by Coach Kay's team."
        path="/agents/builds"
        keywords={[
          "custom AI agent build",
          "AI assistant built for me",
          "AI knowledge base service",
          "done for you AI agent",
          "small business AI agent",
        ]}
        jsonLd={jsonLd}
      />

      <header className="relative z-10 px-6 sm:px-10 pt-6 flex items-center justify-between">
        <Link
          to="/agents"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Automation &amp; Agent Systems
        </Link>
        <div className="font-heading text-lg font-light" role="img" aria-label="FocusFlow AI">
          <span aria-hidden="true" className="text-primary font-medium">Focus</span>
          <span aria-hidden="true" className="text-foreground font-light">Flow AI</span>
        </div>
        <MobileNav />
      </header>

      <section className="relative z-10 px-6 sm:px-10 pt-12 pb-10 max-w-4xl mx-auto text-center">
        <span className="font-mono-label text-primary tracking-[0.28em] text-xs">AGENT BUILDS</span>
        <h1
          className="font-heading text-4xl sm:text-6xl font-light leading-tight mt-6"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
        >
          One agent. <span className="text-primary italic">One job off your plate.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          If you are not ready for a full retainer, start here. Pick the one job that eats your week,
          and we build an agent that carries it. Most clients are live in about 72 hours.
        </p>
        <p className="mt-5 text-sm text-primary/80 max-w-xl mx-auto">
          Every build starts with your AI Brain. That is the part most people skip, and it is why their
          AI sounds like everyone else's.
        </p>
      </section>

      <section className="relative z-10 px-6 sm:px-10 pb-8 max-w-6xl mx-auto">
        <AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {AGENT_BUILDS.map((build) => (
              <OfferCard
                key={build.key}
                eyebrow={build.required ? "Foundation · required" : "Agent build"}
                badge={build.highlighted ? "Start here" : undefined}
                title={build.name}
                tagline={build.tagline}
                features={build.features}
                price={build.priceDisplay}
                priceSuffix={build.turnaround}
                variant={build.highlighted ? "featured" : build.required ? "premium" : "standard"}
                primaryCta={
                  build.priceId
                    ? {
                        label: busyKey === build.key ? "Starting…" : `Buy the ${build.name}`,
                        onClick: () => startCheckout(build.key, build.priceId!, build.name),
                      }
                    : {
                        label: "Start your intake",
                        to: `/agent-intake?offer=${build.key}`,
                      }
                }
                footnote={
                  build.priceId
                    ? build.addOn
                    : `${build.addOn ? `${build.addOn} ` : ""}You get a scope and a price back before you pay.`
                }
              />
            ))}
          </div>
        </AnimatedSection>
      </section>

      <section className="relative z-10 px-6 sm:px-10 py-14 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-8 sm:p-10">
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">
            WHY THE INTAKE COMES FIRST
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl mt-3 mb-4">
            You should not pay for a build nobody has scoped
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Here is the honest catch. An agent is not a product on a shelf. What it costs depends on
            what it has to do, what it plugs into, and how much of your knowledge it needs. So the
            intake comes first. You tell us the job, we come back with the scope, the price, and a
            payment link. If it is not worth it, you have lost five minutes, not a deposit.
          </p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            The AI Brain is the one exception. It is a fixed foundation at $197, so you can buy it
            outright and we get started the same day.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/agent-intake?offer=instant_agent">Start my agent intake</Link>
            </Button>
            <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              <Link to="/rent-an-agent">I want it fully managed instead</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AgentBuilds;