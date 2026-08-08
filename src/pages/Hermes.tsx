import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import MobileNav from "@/components/MobileNav";
import { HERMES } from "@/lib/offer-catalog";
import { webPage, breadcrumb, serviceSchema, SITE_URL } from "@/lib/seo-schema";

const FIT = [
  "You already have agents or automations running and you have outgrown them.",
  "The work you want handled spans several systems, not one inbox.",
  "You can name the outcome you want owned, not just the task you want done.",
];

const NOT_FIT = [
  "You have not built anything yet. Start with the audit and a first agent.",
  "You want a chatbot on your website. That is a quick win, and it costs far less.",
  "You want to be hands-on in the build. Hermes is built for you, not with you.",
];

const Hermes = () => {
  const jsonLd = [
    webPage("/agents/hermes", "Hermes. Autonomous Agent Systems"),
    serviceSchema({
      name: HERMES.name,
      description:
        "Autonomous multi-agent systems that pursue an outcome across your tools, escalate to you only when judgment is required, and are scoped on a call before any work begins.",
      url: `${SITE_URL}/agents/hermes`,
      idSuffix: "hermes-autonomous-agents",
    }),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Automation & Agent Systems", path: "/agents" },
        { name: "Hermes", path: "/agents/hermes" },
      ],
      "/agents/hermes",
    ),
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <SEOHead
        title="Hermes: Autonomous AI Agent Systems"
        description="Hermes builds autonomous multi-agent systems that own an outcome across your tools and escalate only when judgment is needed. Scoped on a call."
        path="/agents/hermes"
        keywords={[
          "autonomous AI agents",
          "multi agent system build",
          "AI agent orchestration",
          "enterprise AI automation",
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
        <span className="font-mono-label text-primary tracking-[0.28em] text-xs">HERMES</span>
        <h1
          className="font-heading text-4xl sm:text-6xl font-light leading-tight mt-6"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
        >
          Agents that own <span className="text-primary italic">the outcome.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {HERMES.tagline}
        </p>
        <div className="mt-7 inline-flex flex-col items-center gap-1">
          <span className="font-heading text-2xl text-foreground">{HERMES.priceDisplay}</span>
          <span className="text-xs text-muted-foreground">{HERMES.priceNote}</span>
        </div>
        <div className="mt-7">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8"
          >
            <Link to={`/agent-intake?offer=${HERMES.key}`}>Request a Hermes scope</Link>
          </Button>
        </div>
      </section>

      <section className="relative z-10 px-6 sm:px-10 pb-8 max-w-4xl mx-auto">
        <AnimatedSection>
          <div className="rounded-2xl border border-primary/40 bg-card/40 backdrop-blur-sm p-8 sm:p-10">
            <h2 className="font-heading text-2xl sm:text-3xl mb-6">What is inside</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {HERMES.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground/85">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </AnimatedSection>
      </section>

      <section className="relative z-10 px-6 sm:px-10 py-10 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-7">
            <h3 className="font-heading text-lg text-foreground mb-4">This is for you if</h3>
            <ul className="space-y-2.5">
              {FIT.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground/85">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/20 backdrop-blur-sm p-7">
            <h3 className="font-heading text-lg text-foreground mb-4">This is not for you if</h3>
            <ul className="space-y-2.5">
              {NOT_FIT.map((f) => (
                <li key={f} className="text-sm text-muted-foreground leading-relaxed">
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/agents"
              className="mt-5 inline-block text-sm text-primary hover:underline"
            >
              See the whole ladder instead
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-3xl mx-auto text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Here is the honest catch. Hermes is not a package with a checkout button, and it should not
          be. Systems at this level fail when they are scoped from a form. So we talk first, map the
          outcome you want owned, and you get a written scope and price before anything is built.
        </p>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="mt-7 border-primary/50 text-primary hover:bg-primary/10"
        >
          <Link to={`/agent-intake?offer=${HERMES.key}`}>Start the conversation</Link>
        </Button>
      </section>
    </div>
  );
};

export default Hermes;