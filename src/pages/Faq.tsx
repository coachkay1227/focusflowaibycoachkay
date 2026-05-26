import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import SiteFooter from "@/components/SiteFooter";
import MobileNav from "@/components/MobileNav";
import { FAQ_LANES, faqPageSchema } from "@/data/faqs";
import { breadcrumb, webPage, SITE_URL } from "@/lib/seo-schema";

/**
 * Master FAQ index — one section per lane, each with its own
 * FAQPage JSON-LD block (Google supports multiple FAQPage entities
 * on a single URL when they describe distinct topical groupings).
 */
const Faq = () => {
  const jsonLd = [
    webPage("/faq", "Frequently Asked Questions", "CollectionPage"),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "FAQ", path: "/faq" },
      ],
      "/faq",
    ),
    ...FAQ_LANES.map((lane) =>
      faqPageSchema(lane.items, `${SITE_URL}/faq#${lane.key}`),
    ),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="FAQ — Coaching, AI Agents, Advisory & Studio | FocusFlow AI"
        description="Answers about Coach Kay's clarity coaching, Rent-an-Agent subscriptions, advisory engagements, AI Business Audit, autism social stories, and the publishing studio."
        path="/faq"
        jsonLd={jsonLd}
      />

      <header className="relative z-10 px-6 sm:px-10 pt-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div
          className="font-heading text-lg font-light"
          role="img"
          aria-label="FocusFlow AI"
        >
          <span aria-hidden="true" className="text-primary font-medium">
            Focus
          </span>
          <span aria-hidden="true" className="text-foreground font-light">
            Flow AI
          </span>
        </div>
        <MobileNav />
      </header>

      <section className="px-6 pt-16 pb-10 max-w-3xl mx-auto text-center">
        <p className="font-mono-label text-primary/80 tracking-[0.28em] text-xs uppercase mb-4">
          FAQ
        </p>
        <h1 className="font-heading text-5xl sm:text-6xl text-foreground leading-tight">
          Frequently asked questions
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Answers grouped by lane — coaching, AI agents, advisory, audit,
          autism &amp; social stories, and the publishing studio. Click any
          lane below to jump.
        </p>

        <nav
          aria-label="FAQ lanes"
          className="mt-10 flex flex-wrap gap-2 justify-center"
        >
          {FAQ_LANES.map((lane) => (
            <a
              key={lane.key}
              href={`#lane-${lane.key}`}
              className="text-xs uppercase tracking-[0.18em] font-mono-label rounded-full border border-border/60 hover:border-primary/40 hover:text-primary px-4 py-2 text-muted-foreground transition-colors"
            >
              {lane.label}
            </a>
          ))}
        </nav>
      </section>

      {FAQ_LANES.map((lane) => (
        <div
          key={lane.key}
          id={`lane-${lane.key}`}
          className="scroll-mt-24 border-t border-border/30"
        >
          <FAQSection
            id={`faq-${lane.key}`}
            eyebrow={lane.label}
            title={lane.label}
            items={lane.items}
          />
          <div className="px-6 pb-10 max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground italic mb-4">
              {lane.blurb}
            </p>
            <Link
              to={lane.path}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Explore {lane.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ))}

      <section className="px-6 py-16 max-w-3xl mx-auto text-center border-t border-border/30">
        <h2 className="font-heading text-2xl sm:text-3xl text-foreground">
          Still have a question?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Email{" "}
          <a
            href="mailto:hello@coachkayelevates.org"
            className="text-primary hover:underline"
          >
            hello@coachkayelevates.org
          </a>{" "}
          or{" "}
          <Link to="/coach" className="text-primary hover:underline">
            ask Coach Kay directly
          </Link>
          .
        </p>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Faq;