import { FOCUS_PILLARS, type FocusPillar } from "@/data/programs";
import { Link } from "react-router-dom";

const ORDER: FocusPillar[] = ["F", "O", "C", "U", "S"];

interface PillarStripProps {
  className?: string;
  /** Optional heading shown above the strip. */
  caption?: string;
}

/**
 * Compact, recurring F.O.C.U.S. reinforcement bar. Drop it into the bottom
 * of marketing pages so users see the framework on every scroll.
 */
export default function PillarStrip({
  className = "",
  caption = "Every module, challenge, and session maps to one of five pillars.",
}: PillarStripProps) {
  return (
    <aside
      className={`mx-auto max-w-5xl rounded-lg border border-border bg-card/30 backdrop-blur-sm px-5 py-5 ${className}`}
      aria-label="F.O.C.U.S. framework"
    >
      <p className="font-mono-label tracking-[0.18em] text-[10px] uppercase text-muted-foreground/70 text-center mb-3">
        The F.O.C.U.S. Framework
      </p>
      <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
        {ORDER.map((p) => {
          const meta = FOCUS_PILLARS[p];
          return (
            <Link
              key={p}
              to="/#how-it-works"
              className="group inline-flex items-center gap-2 transition-opacity hover:opacity-100"
            >
              <span
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-semibold"
                style={{ borderColor: meta.color, color: meta.color }}
                aria-hidden="true"
              >
                {p}
              </span>
              <span
                className="text-xs font-medium tracking-wide whitespace-nowrap text-foreground/80 group-hover:text-foreground"
              >
                {meta.full}
              </span>
            </Link>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground/70 mt-3">{caption}</p>
    </aside>
  );
}