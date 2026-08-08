import { Link } from "react-router-dom";
import { ArrowLeft, Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import MobileNav from "@/components/MobileNav";
import { LEAD_ENGINE_TIERS, LEAD_ENGINE_ENTERPRISE } from "@/lib/offer-catalog";
import { webPage, breadcrumb, serviceSchema, SITE_URL, ORG_ID } from "@/lib/seo-schema";

const LeadEngine = () => {
  const jsonLd = [
    webPage("/agents/lead-engine", "AI Lead Engine. Outbound Systems", "CollectionPage"),
    serviceSchema({
      name: "AI Lead Engine",
      description:
         "Done-with-you outbound systems scoped by Coach Kay and supported by specialist partners: enriched and intent-scored leads, multi-channel sequences, voice qualification, and auto-booking.",
      url: `${SITE_URL}/agents/lead-engine`,
      idSuffix: "ai-lead-engine",
    }),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Automation & Agent Systems", path: "/agents" },
        { name: "AI Lead Engine", path: "/agents/lead-engine" },
      ],
      "/agents/lead-engine",
    ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${SITE_URL}/agents/lead-engine#itemlist`,
      name: "AI Lead Engine Tiers",
      // Every tier is scoped on a call, so no tier publishes an exact price here.
      itemListElement: [...LEAD_ENGINE_TIERS, LEAD_ENGINE_ENTERPRISE].map((tier, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: tier.name.startsWith("Lead Engine") ? tier.name : `AI Lead Engine, ${tier.name}`,
          description: tier.headline,
          provider: { "@id": ORG_ID },
          url: `${SITE_URL}/agents/lead-engine`,
        },
      })),
    },
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <SEOHead
        title="AI Lead Engine: Outbound That Books Meetings"
        description="Enriched leads, multi-channel outreach, voice qualification, and auto-booking, scoped by Coach Kay and supported by specialist partners."
        path="/agents/lead-engine"
        keywords={[
          "AI lead generation system",
          "AI outbound automation",
          "AI SDR replacement",
          "intent scored leads",
          "automated appointment booking",
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
        <div className="font-heading text-lg font-light" role="img" aria-label="Coach Kay Elevates">
          <span aria-hidden="true" className="text-primary font-medium">Coach Kay</span>
          <span aria-hidden="true" className="text-foreground font-light"> Elevates</span>
        </div>
        <MobileNav />
      </header>

      <section className="relative z-10 px-6 sm:px-10 pt-12 pb-10 max-w-4xl mx-auto text-center">
        <span className="font-mono-label text-primary tracking-[0.28em] text-xs">AI LEAD ENGINE</span>
        <h1
          className="font-heading text-4xl sm:text-6xl font-light leading-tight mt-6"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
        >
          Pipeline that runs <span className="text-primary italic">when you cannot.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          If your revenue rises and falls with how much outreach you personally did that week, you do
          not have a pipeline. You have a habit. This builds the system underneath it: finds the right
          people, scores them, reaches out, follows up, and books the call.
        </p>
        <p className="mt-5 text-sm text-primary/80 max-w-xl mx-auto">
          Every tier is scoped on a call first. We look at your CRM, your channels, and your real
          volume before anyone quotes you a setup.
        </p>
      </section>

      <section className="relative z-10 px-6 sm:px-10 pb-10 max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
            {LEAD_ENGINE_TIERS.map((tier) => {
              const highlighted = "highlighted" in tier && tier.highlighted;
              return (
                <div
                  key={tier.key}
                  id={`lead-engine-${tier.key}`}
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
                  <h4 className="text-[10px] uppercase tracking-[0.16em] text-primary/75">
                    Lead Engine Tier
                  </h4>
                  <h2 className="font-heading text-xl text-foreground">{tier.name}</h2>
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
                    asChild
                    variant={highlighted ? "default" : "outline"}
                    className={`mt-6 w-full ${
                      highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-border"
                    }`}
                  >
                    <Link to={`/agent-intake?offer=lead_engine_${tier.key}`}>Start my intake</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Enterprise */}
        <div className="mt-10 max-w-3xl mx-auto" id="lead-engine-enterprise">
          <div className="relative overflow-hidden rounded-2xl border border-primary/40 ring-1 ring-primary/15 bg-gradient-to-br from-card/60 via-card/40 to-primary/5 backdrop-blur-sm p-8 md:p-10">
            <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 md:gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  <span className="font-mono-label text-[10px] tracking-[0.2em] uppercase text-primary bg-primary/10 border border-primary/30 rounded-full px-2 py-0.5">
                    Enterprise
                  </span>
                </div>
                <h2 className="font-heading text-2xl text-foreground">{LEAD_ENGINE_ENTERPRISE.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{LEAD_ENGINE_ENTERPRISE.headline}</p>
                <ul className="mt-5 space-y-2">
                  {LEAD_ENGINE_ENTERPRISE.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground/85">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground italic">
                  {LEAD_ENGINE_ENTERPRISE.best_for}
                </p>
              </div>
              <div className="flex flex-col gap-2 md:items-end">
                <div className="text-2xl font-semibold text-primary md:text-right">
                  {LEAD_ENGINE_ENTERPRISE.priceDisplay}
                </div>
                <div className="text-xs text-muted-foreground md:text-right">
                  {LEAD_ENGINE_ENTERPRISE.setup}
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="mt-3 w-full md:w-auto border-primary/50 text-primary hover:bg-primary/10"
                >
                  <Link to="/agent-intake?offer=lead_engine_enterprise">Request Enterprise scope</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-sm p-8 sm:p-10 text-center">
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">NOT SURE YET</span>
          <h2 className="font-heading text-2xl sm:text-3xl mt-3">
            Start with the $47 AI Business Audit
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Before you buy a pipeline, find out whether leads are actually your bottleneck. The audit
            tells you in five minutes, and it credits toward whatever you build next.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8"
          >
            <Link to="/audit/intake">Get my $47 audit</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LeadEngine;