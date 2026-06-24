import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useRoles() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish hydrating before deciding anything.
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const checkRole = async () => {
      setLoading(true);
      try {
        // 1. Check via has_role RPC (proper RBAC)
        const { data: hasAdminRole, error: roleError } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        if (!roleError && hasAdminRole) {
          setIsAdmin(true);
          setLoading(false);
          return;
        }
        // 2. Fallback: known admin email (bootstrap access before DB role is assigned)
        const ADMIN_EMAILS = ["hello@coachkayelevates.org", "kizzy.alaoui@gmail.com"];
        setIsAdmin(ADMIN_EMAILS.includes(user.email ?? ""));
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user, authLoading]);

  return { isAdmin, loading };
}
