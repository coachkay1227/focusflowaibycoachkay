import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

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

    // Prefer GHL_WEBHOOK_URL, fall back to GHL_API_KEY for backwards compat
    const webhookUrlRaw = Deno.env.get("GHL_WEBHOOK_URL") || Deno.env.get("GHL_API_KEY");
    if (!webhookUrlRaw) {
      console.log(`[ghl-webhook] No webhook URL configured. Would send event: ${event}`, JSON.stringify(payload));
      return new Response(JSON.stringify({ success: true, queued: false, reason: "no_webhook_url" }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    let webhookUrl: URL;
    try {
      webhookUrl = new URL(webhookUrlRaw);
    } catch {
      console.error(`[ghl-webhook] Webhook URL is not valid. Set GHL_WEBHOOK_URL to your full GHL webhook URL.`);
      return new Response(JSON.stringify({ success: false, reason: "invalid_webhook_url" }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const res = await fetch(webhookUrl.toString(), {
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
