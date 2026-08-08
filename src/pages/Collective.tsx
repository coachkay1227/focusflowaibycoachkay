import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Layers, Users, ShieldCheck, Cog, Sparkles, ExternalLink } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import MobileNav from "@/components/MobileNav";
import { webPage, breadcrumb, SITE_URL } from "@/lib/seo-schema";

const ROLES = [
  { icon: Cog, title: "Scope & Accountability", body: "Coach Kay scopes your build, owns the roadmap, and signs the SOW under Focus Flow AI LLC." },
  { icon: Layers, title: "Lead Engineer", body: "Ships the system end-to-end: frontend, edge functions, integrations." },
  { icon: Sparkles, title: "AI Researcher", body: "Designs the prompt + model strategy. Keeps quality and cost in line." },
  { icon: Users, title: "Designer & QA", body: "Visual polish, accessibility, mobile parity, pre-launch hardening." },
];

const CAPABILITIES = [
  "Custom AI websites, dashboards, and lead-gen tools",
  "Internal workflow automation and AI agents",
  "Enterprise integrations (Stripe, GHL, Supabase, REST/GraphQL APIs)",
  "Compliance-aware builds for public-sector and nonprofit partners",
  "Fractional AI product leadership and advisory",
  "Ongoing Care plans: uptime, edits, monitoring, growth",
];

const FAQS = [
  {
    q: "Is the AI Task Force a different company than Coach Kay Elevates?",
    a: "Yes. The AI Task Force is an independent company founded by John Moyler. Coach Kay is an AI partner there, not its owner or founder. Your coaching and Coach Kay's offers stay with Focus Flow AI LLC (DBA Coach Kay Elevates). Task Force partners join larger builds when the scope needs added capacity.",
  },
  {
    q: "When does the AI Task Force get involved?",
    a: "1:1 coaching, programs, and the AI Business Audit are delivered by Coach Kay. Task Force partners may join larger Build Studio, advisory, or enterprise scopes when the work needs added engineering, research, design, or QA capacity.",
  },
  {
    q: "Who owns what we build?",
    a: "You do. Full source code, accounts, and content hand off to you on launch. The AI Task Force never holds your assets hostage.",
  },
];

export default function Collective() {
  const jsonLd = [
    webPage("/ai-task-force", "AI Task Force: Partners for Larger Builds", "AboutPage"),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "AI Task Force", path: "/ai-task-force" },
      ],
      "/ai-task-force"
    ),
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/ai-task-force#org`,
      name: "AI Task Force",
      description:
        "An independent company founded by John Moyler. Independent operators across engineering, AI research, design, and QA who combine capacity for large builds and community-scale work. Coach Kay (Kenza Alaoui) is an AI partner there.",
      url: `${SITE_URL}/ai-task-force`,
      founder: { "@type": "Person", name: "John Moyler" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${SITE_URL}/ai-task-force#faq`,
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
        title="AI Task Force: Partners for Larger Builds"
        description="The AI Task Force is an independent company founded by John Moyler. Coach Kay is an AI partner who brings in added capacity for larger builds."
        path="/ai-task-force"
        keywords={[
          "AI Task Force partner network",
          "AI development team Columbus",
          "enterprise AI delivery",
          "automation engineering team",
          "Coach Kay AI partner",
          "AI systems implementation team",
        ]}
        jsonLd={jsonLd}
      />

      <header className="relative z-10 px-6 sm:px-10 pt-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="font-heading text-lg font-light" role="img" aria-label="FocusFlow AI">
          <span aria-hidden className="text-primary font-medium">Focus</span>
          <span aria-hidden className="text-foreground font-light">Flow AI</span>
        </div>
        <MobileNav />
      </header>

      {/* HERO */}
      <section className="relative z-10 px-6 sm:px-10 pt-12 pb-10 max-w-5xl mx-auto text-center">
        <span className="font-mono-label text-primary tracking-[0.28em] text-xs">
           AI TASK FORCE · INDEPENDENT PARTNER NETWORK
        </span>
        <h1
          className="font-heading text-4xl sm:text-6xl font-light leading-tight mt-6"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
        >
          Larger builds need more than one set of hands. <br />
          <span className="text-primary italic">The AI Task Force adds the right capacity.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          For 1:1 coaching, you work with Coach Kay. For larger builds, automations, and enterprise scopes,
          Coach Kay can bring in the AI Task Force, an independent company founded by John Moyler where
          Coach Kay is an AI partner. Engineering, AI research, design, and QA are assembled around the scope.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/build-studio"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3 text-sm font-medium tracking-wide hover:bg-primary/90 transition-colors"
          >
            Start a build conversation <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://coachkayelevates.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 text-primary px-7 py-3 text-sm font-medium tracking-wide hover:bg-primary/10 transition-colors"
          >
            Book 1:1 with Coach Kay <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* TWO HATS */}
      <section className="relative z-10 px-6 sm:px-10 pb-12 max-w-4xl mx-auto">
        <AnimatedSection>
          <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-8 md:p-10">
            <p className="font-mono-label text-primary tracking-[0.22em] text-[10px] mb-3">
              TWO HATS · ONE MISSION
            </p>
            <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4">
              Coach Kay is both the coach and the builder.
            </h2>
            <p className="text-[15px] text-muted-foreground leading-[1.8] mb-3">
              As <strong className="text-foreground/85">Coach Kay</strong>, she runs the
              1:1 coaching, the programs, and the personal transformations, solo,
              high-touch, deeply human.
            </p>
            <p className="text-[15px] text-muted-foreground leading-[1.8]">
              As an <strong className="text-foreground/85">AI partner in the AI Task Force</strong>, the
              independent company founded by John Moyler, she scopes the work and can bring in the right
              partners for dashboards, automations, and larger systems. Same point of contact. Added capacity.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* ROLES */}
      <section className="relative z-10 px-6 sm:px-10 pb-16 max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-8">
          <span className="font-mono-label text-primary tracking-[0.28em] text-xs">WHO DELIVERS</span>
          <h2 className="font-heading text-3xl sm:text-4xl mt-3">The roles around your project</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm">
            Roles are chosen based on the actual scope. Coach Kay scopes the work and signs the SOW under
            Focus Flow AI LLC. AI Task Force partners join only when the project needs their capacity.
          </p>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLES.map((r) => (
            <div key={r.title} className="rounded-xl border border-border/60 bg-card/40 p-6">
              <r.icon className="h-6 w-6 text-primary" />
              <h3 className="font-heading text-lg mt-3 text-foreground">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="relative z-10 px-6 sm:px-10 pb-16 max-w-4xl mx-auto">
        <AnimatedSection>
          <div className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-8 md:p-10">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="font-mono-label text-primary tracking-[0.22em] text-[10px]">
                CAPABILITY SNAPSHOT
              </span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-5">
              What can be shipped with AI Task Force partners
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {CAPABILITIES.map((c) => (
                <li key={c} className="text-sm text-foreground/85 flex items-start gap-2.5">
                  <span className="text-primary mt-1">▸</span>
                  <span className="leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-muted-foreground/80 leading-relaxed">
              Coaching and offers are contracted under Focus Flow AI LLC (DBA Coach Kay Elevates).
              Larger build work may include AI Task Force partners from the independent company founded by John Moyler.
              For institutional procurement,
              email{" "}
              <a href="mailto:hello@coachkayelevates.org" className="text-primary underline">
                hello@coachkayelevates.org
              </a>
              .
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* FAQ */}
      <section className="relative z-10 px-6 sm:px-10 pb-20 max-w-3xl mx-auto">
        <AnimatedSection className="text-center mb-6">
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


    </div>
  );
}