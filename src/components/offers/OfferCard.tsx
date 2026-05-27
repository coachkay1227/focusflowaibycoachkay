import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface OfferCardCta {
  label: string;
  to?: string;
  onClick?: () => void;
  external?: boolean;
}

export interface OfferCardProps {
  eyebrow: string;
  badge?: string;
  title: string;
  tagline: string;
  features: string[];
  price?: string;
  priceSuffix?: string;
  primaryCta: OfferCardCta;
  secondaryCta?: OfferCardCta;
  variant?: "standard" | "featured" | "premium";
  footnote?: ReactNode;
}

/**
 * Sitewide locked-symmetry offer card.
 * Five vertical zones: eyebrow+badge / title / tagline / features (flex-1) / price + CTAs.
 * Always h-full so siblings in a grid match heights exactly.
 */
export default function OfferCard({
  eyebrow,
  badge,
  title,
  tagline,
  features,
  price,
  priceSuffix,
  primaryCta,
  secondaryCta,
  variant = "standard",
  footnote,
}: OfferCardProps) {
  const ring =
    variant === "featured"
      ? "border-primary/50 shadow-[0_0_40px_-12px_hsl(43_75%_52%/0.35)]"
      : variant === "premium"
      ? "border-primary/40 bg-gradient-to-b from-primary/[0.04] to-transparent"
      : "border-border/40";

  return (
    <article
      className={`group relative h-full flex flex-col rounded-2xl border ${ring} bg-card/40 backdrop-blur-sm p-7 transition-all hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-20px_hsl(43_75%_52%/0.25)]`}
    >
      {/* Zone 1 — eyebrow + badge */}
      <div className="flex items-start justify-between gap-3 mb-4 min-h-[20px]">
        <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-primary">
          {eyebrow}
        </span>
        {badge && (
          <Badge className="bg-primary/15 text-primary border-primary/30 text-[9px] tracking-wider uppercase">
            {badge}
          </Badge>
        )}
      </div>

      {/* Zone 2 — title (locked 2-line min height) */}
      <h3 className="font-heading text-2xl md:text-[1.6rem] font-light leading-[1.15] text-foreground mb-3 min-h-[3.6rem]">
        {title}
      </h3>

      {/* Zone 3 — tagline (locked 2-line min height) */}
      <p className="text-sm text-muted-foreground italic leading-relaxed mb-5 min-h-[2.6rem] line-clamp-2">
        {tagline}
      </p>

      <div className="h-px bg-border/40 mb-5" />

      {/* Zone 4 — features (stretches) */}
      <ul className="space-y-2.5 mb-6 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[13px] text-foreground/80 leading-relaxed">
            <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-1" strokeWidth={2.5} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* Zone 5a — price */}
      {price && (
        <div className="mb-5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-3xl font-light text-foreground">{price}</span>
            {priceSuffix && (
              <span className="text-xs text-muted-foreground tracking-wide">{priceSuffix}</span>
            )}
          </div>
        </div>
      )}

      {/* Zone 5b — CTAs always anchored to bottom */}
      <div className="flex flex-col gap-2 mt-auto">
        <CtaButton cta={primaryCta} kind="primary" />
        {secondaryCta && <CtaButton cta={secondaryCta} kind="ghost" />}
      </div>

      {footnote && <div className="mt-4 text-[11px] text-muted-foreground/70 text-center">{footnote}</div>}
    </article>
  );
}

function CtaButton({ cta, kind }: { cta: OfferCardCta; kind: "primary" | "ghost" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-[13px] font-medium tracking-wide transition-all";
  const styles =
    kind === "primary"
      ? `${base} bg-primary text-primary-foreground hover:bg-primary/90`
      : `${base} border border-primary/40 text-primary hover:bg-primary/10`;

  const content = (
    <>
      {cta.label}
      {kind === "primary" && <ArrowRight className="h-3.5 w-3.5" />}
    </>
  );

  if (cta.to) {
    if (cta.external) {
      return (
        <a href={cta.to} target="_blank" rel="noopener noreferrer" className={styles}>
          {content}
        </a>
      );
    }
    return (
      <Link to={cta.to} className={styles}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={cta.onClick} className={styles}>
      {content}
    </button>
  );
}