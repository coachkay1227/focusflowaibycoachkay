// Server-side resolver for booking URLs stored in app_settings.
// Falls back to the original hardcoded URLs on any error so emails/webhooks
// keep working even if the DB is unreachable.

import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export const FALLBACK_FREE_CLARITY_URL =
  "https://call.coachkayelevates.org/widget/bookings/15-minutes-free-call";
export const FALLBACK_PAID_STRATEGY_URL =
  "https://call.coachkayelevates.org/widget/bookings/60min-discover-call";

export interface BookingLinks {
  freeClarityUrl: string;
  paidStrategyUrl: string;
}

export async function getBookingLinks(client: SupabaseClient): Promise<BookingLinks> {
  try {
    const { data, error } = await client
      .from("app_settings")
      .select("key,value")
      .in("key", ["booking.free_clarity_url", "booking.paid_strategy_url"]);
    if (error) throw error;
    const map = new Map((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
    return {
      freeClarityUrl: map.get("booking.free_clarity_url") || FALLBACK_FREE_CLARITY_URL,
      paidStrategyUrl: map.get("booking.paid_strategy_url") || FALLBACK_PAID_STRATEGY_URL,
    };
  } catch (e) {
    console.warn("getBookingLinks fallback", e instanceof Error ? e.message : String(e));
    return {
      freeClarityUrl: FALLBACK_FREE_CLARITY_URL,
      paidStrategyUrl: FALLBACK_PAID_STRATEGY_URL,
    };
  }
}