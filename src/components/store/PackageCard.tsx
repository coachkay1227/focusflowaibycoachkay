import { Check } from "lucide-react";
import type { BookPackage } from "@/lib/book-store";
import { formatUSD } from "@/lib/book-store";
import { Button } from "@/components/ui/button";

interface Props {
  pkg: BookPackage;
  onOrder: (slug: string) => void;
}

export function PackageCard({ pkg, onOrder }: Props) {
  return (
    <div className="group relative flex flex-col h-full rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_8px_30px_-10px_hsl(var(--primary)/0.4)]">
      <div className="mb-3">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.18em] font-medium border border-primary/40 text-primary/90">
          {pkg.turnaround}
        </span>
      </div>
      <h3 className="font-heading text-2xl text-foreground mb-1">{pkg.name}</h3>
      <div className="mb-5 mt-2">
        <span className="font-heading text-4xl text-primary">{formatUSD(pkg.priceCents)}</span>
      </div>
      <ul className="space-y-2.5 mb-6 flex-1">
        {pkg.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/85">
            <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" strokeWidth={1.75} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <Button
        onClick={() => onOrder(pkg.slug)}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
      >
        Order This Package
      </Button>
    </div>
  );
}
