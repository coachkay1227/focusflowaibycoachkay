import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useRoles() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const checkRole = async () => {
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
        // 2. Check if tier is corporate
        const { data, error } = await supabase.rpc("get_user_tier", {
          _user_id: user.id,
        });
        if (!error && data === "corporate") {
          setIsAdmin(true);
          setLoading(false);
          return;
        }
        // 3. Fallback: known admin email (bootstrap access before DB role is assigned)
        const ADMIN_EMAILS = ["hello@coachkayelevates.org", "kizzy.alaoui@gmail.com"];
        setIsAdmin(ADMIN_EMAILS.includes(user.email ?? ""));
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user]);

  return { isAdmin, loading };
}
