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
const BrandLogo = ({
  size = "md",
  withTagline = false,
  className,
  to = "/",
}: BrandLogoProps) => {
  const textSizes = {
    sm: "text-base",
    md: "text-lg md:text-xl",
    lg: "text-2xl md:text-3xl",
  };
  const markSizes = {
    sm: "h-8 w-[4.4rem]",
    md: "h-9 w-20",
    lg: "h-12 w-[6.6rem]",
  };

  return (
    <Link
      to={to}
      aria-label="Coach Kay Elevates. Home"
      className={cn(
        "inline-flex items-center gap-2.5 font-heading font-light hover:opacity-90 transition-opacity",
        textSizes[size],
        className,
      )}
    >
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className={cn(
          "shrink-0 rounded-sm object-cover object-top",
          markSizes[size],
        )}
        loading="eager"
        decoding="async"
      />
      <span className="flex flex-col" aria-hidden="true">
        <span>
          <span className="text-foreground font-light">Coach Kay</span>
          <span className="text-primary ml-1 font-medium">Elevates</span>
        </span>
        {withTagline && (
          <span className="font-body text-xs tracking-wide text-muted-foreground">
            AI Transformation Coach
          </span>
        )}
      </span>
    </Link>
  );
};

export default BrandLogo;
