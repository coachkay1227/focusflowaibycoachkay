import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  name: z.string().trim().max(120).optional().nullable(),
  source: z.string().trim().max(64).optional().nullable(),
});

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return json(400, { error: "invalid_input", details: parsed.error.flatten().fieldErrors });
  }
  const { email, name, source } = parsed.data;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json(500, { error: "server_misconfigured" });

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Upsert by lower(email)
  const { data: existing } = await admin
    .from("newsletter_subscribers")
    .select("id, synced_to_beehiiv")
    .ilike("email", email)
    .maybeSingle();

  let subscriberId: string | null = existing?.id ?? null;

  if (!existing) {
    const { data: inserted, error: insertErr } = await admin
      .from("newsletter_subscribers")
      .insert({ email, name: name ?? null, source: source ?? null })
      .select("id")
      .single();
    if (insertErr) {
      console.error("newsletter insert error", insertErr);
      return json(500, { error: "insert_failed" });
    }
    subscriberId = inserted.id;
  }

  // Optional Beehiiv forwarding
  const beehiivKey = Deno.env.get("BEEHIIV_API_KEY");
  const beehiivPub = Deno.env.get("BEEHIIV_PUBLICATION_ID");
  let synced = false;
  let beehiivSubId: string | null = null;

  if (beehiivKey && beehiivPub) {
    try {
      const resp = await fetch(
        `https://api.beehiiv.com/v2/publications/${beehiivPub}/subscriptions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${beehiivKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            reactivate_existing: true,
            send_welcome_email: false,
            utm_source: source ?? "focusflow_site",
          }),
        },
      );
      if (resp.ok) {
        const j = await resp.json().catch(() => ({}));
        beehiivSubId = j?.data?.id ?? null;
        synced = true;
        if (subscriberId) {
          await admin
            .from("newsletter_subscribers")
            .update({ synced_to_beehiiv: true, beehiiv_subscription_id: beehiivSubId })
            .eq("id", subscriberId);
        }
      } else {
        console.warn("beehiiv non-ok", resp.status, await resp.text().catch(() => ""));
      }
    } catch (e) {
      console.warn("beehiiv error", e);
    }
  }

  // Fire-and-forget GHL marketing webhook via the internal ghl-webhook function
  // (which validates URL, handles auth, and keeps event payloads consistent).
  admin.functions
    .invoke("ghl-webhook", {
      body: {
        event: "newsletter_signup",
        payload: {
          email,
          name: name ?? null,
          newsletter_source: source ?? null,
          synced_to_beehiiv: synced,
        },
      },
    })
    .catch(() => {});

  return json(200, { ok: true, synced });
});