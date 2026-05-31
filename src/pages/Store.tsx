import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Zap,
  HeartHandshake,
  Award,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryTabs } from "@/components/store/CategoryTabs";
import { PackageCard } from "@/components/store/PackageCard";
import { AddonCard } from "@/components/store/AddonCard";
import { IntakeFormModal } from "@/components/store/IntakeFormModal";
import MobileNav from "@/components/MobileNav";
import {
  ADDONS,
  CATEGORY_LABELS,
  PACKAGES,
  type BookCategory,
} from "@/lib/book-store";
import SEOHead from "@/components/SEOHead";
import { webPage, breadcrumb, SITE_URL } from "@/lib/seo-schema";
import FAQSection from "@/components/FAQSection";
import { getFaqLane, faqPageSchema } from "@/data/faqs";
import { trackEvent } from "@/lib/analytics";
import { getSymmetricGridClass } from "@/lib/grid";

const WHY_WINS = [
  {
    icon: HeartHandshake,
    title: "Emotional & Commercial Utility",
    body: "Deeply meaningful products that also serve a clear practical or business purpose.",
  },
  {
    icon: Zap,
    title: "AI-Enhanced Speed",
    body: "Rapid AI ideation without sacrificing the bespoke, high-touch quality of a premium studio.",
  },
  {
    icon: Sparkles,
    title: "Underserved Niches",
    body: "Specialized representation for neurodivergent children, families, and educators.",
  },
  {
    icon: Award,
    title: "Authority Value",
    body: "Turns vague expertise into a tangible, polished asset that opens doors.",
  },
  {
    icon: Layers,
    title: "Multi-Platform Outputs",
    body: "Formatted on delivery for Amazon KDP, Etsy, private distribution, or digital release.",
  },
];

const BUYERS: { type: string; why: string }[] = [
  {
    type: "Families & Gift Buyers",
    why: "Seeking deeply personalized, heirloom-quality storytelling that captures memories and celebrates loved ones.",
  },
  {
    type: "Autism Parents / Caregivers",
    why: "Practical, affirming, visually engaging tools that help children navigate daily life with less anxiety.",
  },
  {
    type: "Educators & Therapists",
    why: "Scalable, custom-branded intervention resources that support their practice and students.",
  },
  {
    type: "Founders & Experts",
    why: "Methodologies turned into tangible books and companion assets that drive leads and validate authority.",
  },
  {
    type: "Creators & Sellers",
    why: "Done-for-you creative assets and themed bundles they can monetize without starting from scratch.",
  },
];

export default function Store() {
  const [category, setCategory] = useState<BookCategory>("storybooks");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const navigate = useNavigate();

  const onOrder = (slug: string) => {
    const pkg = PACKAGES.find((p) => p.slug === slug);
    trackEvent(
      "studio_intake_open",
      { slug, inquiry: !!pkg?.inquiryOnly },
      pkg?.category ?? null
    );
    setSelectedSlug(slug);
    setModalOpen(true);
  };

  useEffect(() => {
    trackEvent("studio_lane_view", { lane: category }, category);
  }, [category]);

  const visiblePackages = PACKAGES.filter((p) => p.category === category);

  const scrollToPackages = () => {
    document
      .getElementById("packages")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SEOHead
        title="Story, Legacy & Publishing Studio | FocusFlow AI"
        description="Turn stories, expertise, and lived experience into powerful assets. Storybooks, legacy memoirs, expert books, creator bundles, and autism social stories — done-for-you with AI-enhanced speed."
        path="/store"
        keywords={[
          "done for you book creation",
          "legacy memoir writing service",
          "authority book publishing studio",
          "autism social stories custom books",
          "AI enhanced publishing studio",
          "FocusFlow story studio",
        ]}
        jsonLd={[
          webPage(
            "/store",
            "Story, Legacy & Publishing Studio",
            "CollectionPage"
          ),
          breadcrumb(
            [
              { name: "Home", path: "/" },
              { name: "Studio", path: "/store" },
            ],
            "/store"
          ),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Story, Legacy & Publishing Studio Packages",
            itemListElement: PACKAGES.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Product",
                name: p.name,
                description: p.audience ?? p.bullets[0] ?? p.name,
                category: CATEGORY_LABELS[p.category],
                url: `https://coachkayai.life/store#${p.slug}`,
              },
            })),
          },
          faqPageSchema(
            getFaqLane("studio")?.items ?? [],
            `${SITE_URL}/store#faq`
          ),
        ]}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header className="relative z-10 px-6 sm:px-10 pt-8 flex items-center justify-between md:justify-start">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
        <div className="md:hidden ml-auto">
          <MobileNav />
        </div>
      </header>

      <section className="relative z-10 px-6 sm:px-10 pt-16 pb-12 max-w-5xl mx-auto text-center">
        <span className="inline-block text-[11px] tracking-[0.28em] uppercase text-primary font-medium mb-6">
          Story, Legacy &amp; Publishing Studio
        </span>
        <h1 className="font-heading text-4xl sm:text-6xl leading-tight text-foreground mb-6">
          Turn Stories, Expertise &amp;{" "}
          <span className="text-primary italic">Lived Experience</span>{" "}
          Into Powerful Assets.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
          Five premium publishing lanes — storybooks, legacy memoirs, expert
          authority books, creator bundles, and autism &amp; social stories.
          AI-enhanced ideation, high-touch execution, platform-ready delivery.
        </p>
        <Button
          onClick={scrollToPackages}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8"
        >
          Explore the Lanes
        </Button>
      </section>

      <section className="relative z-10 px-6 sm:px-10 pb-16 max-w-4xl mx-auto">
        <div className="rounded-lg border border-border/60 bg-card/40 backdrop-blur-sm p-8 sm:p-10 text-center">
          <span className="inline-block text-[11px] tracking-[0.28em] uppercase text-primary font-medium mb-4">
            Studio Positioning
          </span>
          <p className="text-base sm:text-lg text-foreground/85 leading-relaxed">
            This is not a generic bookstore. It is a premium story, legacy,
            authority, and publishing studio that combines rapid AI ideation
            with high-touch execution. Clients don&apos;t just buy books — they
            invest in deeply resonant gifts, strategic brand assets, and
            educational tools engineered for real-world impact.
          </p>
        </div>
      </section>

      <section
        id="packages"
        className="relative z-10 px-6 sm:px-10 pb-20 max-w-7xl mx-auto"
      >
        <div className="text-center mb-8">
          <span className="inline-block text-[11px] tracking-[0.28em] uppercase text-primary font-medium mb-3">
            Signature Package Stack
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl text-foreground">
            Choose Your Lane
          </h2>
        </div>
        <CategoryTabs
          active={category}
          onChange={(c) => {
            if (c === "autism") {
              navigate("/autism-social-stories");
              return;
            }
            setCategory(c);
          }}
        />
        <div className={`${getSymmetricGridClass(visiblePackages.length)} gap-6 items-stretch`}>
          {visiblePackages.map((p) => (
            <PackageCard key={p.slug} pkg={p} onOrder={onOrder} />
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-[11px] tracking-[0.28em] uppercase text-primary font-medium mb-3">
            Add-Ons &amp; Upsells
          </span>
          <h2 className="font-heading text-3xl text-foreground">
            Amplify Your Launch
          </h2>
        </div>
        <div className={`${getSymmetricGridClass(ADDONS.length)} gap-5 items-stretch`}>
          {ADDONS.map((a) => (
            <AddonCard key={a.slug} addon={a} />
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-[11px] tracking-[0.28em] uppercase text-primary font-medium mb-3">
            Why This Studio Wins
          </span>
          <h2 className="font-heading text-3xl text-foreground">
            Built for resonance and ROI.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_WINS.map((w) => (
            <div
              key={w.title}
              className="rounded-lg border border-border/60 bg-card/40 backdrop-blur-sm p-6"
            >
              <w.icon className="h-5 w-5 text-primary mb-3" strokeWidth={1.5} />
              <h3 className="font-heading text-lg text-foreground mb-1.5">
                {w.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {w.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-[11px] tracking-[0.28em] uppercase text-primary font-medium mb-3">
            Best-Fit Buyers
          </span>
          <h2 className="font-heading text-3xl text-foreground">
            Who this is for.
          </h2>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden">
          {BUYERS.map((b, i) => (
            <div
              key={b.type}
              className={`grid sm:grid-cols-[1fr_2fr] gap-4 px-6 py-5 ${
                i !== BUYERS.length - 1 ? "border-b border-border/40" : ""
              }`}
            >
              <div className="font-heading text-foreground">{b.type}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {b.why}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-4xl mx-auto">
        <div className="rounded-lg border border-primary/30 bg-primary/5 backdrop-blur-sm p-8 sm:p-10 text-center">
          <span className="inline-block text-[11px] tracking-[0.28em] uppercase text-primary font-medium mb-4">
            Delivery &amp; Platform Logic
          </span>
          <p className="text-base sm:text-lg text-foreground/85 leading-relaxed">
            Whether the goal is a private physical keepsake, a commercial Amazon
            KDP listing, an Etsy bundle, or a strategic lead magnet — every
            studio asset is delivered in platform-ready formats optimized for
            its final destination.
          </p>
        </div>
      </section>

      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-3xl mx-auto text-center">
        <h2 className="font-heading text-3xl sm:text-4xl text-foreground mb-4">
          Choose a storybook, legacy package, expert book,
          <br className="hidden sm:inline" /> or custom social story path today.
        </h2>
        <Button
          onClick={scrollToPackages}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 mt-4"
        >
          Start with {CATEGORY_LABELS[category]}
        </Button>
      </section>

      <FAQSection
        eyebrow="Story, Legacy & Publishing Studio"
        items={getFaqLane("studio")?.items ?? []}
      />

      <IntakeFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultPackageSlug={selectedSlug}
      />
    </div>
  );
}