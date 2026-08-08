import { Link } from "react-router-dom";
import { ArrowRight, Compass, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBuyerOnboarding } from "@/hooks/use-buyer-onboarding";

/**
 * Dashboard nudge toward the `/start` onboarding flow.
 *
 * Renders only for someone who has bought something and has not finished or
 * dismissed the flow yet. Dismissing writes the same completion stamp the flow
 * itself writes, so the nudge never comes back.
 */
export const BuyerStartCard = () => {
  const { loading, audit, purchase, completed, markCompleted } = useBuyerOnboarding();

  if (loading || completed || (!audit && !purchase)) return null;

  return (
    <div className="relative rounded-lg border border-primary/40 bg-card/50 p-6">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => void markCompleted()}
        className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <Compass className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div>
          <h2 className="font-heading text-xl text-foreground mb-2">Start here</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xl">
            {audit
              ? "Two minutes: your results, the one offer that fits you next, and a single step to take."
              : "Two minutes: what you have access to, what happens next, and a single step to take."}
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/start">
              Show me my next step <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};