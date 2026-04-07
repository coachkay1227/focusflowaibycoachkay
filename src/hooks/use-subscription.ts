import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { productIdToTier } from "@/lib/stripe-tiers";
import type { AccessTier } from "@/hooks/use-access-level";

interface SubscriptionState {
  subscribed: boolean;
  tier: AccessTier;
  productId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
}

export function useSubscription() {
  const { session } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    tier: "free",
    productId: null,
    subscriptionEnd: null,
    loading: false,
  });

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) return;
    setState((s) => ({ ...s, loading: true }));
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setState({
        subscribed: data.subscribed ?? false,
        tier: data.product_id ? productIdToTier(data.product_id) : "free",
        productId: data.product_id ?? null,
        subscriptionEnd: data.subscription_end ?? null,
        loading: false,
      });
    } catch (err) {
      // Error handled silently
      setState((s) => ({ ...s, loading: false }));
    }
  }, [session?.access_token]);

  // Check on login and every 60s
  useEffect(() => {
    if (!session) return;
    checkSubscription();
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [session, checkSubscription]);

  const startCheckout = async (priceId: string) => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId },
    });
    if (error) throw error;
    if (data?.url) window.open(data.url, "_blank");
  };

  const openPortal = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error) throw error;
    if (data?.url) window.open(data.url, "_blank");
  };

  return { ...state, checkSubscription, startCheckout, openPortal };
}
