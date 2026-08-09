import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  className?: string;
  to?: string;
}

/**
 * Single source of truth for the Coach Kay Elevates wordmark.
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
      aria-label="Coach Kay Elevates. Home"
      className={cn(
        "inline-flex items-baseline gap-2 font-heading font-light hover:opacity-90 transition-opacity",
        sizes[size],
        className,
      )}
    >
      <span aria-hidden="true">
        <span className="text-foreground font-light">Coach Kay</span>
        <span className="text-primary font-medium ml-1">Elevates</span>
      </span>
      {withTagline && (
        <span className="text-muted-foreground text-xs font-body tracking-wide">
          AI Transformation Coach
        </span>
      )}
    </Link>
  );
};

export default BrandLogo;