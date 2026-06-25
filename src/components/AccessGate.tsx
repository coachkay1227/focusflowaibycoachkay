import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessLevel, type AccessTier } from "@/hooks/use-access-level";
import { useRoles } from "@/hooks/use-roles";
import { useAdminView } from "@/contexts/AdminViewContext";
import { TIER_RANK, TIER_LABELS } from "@/lib/tier-constants";
import { Lock, Eye, EyeOff } from "lucide-react";

interface AccessGateProps {
  requiredTier: AccessTier;
  children: ReactNode;
  /** Shown instead of children when locked */
  fallback?: ReactNode;
}

export default function AccessGate({ requiredTier, children, fallback }: AccessGateProps) {
  const { user } = useAuth();
  const { tier } = useAccessLevel();
  const { isAdmin } = useRoles();
  const { userView, toggleView } = useAdminView();
  const navigate = useNavigate();

  if (requiredTier === "free") return <>{children}</>;

  // Admin bypass (unless viewing as user)
  const adminBypass = isAdmin && !userView;
  const hasAccess = adminBypass || (user && TIER_RANK[tier] >= TIER_RANK[requiredTier]);

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
          onClick={() => navigate(user ? "/modules#plans" : "/auth")}
          className="mt-1 px-4 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {user ? "View Plans" : "Sign In"}
        </button>
      </div>
    </div>
  );
}

/** Floating toggle for admins to switch between admin/user view */
export function AdminViewToggle() {
  const { isAdmin } = useRoles();
  const { userView, toggleView } = useAdminView();

  if (!isAdmin) return null;

  return (
    <button
      onClick={toggleView}
      className="fixed bottom-20 right-4 sm:right-6 z-50 flex items-center gap-2 h-10 w-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 justify-center rounded-full border border-primary/30 bg-card/90 backdrop-blur-md shadow-lg text-xs font-medium text-foreground hover:bg-primary/10 transition-colors"
      title={userView ? "Switch to Admin View" : "Switch to User View"}
      aria-label={userView ? "Switch to Admin View" : "Switch to User View"}
    >
      {userView ? (
        <>
          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">User View</span>
        </>
      ) : (
        <>
          <Eye className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">Admin View</span>
        </>
      )}
    </button>
  );
}
