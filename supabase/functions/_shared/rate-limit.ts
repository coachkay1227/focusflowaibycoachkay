// Ad-hoc abuse throttle for the AI generators.
//
// There is no platform-level rate-limiting primitive available, so this is a
// deliberate application-level approximation: one row per accepted AI call in
// `ai_call_events`, counted over two rolling windows. It is best-effort by
// design. It is not a hard concurrency guarantee (two simultaneous requests can
// both pass the read before either writes), and it costs one extra round trip
// per call. It exists to stop scripted abuse and runaway credit spend, not to
// meter entitlements.

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export interface RateLimitRule {
  /** Max accepted calls per rolling hour for one identity. */
  perHour: number;
  /** Max accepted calls per rolling day for one identity. */
  perDay: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds to wait before retrying. Only set when `allowed` is false. */
  retryAfterSeconds?: number;
  /** User-facing message. Only set when `allowed` is false. */
  message?: string;
}

/** Signed-in users get a workable ceiling; guests get a tight one. */
export const RATE_LIMITS: Record<"guest" | "user", RateLimitRule> = {
  guest: { perHour: 3, perDay: 6 },
  user: { perHour: 20, perDay: 60 },
};

function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

/**
 * Stable, non-reversible identity key. We never store a raw email or IP in the
 * throttle table — only a SHA-256 digest of it.
 */
export async function hashIdentity(raw: string): Promise<string> {
  const bytes = new TextEncoder().encode(raw.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Resolve the identity to throttle on, in order of trust:
 * signed-in user id, then submitted email, then the forwarded client address.
 */
export async function resolveIdentity(
  req: Request,
  opts: { userId?: string | null; email?: string | null },
): Promise<{ key: string; authenticated: boolean }> {
  if (opts.userId) {
    return { key: await hashIdentity(`user:${opts.userId}`), authenticated: true };
  }
  if (opts.email) {
    return { key: await hashIdentity(`email:${opts.email}`), authenticated: false };
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  return { key: await hashIdentity(`ip:${ip}`), authenticated: false };
}

/**
 * Check the caller against the rolling windows and, when allowed, record the
 * call. A failure inside this helper never blocks the request: an outage in the
 * throttle table must not take a paid generator offline.
 */
export async function enforceRateLimit(
  functionName: string,
  req: Request,
  opts: {
    userId?: string | null;
    email?: string | null;
    client?: SupabaseClient;
    /** Override the default ceilings (e.g. conversational endpoints). */
    rule?: RateLimitRule;
  } = {},
): Promise<RateLimitResult> {
  try {
    const supabase = opts.client ?? serviceClient();
    const { key, authenticated } = await resolveIdentity(req, opts);
    const rule = opts.rule ?? (authenticated ? RATE_LIMITS.user : RATE_LIMITS.guest);

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("ai_call_events")
      .select("created_at")
      .eq("function_name", functionName)
      .eq("identity_key", key)
      .gte("created_at", dayAgo);

    if (error) {
      console.warn(`[rate-limit] ${functionName} read failed, allowing:`, error.message);
      return { allowed: true };
    }

    const rows = data ?? [];
    const inHour = rows.filter((r) => r.created_at >= hourAgo).length;

    if (inHour >= rule.perHour) {
      return {
        allowed: false,
        retryAfterSeconds: 3600,
        message:
          "You've reached the limit for this tool for now. Try again in an hour, or book a call if you need help sooner.",
      };
    }
    if (rows.length >= rule.perDay) {
      return {
        allowed: false,
        retryAfterSeconds: 24 * 3600,
        message:
          "You've reached today's limit for this tool. Try again tomorrow, or book a call if you need help sooner.",
      };
    }

    const insert = await supabase
      .from("ai_call_events")
      .insert({ function_name: functionName, identity_key: key, authenticated });
    if (insert.error) {
      console.warn(`[rate-limit] ${functionName} write failed:`, insert.error.message);
    }

    return { allowed: true };
  } catch (err) {
    console.warn(`[rate-limit] ${functionName} threw, allowing:`, err);
    return { allowed: true };
  }
}

/** 429 response body/headers for a blocked call. */
export function rateLimitResponse(
  result: RateLimitResult,
  cors: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify({ error: result.message ?? "Rate limit reached" }),
    {
      status: 429,
      headers: {
        ...cors,
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSeconds ?? 3600),
      },
    },
  );
}
