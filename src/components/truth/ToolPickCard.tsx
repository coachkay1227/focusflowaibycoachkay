import { ArrowUpRight, BadgeCheck } from "lucide-react";
import type { ToolPick } from "@/data/tool-picks";

interface ToolPickCardProps {
  tool: ToolPick;
}

export default function ToolPickCard({ tool }: ToolPickCardProps) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel={tool.affiliate ? "sponsored noopener noreferrer" : "noopener noreferrer"}
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
      <p className="text-[12px] text-muted-foreground leading-relaxed flex-1">{tool.why}</p>
      {tool.affiliate && (
        <div className="mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-primary/90">
          <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
          Affiliate link
        </div>
      )}
    </a>
  );
}