import { Link } from "react-router-dom";
import { ArrowRight, Mail, ExternalLink, Layers } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import NewsletterWaitlist from "@/components/NewsletterWaitlist";

/**
 * Premium, compliant site footer for Coach Kay Elevates.
 * 3-column structure mirroring the brand site's restraint.
 */
const SiteFooter = () => {
  const year = new Date().getFullYear();

  const cols: { title: string; links: { label: string; to: string; external?: boolean }[] }[] = [
    {
      title: "Explore",
      links: [
        { label: "Transformation Paths", to: "/modules" },
        { label: "Books & AI Kits", to: "/store" },
        { label: "The Truth About AI", to: "/truth" },
        { label: "Meet Coach Kay", to: "/coach-kay" },
      ],
    },
    {
      title: "Work With Coach Kay",
      links: [
        { label: "Coaching & Advisory", to: "/advisory" },
        { label: "AI Build Studio", to: "/build-studio" },
        { label: "Rent-an-Agent", to: "/rent-an-agent" },
         { label: "Cbus AI Task Force", to: "/ai-task-force" },
         { label: "Collective AI", to: "/collective" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", to: "/coach-kay" },
         { label: "Focus Flow Elevation Hub", to: "/community" },
        { label: "FAQ", to: "/faq" },
        { label: "Contact", to: "mailto:hello@coachkayelevates.org", external: true },
        { label: "Sitemap", to: "/sitemap" },
      ],
    },
  ];

  return (
    <footer className="relative z-10 border-t border-border/30 bg-navy-deep/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-14 pb-8">
        {/* Top: brand + CTA */}
        <div className="grid md:grid-cols-2 gap-8 pb-10 border-b border-border/30">
          <div className="max-w-md">
            <BrandLogo size="md" withTagline />
            <p className="text-muted-foreground text-sm mt-4 leading-relaxed">
              Master Certified Life Coach guiding clarity, focused transformation,
              and real momentum.
            </p>
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                 The Cbus AI Task Force is Coach Kay’s Columbus program.
                <br />
                 Larger builds supported by the{" "}
                 <Link to="/ai-task-force" className="text-primary hover:underline font-medium">
                    Request a seat at the table
                </Link>.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:items-end md:justify-center">
            <Link
              to="/clarity"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Start your free Clarity Check
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="https://coachkayelevates.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              Book a session with Coach Kay <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* 3 link columns */}
        {/* Ecosystem cross-links: three separate properties, one family */}
        <div className="border-t border-border/40 pt-8">
          <h3 className="font-mono text-[11px] text-primary/70 tracking-[0.18em] uppercase mb-4">
            The ecosystem
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border/60 p-4">
              <p className="text-sm font-medium text-foreground">Coach Kay Elevates</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                You are here. Paid AI builds, agents, and advisory.
              </p>
            </div>
            <a
              href="https://coachkayelevates.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-border/60 p-4 hover:border-primary/40 transition-colors"
            >
              <p className="text-sm font-medium text-foreground inline-flex items-center gap-1.5">
                Coach Kay Elevates <ExternalLink className="h-3 w-3 text-primary" />
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                The coaching home. Sessions, speaking, and the human work behind the tech.
              </p>
            </a>
            <Link
              to="/assessment"
              className="group rounded-xl border border-border/60 p-4 hover:border-primary/40 transition-colors"
            >
              <p className="text-sm font-medium text-foreground inline-flex items-center gap-1.5">
                The F.O.C.U.S. Diagnostic <ArrowRight className="h-3 w-3 text-primary" />
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                See where your foundation is strong and where you are carrying too much alone.
              </p>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-10">
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[11px] text-primary/70 tracking-[0.18em] uppercase mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((l) =>
                  l.external ? (
                    <li key={l.label}>
                      <a
                        href={l.to}
                        target={l.to.startsWith("http") ? "_blank" : undefined}
                        rel={l.to.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
                      >
                        {l.label.toLowerCase().includes("contact") && <Mail className="h-3 w-3" />}
                        {l.label}
                        {l.to.startsWith("http") && <ExternalLink className="h-3 w-3" />}
                      </a>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter waitlist */}
        <div className="py-8 border-t border-border/30">
          <NewsletterWaitlist
            source="footer"
            variant="card"
            heading="Coach Kay Elevates Newsletter, coming soon"
            subheading="Weekly clarity drops, AI plays, and Coach Kay's no-fluff field notes. Get on the waitlist."
          />
        </div>

        {/* Disclaimer */}
        <div className="border-t border-border/30 pt-6 space-y-4">
          <p className="text-[11px] text-muted-foreground max-w-3xl mx-auto text-center leading-relaxed">
            Coach Kay Elevates provides AI-powered coaching, education, and productivity tools, not a
            substitute for licensed medical, mental-health, legal, financial, or tax advice.
            AI-generated insights are for personal development only. Results vary.{" "}
            <Link to="/disclaimer" className="text-primary/70 hover:text-primary underline underline-offset-2">
              Full disclaimer
            </Link>.
          </p>

          {/* Legal row */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <span aria-hidden>·</span>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <span aria-hidden>·</span>
            <Link to="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link>
            <span aria-hidden>·</span>
            <Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-2 pt-2 text-[11px] text-muted-foreground">
            <p>© {year} Focus Flow AI LLC · DBA Coach Kay Elevates.</p>
            <a href="mailto:hello@coachkayelevates.org" className="hover:text-primary transition-colors">
              hello@coachkayelevates.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
