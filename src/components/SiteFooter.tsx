import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";

/**
 * Premium, compliant site footer for FocusFlow AI by Coach Kay.
 * Single source of truth — used on Index and (future) marketing pages.
 * Brand: deep navy / gold / cream. Cormorant headings, DM Sans body.
 */
const SiteFooter = () => {
  const year = new Date().getFullYear();

  const cols: { title: string; links: { label: string; to: string; external?: boolean }[] }[] = [
    {
      title: "Explore",
      links: [
        { label: "Clarity Session", to: "/clarity" },
        { label: "Modules", to: "/modules" },
        { label: "Challenges", to: "/challenges" },
        { label: "AI Coach", to: "/coach" },
        { label: "Starter Kit", to: "/starter-kit" },
      ],
    },
    {
      title: "Programs",
      links: [
        { label: "30-Day Personal Reset", to: "/modules" },
        { label: "90-Day Transformation", to: "/modules" },
        { label: "Full AI 90-Day", to: "/modules" },
        { label: "Rent-an-Agent", to: "/rent-an-agent" },
        { label: "Advisory & Partnership", to: "/advisory" },
        { label: "Autism & Social Stories", to: "/autism-social-stories" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "About Coach Kay", to: "/coach-kay" },
        { label: "Community", to: "/community" },
        { label: "Sitemap", to: "/sitemap" },
        { label: "Contact", to: "mailto:hello@coachkayelevates.org", external: true },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms of Service", to: "/terms" },
        { label: "Coaching Disclaimer", to: "/disclaimer" },
        { label: "Refund Policy", to: "/refund-policy" },
      ],
    },
  ];

  return (
    <footer className="relative z-10 border-t border-border/30 bg-background/60 backdrop-blur-sm">
      {/* Top: brand + CTA */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-14 pb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-10 border-b border-border/30">
          <div className="max-w-md">
            <div className="font-heading text-2xl font-light" role="img" aria-label="FocusFlow AI">
              <span className="text-primary font-medium">Focus</span>
              <span className="text-foreground font-light">Flow AI</span>
              <span className="text-muted-foreground/50 text-sm ml-2">by Coach Kay</span>
            </div>
            <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
              Master Certified Life Coach guiding women and high-performers through honest clarity,
              focused transformation, and AI-powered momentum.
            </p>
          </div>
          <Link
            to="/clarity"
            className="group inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-5 py-3 text-sm text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Start your free Clarity Check
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono-label text-primary/70 tracking-[0.18em] text-xs mb-4">
                {col.title.toUpperCase()}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((l) =>
                  l.external ? (
                    <li key={l.label}>
                      <a
                        href={l.to}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
                      >
                        {l.label.toLowerCase().includes("contact") && <Mail className="h-3 w-3" />}
                        {l.label}
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

        {/* Trust + disclaimer band */}
        <div className="border-t border-border/30 pt-8 pb-2 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-mono-label tracking-[0.15em] text-muted-foreground/60 uppercase">
            <span>Master Certified Life Coach</span>
            <span aria-hidden>·</span>
            <span>Stripe Secure Checkout</span>
            <span aria-hidden>·</span>
            <span>Coaching ≠ Therapy</span>
            <span aria-hidden>·</span>
            <span>Results Vary</span>
          </div>

          <p className="text-xs text-muted-foreground/50 max-w-3xl mx-auto text-center leading-relaxed">
            FocusFlow AI provides coaching, education, and AI-powered productivity tools. We are{" "}
            <strong className="text-muted-foreground/70">not</strong> a substitute for licensed
            medical, mental-health, legal, financial, or tax advice. Income, business, and
            transformation outcomes vary and depend on your effort, market conditions, and many
            factors outside our control. See our{" "}
            <Link to="/disclaimer" className="text-primary/70 hover:text-primary underline underline-offset-2">
              full disclaimer
            </Link>
            .
          </p>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4 text-xs text-muted-foreground/50">
            <p>© {year} FocusFlow Elevation · Shield Her Elevation LLC. All rights reserved.</p>
            <p>
              Built with care by Coach Kay Elevates ·{" "}
              <a href="mailto:hello@coachkayelevates.org" className="hover:text-primary transition-colors">
                hello@coachkayelevates.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;