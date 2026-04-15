import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const GHL_GATEWAY_URL = "https://connector-gateway.lovable.dev/ghl";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const body = await req.json();
    const { event, payload } = body;

    if (!event || !payload) {
      return new Response(JSON.stringify({ error: "Missing event or payload" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const ghlApiKey = Deno.env.get("GHL_API_KEY");
    if (!ghlApiKey) {
      console.log(`[ghl-webhook] GHL_API_KEY not configured. Would send event: ${event}`, JSON.stringify(payload));
      return new Response(JSON.stringify({ success: true, queued: false, reason: "no_api_key" }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Post to GHL webhook — the GHL_API_KEY is the webhook URL or API key
    // depending on how the user configured their GHL automation
    const res = await fetch(ghlApiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        ...payload,
        source: "focusflow-ai",
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[ghl-webhook] GHL error (${res.status}):`, err);
      // Don't throw — GHL webhook failures shouldn't break the user flow
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[ghl-webhook] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
