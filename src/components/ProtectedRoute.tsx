import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/use-roles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: rolesLoading } = useRoles();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      const returnTo = location.pathname + location.search;
      try { sessionStorage.setItem("auth:returnTo", returnTo); } catch { /* noop */ }
      navigate("/auth", { state: { from: returnTo } });
      return;
    }
    if (!rolesLoading && requireAdmin && !isAdmin) {
      navigate("/dashboard");
    }
  }, [user, authLoading, isAdmin, rolesLoading, requireAdmin, navigate, location]);

  if (authLoading || rolesLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!user || (requireAdmin && !isAdmin)) return null;

  return <>{children}</>;
}
