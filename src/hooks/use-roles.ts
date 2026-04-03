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
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        if (error) {
          console.error("Role check error:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
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
