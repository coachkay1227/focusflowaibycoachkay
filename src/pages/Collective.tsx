import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Layers, Users, ShieldCheck, Cog, Sparkles, ExternalLink } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import MobileNav from "@/components/MobileNav";
import { webPage, breadcrumb, SITE_URL, ORG_ID, PERSON_ID } from "@/lib/seo-schema";

const ROLES = [
  { icon: Cog, title: "Operations Architect", body: "Coach Kay. Scopes every build, owns the roadmap, signs the SOW." },
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
    q: "Is Collective AI a different company than Coach Kay Elevates?",
    a: "No. Coach Kay leads Focus Flow AI LLC (DBA Coach Kay Elevates). Collective AI is the delivery team that Coach Kay assembles and leads for builds that require more than solo capacity. You contract with Focus Flow AI LLC; the collective ships the work alongside Kay.",
  },
  {
    q: "When does the Collective get involved?",
    a: "1:1 coaching, programs, and our $47 audit are delivered solo by Coach Kay. Build Studio projects, Advisory retainers, and enterprise scopes are delivered with the Collective. Same point of contact, more horsepower.",
  },
  {
    q: "Who owns what we build?",
    a: "You do. Full source code, accounts, and content hand off to you on launch. The Collective never holds your assets hostage.",
  },
];

export default function Collective() {
  const jsonLd = [
    webPage("/collective", "Collective AI — The Team Behind Coach Kay's Builds", "AboutPage"),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Collective AI", path: "/collective" },
      ],
      "/collective"
    ),
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/collective#org`,
      name: "Collective AI",
      description:
        "A multidisciplinary AI delivery team led by Coach Kay (Kenza Alaoui). Operations, engineering, AI research, and design, assembled for builds that require more than solo capacity.",
      url: `${SITE_URL}/collective`,
      parentOrganization: { "@id": ORG_ID },
      founder: { "@id": PERSON_ID },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${SITE_URL}/collective#faq`,
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
        title="Collective AI — The Team Behind Coach Kay's Builds"
        description="Collective AI is the multidisciplinary delivery team Coach Kay leads for enterprise builds, automation, and AI systems. Solo coaching by Kay. Heavy lifts delivered with the collective."
        path="/collective"
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
          THE COLLECTIVE · DELIVERY TEAM
        </span>
        <h1
          className="font-heading text-4xl sm:text-6xl font-light leading-tight mt-6"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
        >
          Coach Kay isn't alone. <br />
          <span className="text-primary italic">She leads the Collective.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          For 1:1 coaching, you get Kay. For heavy builds, automations, and enterprise scopes,
          you get Kay <em>and</em> the Collective AI delivery team: engineering, AI research,
          design, and QA, assembled around your project.
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
            Book 1:1 with Kay <ExternalLink className="h-4 w-4" />
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
              As <strong className="text-foreground/85">Operations Architect & Lead Developer at Collective AI</strong>,
              she scopes and leads the team that ships the heavy builds: the dashboards,
              the automations, the enterprise systems. Same standards. More capacity.
              You're never trusting one person with a six-figure roadmap.
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
            Every Build Studio or Advisory engagement is staffed with the roles below. Coach Kay leads, scopes, and signs every SOW.
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
              What the Collective ships
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
              All work contracted under Focus Flow AI LLC (DBA Coach Kay Elevates).
              Delivered with the Collective AI team. For institutional procurement,
              email{" "}
              <a href="mailto:Hello@coachkayelevates.org" className="text-primary underline">
                Hello@coachkayelevates.org
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