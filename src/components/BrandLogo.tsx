import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  className?: string;
  to?: string;
}

/**
 * Single source of truth for the FocusFlow AI wordmark.
 * Mirrors the Coach Kay Elevates brand pattern: serif wordmark with gold accent.
 */
const BrandLogo = ({ size = "md", withTagline = false, className, to = "/" }: BrandLogoProps) => {
  const sizes = {
    sm: "text-base",
    md: "text-lg md:text-xl",
    lg: "text-2xl md:text-3xl",
  };

  return (
    <Link
      to={to}
      aria-label="FocusFlow AI by Coach Kay — Home"
      className={cn(
        "inline-flex items-baseline gap-2 font-heading font-light hover:opacity-90 transition-opacity",
        sizes[size],
        className,
      )}
    >
      <span aria-hidden="true">
        <span className="text-primary font-medium">Focus</span>
        <span className="text-foreground font-light">Flow</span>
        <span className="text-primary font-medium ml-1">AI</span>
      </span>
      {withTagline && (
        <span className="text-muted-foreground/60 text-xs font-body tracking-wide">
          by Coach Kay
        </span>
      )}
    </Link>
  );
};

export default BrandLogo;