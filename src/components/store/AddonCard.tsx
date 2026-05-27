import type { LucideIcon } from "lucide-react";
import type { BookAddon } from "@/lib/book-store";
import { formatUSD } from "@/lib/book-store";
import OfferCard from "@/components/offers/OfferCard";

interface Props {
  addon: BookAddon;
  Icon: LucideIcon;
}

export function AddonCard({ addon, Icon: _Icon }: Props) {
  return (
    <OfferCard
      density="compact"
      eyebrow="Add-on"
      title={addon.name}
      tagline={addon.description}
      features={[]}
      price={formatUSD(addon.priceCents)}
    />
  );
}
