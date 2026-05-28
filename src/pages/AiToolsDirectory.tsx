import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, BadgeCheck, Filter, Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import MobileNav from "@/components/MobileNav";
import AnimatedSection from "@/components/AnimatedSection";
import { DIRECTORY_TOOLS, DIRECTORY_CATEGORIES, ctaUrl, type DirCategory } from "@/data/ai-tools-directory";
import { webPage, breadcrumb, SITE_URL } from "@/lib/seo-schema";

type Filter = "All" | DirCategory;

export default function AiToolsDirectory() {
  const [active, setActive] = useState<Filter>("All");

  const filtered = useMemo(
    () => (active === "All" ? DIRECTORY_TOOLS : DIRECTORY_TOOLS.filter((t) => t.category === active)),
    [active]
  );

  const jsonLd = [
    webPage("/ai-tools", "AI Tools Directory — Coach Kay's Working Stack", "CollectionPage"),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "AI Tools Directory", path: "/ai-tools" },
      ],
      "/ai-tools"
    ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${SITE_URL}/ai-tools#list`,
      name: "Coach Kay AI Tools Directory",
      numberOfItems: DIRECTORY_TOOLS.length,
      itemListElement: DIRECTORY_TOOLS.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        url: ctaUrl(t),
      })),
    },
  ];

  const filters: Filter[] = ["All", ...DIRECTORY_CATEGORIES];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <SEOHead
        title="AI Tools Directory — Coach Kay's Working Stack"
        description="63 vetted AI tools scored and reviewed by Coach Kay. The only AI tools directory curated by a Master Certified Coach — practical, honest, no affiliate fluff."
        path="/ai-tools"
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
      <section className="relative z-10 px-6 sm:px-10 pt-12 pb-8 max-w-5xl mx-auto text-center">
        <span className="font-mono-label text-primary tracking-[0.28em] text-xs">
          THE STACK · LIVING DIRECTORY
        </span>
        <h1
          className="font-heading text-4xl sm:text-6xl font-light leading-tight mt-6"
          style={{ textShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
        >
          The AI tools I actually use.
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Every tool here earns its keep in real client work. No affiliate dumping, no
          chase-the-shiny. If a tool stops working, it gets removed. Affiliate links are
          marked honestly. They don't change the price you pay.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground/80">
          <Sparkles className="h-3.5 w-3.5 text-primary/80" strokeWidth={1.5} />
          {DIRECTORY_TOOLS.length} tools across {DIRECTORY_CATEGORIES.length} categories
        </div>
      </section>

      {/* FILTERS */}
      <section className="relative z-10 px-6 sm:px-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <Filter className="h-3.5 w-3.5" strokeWidth={1.5} />
          Filter by category
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const isActive = f === active;
            return (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={
                  isActive
                    ? "rounded-full border border-primary/60 bg-primary/15 text-primary px-3.5 py-1.5 text-xs tracking-wide transition-all"
                    : "rounded-full border border-border/40 bg-card/30 text-muted-foreground hover:text-foreground hover:border-primary/30 px-3.5 py-1.5 text-xs tracking-wide transition-all"
                }
              >
                {f}
              </button>
            );
          })}
        </div>
      </section>

      {/* GRID */}
      <section className="relative z-10 px-6 sm:px-10 max-w-6xl mx-auto py-10">
        <AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((tool) => (
              <a
                key={tool.name}
                href={ctaUrl(tool)}
                target="_blank"
                rel={tool.affiliate_url ? "sponsored noopener noreferrer" : "noopener noreferrer"}
                className="group flex flex-col rounded-xl border border-border/40 bg-card/40 p-5 transition-all hover:border-primary/40 hover:bg-card/60 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-[10px] tracking-[0.18em] uppercase text-primary/80">
                    {tool.category}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-base font-medium text-foreground mb-1.5">{tool.name}</p>
                <p className="text-[12px] text-muted-foreground leading-relaxed flex-1">
                  {tool.blurb}
                </p>
                <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.16em]">
                  <span className="text-muted-foreground/80">{tool.pricing}</span>
                  {tool.affiliate_url ? (
                    <span className="inline-flex items-center gap-1.5 text-primary/90">
                      <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Affiliate
                    </span>
                  ) : tool.affiliate_pending ? (
                    <span className="inline-flex items-center gap-1.5 text-primary/70">
                      <Sparkles className="h-3 w-3" strokeWidth={1.75} />
                      Affiliate soon
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 text-[11px] text-foreground/70 group-hover:text-primary transition-colors inline-flex items-center gap-1">
                  Try it
                  <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
                </div>
              </a>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-12">
              No tools in this category yet. More coming.
            </p>
          )}
        </AnimatedSection>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 sm:px-10 max-w-3xl mx-auto pb-20 text-center">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-light mb-3">
            Want help wiring these together?
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
            Knowing the tools is one thing. Building the system that actually runs your business
            with them is the work. That's what the Audit and Build Studio are for.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/audit/landing"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
            >
              Run the AI Business Audit
            </Link>
            <Link
              to="/build-studio"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 text-foreground px-5 py-2.5 text-sm font-medium tracking-wide hover:border-primary/40 transition-colors"
            >
              Build Studio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}