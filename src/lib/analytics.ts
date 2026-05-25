import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight funnel analytics.
 *
 * - Fire-and-forget: never throws, never blocks UI.
 * - Anonymous visitors get a stable browser session_id stored in localStorage.
 * - Authenticated visitors are stamped with their user_id automatically.
 *
 * Use `trackEvent` for one-shot events and `trackCta` for CTA clicks where
 * the funnel `path` matters (personal / business / ai).
 */

export type FunnelPath = "personal" | "business" | "ai" | "unknown";

const SESSION_KEY = "ff_analytics_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

export async function trackEvent(
  event: string,
  properties: Record<string, unknown> = {},
  path: FunnelPath | undefined = undefined
): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id ?? null;
    await supabase.from("analytics_events").insert({
      event,
      path: path ?? (properties.path as FunnelPath | undefined) ?? null,
      session_id: getSessionId(),
      user_id: userId,
      properties,
    });
  } catch {
    // analytics must never break UX
  }
}

export function trackCta(
  cta: string,
  path: FunnelPath,
  properties: Record<string, unknown> = {}
): void {
  // Fire-and-forget — no await needed at call sites.
  void trackEvent("cta_click", { cta, ...properties }, path);
}
