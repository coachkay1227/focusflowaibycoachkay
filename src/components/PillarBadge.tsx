import { FOCUS_PILLARS, type FocusPillar } from "@/data/programs";

interface PillarBadgeProps {
  pillar: FocusPillar;
  /** "full" shows letter + name. "compact" shows the letter circle only. */
  variant?: "full" | "compact";
  className?: string;
}

/**
 * Single, reusable F.O.C.U.S. pillar badge. Pulls color + name from the
 * canonical `FOCUS_PILLARS` map so every surface stays in lock-step.
 */
export default function PillarBadge({ pillar, variant = "full", className = "" }: PillarBadgeProps) {
  const meta = FOCUS_PILLARS[pillar];
  const ring = (
    <span
      className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-semibold shrink-0"
      style={{ borderColor: meta.color, color: meta.color }}
      aria-hidden="true"
    >
      {pillar}
    </span>
  );

  if (variant === "compact") {
    return (
      <span className={`inline-flex items-center ${className}`} title={`${meta.full} pillar`}>
        {ring}
        <span className="sr-only">{meta.full} pillar</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {ring}
      <span
        className="font-mono-label tracking-[0.18em] text-[10px] uppercase whitespace-nowrap"
        style={{ color: meta.color }}
      >
        {meta.full} Pillar
      </span>
    </span>
  );
}