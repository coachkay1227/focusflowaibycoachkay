import type { BookAddon } from "@/lib/book-store";
import { formatUSD } from "@/lib/book-store";
import OfferCard from "@/components/offers/OfferCard";

interface Props {
  addon: BookAddon;
}

export function AddonCard({ addon }: Props) {
  const scrollToPackages = () => {
    if (typeof document === "undefined") return;
    document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <OfferCard
      eyebrow="Add-on"
      title={addon.name}
      tagline={addon.description}
      features={[]} 
      price={formatUSD(addon.priceCents)}
      primaryCta={{ label: "Add at checkout", onClick: scrollToPackages }}
    />
  );
}
