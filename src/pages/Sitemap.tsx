import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import FloatingOrbs from "@/components/FloatingOrbs";
import { ArrowLeft } from "lucide-react";
import { getPublicPrograms, getBackendPrograms, PUBLIC_PATHS, type PublicPath } from "@/data/programs";

const freeToolLinks = [
  { path: "/clarity", label: "Clarity Session — 1-question AI insight in 90 seconds" },
  { path: "/starter-kit", label: "AI Starter Kit — your free first step" },
  { path: "/assessment", label: "Free Assessment — find your AI readiness score" },
  { path: "/challenges", label: "30-Day Challenges — daily prompts to build the habit" },
  { path: "/ai-tools", label: "AI Tools Directory — 63 vetted tools, scored & reviewed" },
  { path: "/pause-hub", label: "Pause Hub: Scam Watch — live AI scam & threat alerts" },
  { path: "/community", label: "FocusFlow Elevation Hub — free Skool community" },
];

const serviceLinks = [
  { path: "/audit/landing", label: "AI Business Audit ($47) — 8-section diagnosis in 24 hours" },
  { path: "/modules", label: "Transformation Paths — personal, business & AI programs" },
  { path: "/store", label: "Books & AI Kits — self-paced tools, templates & guides" },
  { path: "/rent-an-agent", label: "Rent-an-Agent — done-with-you AI agents on your stack" },
  { path: "/build-studio", label: "AI Build Studio — custom AI built end-to-end" },
  { path: "/advisory", label: "Advisory & Partnership — fractional AI strategy for leaders" },
  { path: "/autism-social-stories", label: "Autism Social Stories — AI-personalized stories for families" },
];

const companyLinks = [
  { path: "/coach-kay", label: "Meet Coach Kay" },
  { path: "/collective", label: "Collective AI — the team behind every build" },
  { path: "/truth", label: "The Truth About AI — no hype, no fear" },
  { path: "/faq", label: "FAQ — every question answered" },
  { path: "/auth", label: "Sign In / Sign Up" },
  { path: "/dashboard", label: "Dashboard (authenticated)" },
];

const legalLinks = [
  { path: "/privacy", label: "Privacy Policy" },
  { path: "/terms", label: "Terms of Service" },
  { path: "/disclaimer", label: "Coaching, Wellness & Earnings Disclaimer" },
  { path: "/refund-policy", label: "Refund & Cancellation Policy" },
];

const paths: PublicPath[] = ["personal", "business", "ai"];

const Sitemap = () => (
  <div className="relative min-h-dvh overflow-hidden grain-overlay">
    <FloatingOrbs />
    <SEOHead
      noIndex
      title="Sitemap — FocusFlow AI"
      description="Browse all pages and programs on FocusFlow AI, your clarity coaching platform by Coach Kay."
      path="/sitemap"
    />
    <div className="relative z-10 px-6 md:px-12 py-6">
      <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>
    </div>
    <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl font-light mb-2">Sitemap</h1>
      <p className="text-sm text-muted-foreground mb-10">FocusFlow AI by Coach Kay · coachkayai.life · Columbus, OH</p>

      <section className="mb-10">
        <h2 className="font-heading text-xl font-light mb-4 text-primary">Free Tools & Entry Points</h2>
        <ul className="space-y-2">
          {freeToolLinks.map((l) => (
            <li key={l.path}>
              <Link to={l.path} className="text-foreground/80 hover:text-primary hover:underline transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="font-heading text-xl font-light mb-4 text-primary">Offers & Services</h2>
        <ul className="space-y-2">
          {serviceLinks.map((l) => (
            <li key={l.path}>
              <Link to={l.path} className="text-foreground/80 hover:text-primary hover:underline transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {paths.map((p) => {
        const meta = PUBLIC_PATHS[p];
        const pathPrograms = getPublicPrograms().filter((prog) => prog.path === p || prog.path === "shared");
        return (
          <section key={p} className="mb-10">
            <h2 className="font-heading text-xl font-light mb-4 text-primary">
              {meta.label} Path ({pathPrograms.length})
            </h2>
            <ul className="space-y-2">
              {pathPrograms.map((prog) => (
                <li key={prog.id}>
                  <Link
                    to={`/programs/${prog.slug}`}
                    className="text-foreground/80 hover:text-primary hover:underline transition-colors"
                  >
                    {prog.title}
                  </Link>
                  <span className="text-xs text-muted-foreground ml-2">
                    {prog.durationLabel} · {prog.priceDisplay}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mb-10">
        <h2 className="font-heading text-xl font-light mb-4 text-muted-foreground">
          Backend Curriculum ({getBackendPrograms().length})
        </h2>
        <p className="text-xs text-muted-foreground/70">
          Backend modules are available inside the dashboard for enrolled clients.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="font-heading text-xl font-light mb-4 text-primary">Company & About</h2>
        <ul className="space-y-2">
          {companyLinks.map((l) => (
            <li key={l.path}>
              <Link to={l.path} className="text-foreground/80 hover:text-primary hover:underline transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="font-heading text-xl font-light mb-4 text-primary">Legal</h2>
        <ul className="space-y-2">
          {legalLinks.map((l) => (
            <li key={l.path}>
              <Link to={l.path} className="text-foreground/80 hover:text-primary hover:underline transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-[11px] text-muted-foreground/50 border-t border-border/30 pt-6">
        Focus Flow AI LLC · DBA Coach Kay Elevates · Columbus, OH · hello@coachkayelevates.org
      </p>
    </div>
  </div>
);

export default Sitemap;
