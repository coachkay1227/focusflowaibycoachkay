import type { LucideIcon } from "lucide-react";
import type { BookAddon } from "@/lib/book-store";
import { formatUSD } from "@/lib/book-store";

interface Props {
  addon: BookAddon;
  Icon: LucideIcon;
}

export function AddonCard({ addon, Icon }: Props) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-5 transition-all hover:border-primary/40">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-md border border-primary/40 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-heading text-lg text-foreground leading-tight">{addon.name}</h4>
        </div>
        <span className="font-heading text-xl text-primary">{formatUSD(addon.priceCents)}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{addon.description}</p>
    </div>
  );
}
