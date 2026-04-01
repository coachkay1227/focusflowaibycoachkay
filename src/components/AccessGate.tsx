import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessLevel, type AccessTier } from "@/hooks/use-access-level";
import { Lock } from "lucide-react";

const TIER_RANK: Record<AccessTier, number> = {
  free: 0,
  subscriber: 1,
  cohort: 2,
  premium: 3,
  corporate: 4,
};

const TIER_LABELS: Record<AccessTier, string> = {
  free: "Free",
  subscriber: "Subscriber",
  cohort: "Cohort Member",
  premium: "Premium",
  corporate: "Corporate",
};

interface AccessGateProps {
  requiredTier: AccessTier;
  children: ReactNode;
  /** Shown instead of children when locked */
  fallback?: ReactNode;
}

export default function AccessGate({ requiredTier, children, fallback }: AccessGateProps) {
  const { user } = useAuth();
  const { tier } = useAccessLevel();
  const navigate = useNavigate();

  if (requiredTier === "free") return <>{children}</>;

  const hasAccess = user && TIER_RANK[tier] >= TIER_RANK[requiredTier];

  if (hasAccess) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="relative rounded-lg border border-border bg-card/20 backdrop-blur-sm overflow-hidden">
      {/* Blurred preview of children */}
      <div className="pointer-events-none select-none blur-[6px] opacity-40" aria-hidden>
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm">
        <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center">
          <Lock className="h-4 w-4 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {TIER_LABELS[requiredTier]} Access
        </p>
        <p className="text-xs text-muted-foreground max-w-[200px] text-center">
          {user
            ? "Upgrade your plan to unlock this content."
            : "Sign in to access this content."}
        </p>
        <button
          onClick={() => navigate(user ? "/modules" : "/auth")}
          className="mt-1 px-4 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {user ? "View Plans" : "Sign In"}
        </button>
      </div>
    </div>
  );
}
