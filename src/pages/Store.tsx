import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Megaphone, Magnet, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryTabs } from "@/components/store/CategoryTabs";
import { PackageCard } from "@/components/store/PackageCard";
import { AddonCard } from "@/components/store/AddonCard";
import { IntakeFormModal } from "@/components/store/IntakeFormModal";
import { ADDONS, PACKAGES, type BookCategory } from "@/lib/book-store";

const ADDON_ICONS = [Megaphone, Magnet, PhoneCall];

export default function Store() {
  const [category, setCategory] = useState<BookCategory>("children");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const onOrder = (slug: string) => {
    setSelectedSlug(slug);
    setModalOpen(true);
  };

  const visiblePackages = PACKAGES.filter((p) => p.category === category);

  const scrollToPackages = () => {
    document
      .getElementById("packages")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Subtle grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header className="relative z-10 px-6 sm:px-10 pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </header>

      <section className="relative z-10 px-6 sm:px-10 pt-16 pb-20 max-w-5xl mx-auto text-center">
        <span className="inline-block text-[11px] tracking-[0.28em] uppercase text-primary font-medium mb-6">
          The Book Builder Blueprint
        </span>
        <h1 className="font-heading text-4xl sm:text-6xl leading-tight text-foreground mb-6">
          Turn Your Story Into a{" "}
          <span className="text-primary italic">Published Book</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          Done-for-you AI-powered book creation — children&apos;s books, coloring books,
          and authority non-fiction. Fast. Professional. Yours.
        </p>
        <Button
          onClick={scrollToPackages}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8"
        >
          View Packages
        </Button>
      </section>

      <section id="packages" className="relative z-10 px-6 sm:px-10 pb-20 max-w-7xl mx-auto">
        <CategoryTabs active={category} onChange={setCategory} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePackages.map((p) => (
            <PackageCard key={p.slug} pkg={p} onOrder={onOrder} />
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-[11px] tracking-[0.28em] uppercase text-primary font-medium mb-3">
            Optional Add-Ons
          </span>
          <h2 className="font-heading text-3xl text-foreground">
            Amplify Your Launch
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {ADDONS.map((a, i) => (
            <AddonCard key={a.slug} addon={a} Icon={ADDON_ICONS[i]} />
          ))}
        </div>
      </section>

      <IntakeFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultPackageSlug={selectedSlug}
      />
    </div>
  );
}
