import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import FloatingOrbs from "@/components/FloatingOrbs";
import SEOHead from "@/components/SEOHead";

interface RetiredScreenProps {
  /** What the user thought they were opening (e.g. "Emotional Reset"). */
  legacyName: string;
  /** Where to send them (e.g. "/clarity"). */
  redirectTo: string;
  /** Human label for the destination (e.g. "Personal Clarity Check"). */
  redirectLabel: string;
  /** Optional one-line explanation (defaults to a generic message). */
  reason?: string;
  /** ms before auto-redirect. 0 disables auto-redirect. */
  delayMs?: number;
}

/**
 * Unified "has evolved" screen for retired public assessment / quiz URLs.
 * Tells the user what changed, then auto-redirects to the canonical flow.
 */
const RetiredScreen = ({
  legacyName,
  redirectTo,
  redirectLabel,
  reason,
  delayMs = 2500,
}: RetiredScreenProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!delayMs) return;
    const t = setTimeout(() => navigate(redirectTo, { replace: true }), delayMs);
    return () => clearTimeout(t);
  }, [delayMs, navigate, redirectTo]);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden grain-overlay flex items-center justify-center px-6">
      <SEOHead
        title={`${legacyName} has moved — FocusFlow AI`}
        description={`The ${legacyName} questionnaire has evolved and now lives inside ${redirectLabel}. You'll be redirected automatically.`}
        path={pathname}
        noIndex
        injectGlobalGraph={false}
      />
      <FloatingOrbs />
      <div className="relative z-10 max-w-md text-center">
        <span className="font-mono-label text-primary/70 tracking-[0.2em] text-xs">
          ASSESSMENT UPDATED
        </span>
        <h1
          className="font-heading text-3xl md:text-4xl font-light mt-3 mb-4 leading-tight"
          style={{ textShadow: "0 0 30px hsl(43 75% 52% / 0.15)" }}
        >
          {legacyName} has evolved
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-7">
          {reason ??
            `This questionnaire is no longer offered on its own. Its core ideas now live inside ${redirectLabel}.`}
        </p>
        <Button onClick={() => navigate(redirectTo, { replace: true })} className="gap-2">
          Continue to {redirectLabel} <ArrowRight className="h-4 w-4" />
        </Button>
        {delayMs > 0 && (
          <p className="mt-4 font-mono-label text-[10px] tracking-[0.15em] text-muted-foreground/60">
            REDIRECTING AUTOMATICALLY…
          </p>
        )}
      </div>
    </div>
  );
};

export default RetiredScreen;