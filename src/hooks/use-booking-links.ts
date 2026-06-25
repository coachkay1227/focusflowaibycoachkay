import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Hardcoded fallbacks — used if the DB read fails or returns nothing,
// so booking links never break even if app_settings is unreachable.
export const FALLBACK_FREE_CLARITY_URL =
  "https://call.coachkayelevates.org/widget/bookings/15-minutes-free-call";
export const FALLBACK_PAID_STRATEGY_URL =
  "https://call.coachkayelevates.org/widget/bookings/60min-discover-call";

export interface BookingLinks {
  freeClarityUrl: string;
  paidStrategyUrl: string;
}

let cached: BookingLinks | null = null;
let inflight: Promise<BookingLinks> | null = null;

async function fetchLinks(): Promise<BookingLinks> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("key,value")
        .in("key", ["booking.free_clarity_url", "booking.paid_strategy_url"]);
      if (error) throw error;
      const map = new Map((data ?? []).map((r) => [r.key, r.value]));
      cached = {
        freeClarityUrl: map.get("booking.free_clarity_url") || FALLBACK_FREE_CLARITY_URL,
        paidStrategyUrl: map.get("booking.paid_strategy_url") || FALLBACK_PAID_STRATEGY_URL,
      };
    } catch {
      cached = {
        freeClarityUrl: FALLBACK_FREE_CLARITY_URL,
        paidStrategyUrl: FALLBACK_PAID_STRATEGY_URL,
      };
    } finally {
      inflight = null;
    }
    return cached!;
  })();
  return inflight;
}

export function invalidateBookingLinksCache() {
  cached = null;
}

export function useBookingLinks() {
  const [links, setLinks] = useState<BookingLinks>(
    cached ?? {
      freeClarityUrl: FALLBACK_FREE_CLARITY_URL,
      paidStrategyUrl: FALLBACK_PAID_STRATEGY_URL,
    },
  );
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let cancelled = false;
    fetchLinks().then((l) => {
      if (!cancelled) {
        setLinks(l);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...links, loading };
}