const ALLOWED_ORIGINS = [
  "https://focusflowelevation-hub.com",
  "https://focusflowaibycoachkay.lovable.app",
];

export function getCorsHeaders(req?: Request): Record<string, string> {
  const origin = req?.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}
