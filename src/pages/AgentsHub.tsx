import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import MobileNav from "@/components/MobileNav";
import { AGENT_LADDER } from "@/lib/offer-catalog";
import { webPage, breadcrumb, serviceSchema, SITE_URL, ORG_ID } from "@/lib/seo-schema";

const PRINCIPLES = [
  "We build it, host it, and manage it. You do not learn a new tool.",
  "Every agent draws on one AI Brain, so your whole system speaks in your voice.",
  "Nothing gets built before it is scoped. You see the plan and the price first.",
  "Live and working within 14 days, or your first month is free.",
];

const AgentsHub = () => {
  const jsonLd = [
    webPage("/agents", "Automation & Agent Systems", "CollectionPage"),
    serviceSchema({
      name: "Automation & Agent Systems",
      description:
        "AI agents and automation built, hosted, and managed for you. Start with a $47 audit, add your first agent, then move up to a managed AI team, outbound pipeline, or autonomous system.",
      url: `${SITE_URL}/agents`,
      idSuffix: "automation-agent-systems",
    }),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Automation & Agent Systems", path: "/agents" },
      ],
      "/agents",
    ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${SITE_URL}/agents#itemlist`,
      name: "Automation & Agent Systems",
      itemListElement: AGENT_LADDER.map((rung, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: rung.name,
          description: rung.body,
          provider: { "@id": ORG_ID },
          url: `${SITE_URL}${rung.cta.to}`,
        },
      })),
    },
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <SEOHead
        title="AI Agents and Automation, Built for You"
        description="AI agents and automation scoped by Coach Kay and supported by specialist partners. Start with an audit, add your first agent, then scale."
        path="/agents"
        keywords={[
          "AI agents for business",
          "done for you AI automation",
          "AI agency services",
          "managed AI team",
          "AI agent build service",
          "business automation with AI",
        ]}
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
      <section className="relative z-10 px-6 sm:px-10 pt-12 pb-8 max-w-4xl mx-auto text-center">
        <span className="font-mono-label text-primary tracking-[0.28em] text-xs">
          AUTOMATION &amp; AGENT SYSTEMS
        </span>
        <h1
          className="font-heading text-4xl sm:text-6xl font-light leading-tight mt-6"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
        >
          Your work, running <span className="text-primary italic">without you in it.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          If you are answering the same questions, chasing the same follow-ups, and losing leads to
          your own calendar, that is not a discipline problem. That is missing infrastructure. Coach
           Coach Kay and her specialist partners build the agents that carry it, host them, and keep them working.
        </p>
        <p className="mt-5 text-sm text-primary/80 max-w-xl mx-auto">
          A good assistant runs you $40,000+ a year, and they still clock out at 5pm. Your AI team
          does not.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8"
          >
            <Link to="/audit/intake">Start with the $47 audit</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-border">
            <Link to="/agents/builds">See the quick wins</Link>
          </Button>
        </div>
      </section>

      {/* THE LADDER */}
      <section className="relative z-10 px-6 sm:px-10 py-14 max-w-5xl mx-auto">
        <AnimatedSection className="text-center mb-10">
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">THE LADDER</span>
          <h2 className="font-heading text-3xl sm:text-4xl mt-3">Start where you actually are</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Five rungs, low to high. Nobody starts at the top, and nobody has to.
          </p>
        </AnimatedSection>

        <div className="space-y-4">
          {AGENT_LADDER.map((rung, i) => (
            <div
              key={rung.key}
              className={`rounded-xl border bg-card/40 backdrop-blur-sm p-6 sm:p-7 transition-colors ${
                "highlighted" in rung && rung.highlighted
                  ? "border-primary/60 ring-1 ring-primary/25"
                  : "border-border/60 hover:border-primary/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex items-center gap-4 sm:w-56 shrink-0">
                  <span className="font-heading text-2xl text-primary/50 tabular-nums">
                    0{i + 1}
                  </span>
                  <div>
                    <p className="font-mono-label text-[10px] tracking-[0.18em] uppercase text-primary/80">
                      {rung.step}
                    </p>
                    <h3 className="font-heading text-lg text-foreground">{rung.name}</h3>
                  </div>
                </div>
                <p className="flex-1 text-sm text-muted-foreground leading-relaxed">{rung.body}</p>
                <div className="flex flex-col items-start sm:items-end gap-2 sm:w-48 shrink-0">
                  <span className="font-heading text-xl text-foreground">{rung.priceDisplay}</span>
                  <Link
                    to={rung.cta.to}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    {rung.cta.label} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {"instant" in rung && rung.instant ? (
                    <span className="text-[11px] text-muted-foreground/80">Buy now, no call needed</span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/80">Scoped before you pay</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="relative z-10 px-6 sm:px-10 pb-20 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-sm p-8 sm:p-10">
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">HOW WE WORK</span>
          <h2 className="font-heading text-2xl sm:text-3xl mt-3 mb-6">
            Four rules that do not change
          </h2>
          <ul className="space-y-3">
            {PRINCIPLES.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-foreground/85">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-7 text-sm text-muted-foreground">
            Not sure which rung fits? Take the five-minute agent assessment and we will tell you what
            to build first.
          </p>
          <Button asChild variant="outline" className="mt-4 border-primary/50 text-primary hover:bg-primary/10">
            <Link to="/agent-builder">Take the agent assessment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AgentsHub;