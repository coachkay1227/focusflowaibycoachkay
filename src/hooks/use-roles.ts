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

    // Fast-path: known admin emails bypass RPC
    const ADMIN_EMAILS = ["hello@coachkayelevates.org"];
    if (ADMIN_EMAILS.includes(user.email ?? "")) {
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    const checkRole = async () => {
      try {
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
