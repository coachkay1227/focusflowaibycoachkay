// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

/** Persist an AI Business Audit lead BEFORE the buyer is sent to Stripe.
 *  Returns the audit id so create-checkout can carry it in session metadata
 *  and the webhook can flip the same row to paid. Guarantees no lead is lost
 *  when checkout is abandoned or completed on a different device. */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const body = await req.json().catch(() => ({}));
    const intake = body.intake && typeof body.intake === "object" ? body.intake : null;
    const email = typeof body.email === "string" ? body.email.trim().slice(0, 320) : "";
    const name = typeof body.full_name === "string" ? body.full_name.trim().slice(0, 200) : "";

    if (!intake || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: "intake and a valid email are required" }, 400);
    }

    // Attempt to associate a signed-in user, but never require it.
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const { data } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
        userId = data?.user?.id ?? null;
      } catch { /* guest */ }
    }

    const { data: inserted, error } = await supabase
      .from("business_audits")
      .insert({
        user_id: userId,
        guest_email: email,
        guest_name: name || null,
        intake,
        status: "pending_payment",
      })
      .select("id")
      .single();

    if (error || !inserted?.id) {
      console.error("[START-AUDIT-INTAKE] insert_failed", error?.message);
      return json({ error: "Internal server error" }, 500);
    }

    console.log("[START-AUDIT-INTAKE] lead_saved", inserted.id);
    return json({ ok: true, audit_id: inserted.id });
  } catch (_e) {
    return json({ error: "Internal server error" }, 500);
  }
});