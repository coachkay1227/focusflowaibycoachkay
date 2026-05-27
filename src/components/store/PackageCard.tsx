import type { BookPackage } from "@/lib/book-store";
import { formatUSD } from "@/lib/book-store";
import OfferCard from "@/components/offers/OfferCard";

interface Props {
  pkg: BookPackage;
  onOrder: (slug: string) => void;
}

export function PackageCard({ pkg, onOrder }: Props) {
  const isInquiry = pkg.inquiryOnly || pkg.priceCents === 0;
  return (
    <OfferCard
      eyebrow={pkg.turnaround}
      title={pkg.name}
      tagline={pkg.audience ?? ""}
      features={pkg.bullets}
      price={isInquiry ? "Custom" : formatUSD(pkg.priceCents)}
      primaryCta={{
        label: isInquiry ? "Request a Quote" : "Order This Package",
        onClick: () => onOrder(pkg.slug),
      }}
    />
  );
}
