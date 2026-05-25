import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type AccessTier = "free" | "subscriber" | "cohort" | "premium" | "rent_agent" | "corporate";

export function useAccessLevel(): { tier: AccessTier; loading: boolean } {
  const { user } = useAuth();
  const [tier, setTier] = useState<AccessTier>("free");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setTier("free");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from("user_access_levels")
      .select("tier")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setTier("free");
        } else {
          setTier(data.tier as AccessTier);
        }
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user]);

  return { tier, loading };
}
