// ============================================================
// Lead-gen routing for mid- and high-ticket offers.
//
// When an admin sets `leadgen.offer_url` in /admin/booking-links, every
// mid/high-ticket CTA ($297+) stops opening Stripe Checkout and instead sends
// the visitor to the lead-generation page. While the setting is empty the site
// keeps its existing direct-checkout behaviour, so this is a zero-risk switch
// that needs no redeploy.
//
// Deliberately NOT routed through here: the $47 AI Business Audit, the Autism
// Social Stories store, and the Book store. Those are low-ticket / product
// purchases that convert better as direct buys.
// ============================================================
import { supabase } from "@/integrations/supabase/client";

const SETTING_KEY = "leadgen.offer_url";

let cached: string | null = null;
let inflight: Promise<string> | null = null;

/** Resolved lead-gen URL, or "" when no redirect is configured. */
export async function getLeadGenUrl(): Promise<string> {
  if (cached !== null) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", SETTING_KEY)
        .maybeSingle();
      if (error) throw error;
      const value = (data?.value ?? "").trim();
      cached = /^https?:\/\/.+/i.test(value) ? value : "";
    } catch {
      // Never block a purchase because a settings read failed.
      cached = "";
    } finally {
      inflight = null;
    }
    return cached!;
  })();
  return inflight;
}

export function invalidateLeadGenCache() {
  cached = null;
}

/** If a lead-gen URL is configured, navigate there and return true.
 *  Callers should abandon their checkout flow when this returns true. */
export async function redirectToLeadGenIfConfigured(): Promise<boolean> {
  const url = await getLeadGenUrl();
  if (!url) return false;
  window.location.href = url;
  return true;
}
