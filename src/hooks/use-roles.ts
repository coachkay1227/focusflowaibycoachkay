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
        // Check via has_role RPC first (proper RBAC)
        const { data: hasAdminRole, error: roleError } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        if (!roleError && hasAdminRole) {
          setIsAdmin(true);
          setLoading(false);
          return;
        }
        // Fallback: check if tier is corporate
        const { data, error } = await supabase.rpc("get_user_tier", {
          _user_id: user.id,
        });
        if (error) {
          setIsAdmin(false);
        } else {
          setIsAdmin(data === "corporate");
        }
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
