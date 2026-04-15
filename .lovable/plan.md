

# Fix Weekly Insights CORS Error

## Problem

The `_shared/cors.ts` file only allows two origins. The Lovable preview domain (`*.lovableproject.com`) is not in the list, so the browser blocks the edge function response — causing "Failed to send a request to the Edge Function."

## Fix

Update `supabase/functions/_shared/cors.ts` to use `Access-Control-Allow-Origin: *` instead of a restrictive allowlist. This is the standard approach for Supabase edge functions called from web apps, and is safe because all sensitive endpoints already validate JWTs in code.

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

export function getCorsHeaders(_req?: Request): Record<string, string> {
  return corsHeaders;
}
```

Then redeploy all edge functions that import from `_shared/cors.ts` (all 10 functions).

## Impact

This fixes the Weekly Insights call and also prevents the same CORS issue from affecting any other edge function when accessed from the preview domain or any future custom domain.

