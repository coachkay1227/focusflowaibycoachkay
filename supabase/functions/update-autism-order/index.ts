import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.23.8";
import { getCorsHeaders } from "../_shared/cors.ts";

const Body = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending_payment", "paid", "in_progress", "delivered", "cancelled"]).optional(),
  download_url: z.string().url().max(2048).optional(),
  admin_notes: z.string().max(5000).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const cors = getCorsHeaders(req);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: claims, error: claimsErr } = await sb.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: hasRole } = await admin.rpc("has_role", {
      _user_id: claims.claims.sub,
      _role: "admin",
    });
    if (!hasRole) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { id, ...patch } = parsed.data;

    const patchWithTimestamp = patch.status === "delivered" && !("delivered_at" in patch)
      ? { ...patch, delivered_at: new Date().toISOString() }
      : patch;

    const { data, error } = await admin
      .from("autism_orders")
      .update(patchWithTimestamp)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Admin audit log — record the write action.
    admin.from("admin_audit_log").insert({
      admin_id: claims.claims.sub,
      action: "autism_order_update",
      target_table: "autism_orders",
      target_id: id,
      metadata: patchWithTimestamp,
    }).then(() => {}, () => {});

    // Send delivery confirmation email when status transitions to "delivered"
    if (data.status === "delivered" && data.client_email) {
      const totalStr = new Intl.NumberFormat("en-US", {
        style: "currency", currency: "USD",
      }).format((data.order_total as number) / 100);

      try {
        await admin.functions.invoke("send-transactional-email", {
          body: {
            templateName: "autism-purchase-confirmation",
            recipientEmail: data.client_email,
            idempotencyKey: `autism-delivery-${data.id}`,
            templateData: {
              name: data.client_name,
              packageName: data.package_name,
              orderTotal: totalStr,
              orderId: data.id,
              childFirstName: data.child_first_name,
              scenarioFocus: data.scenario_focus,
              deliveryMethod: (data.package_slug as string | null)?.includes("illustrated")
                ? "custom-illustrated PDF"
                : "print-ready PDF",
              storyCount: 1,
              includesHsaReceipt: true,
              downloadUrl: data.download_url,
            },
          },
        });
      } catch (e) {
        console.error("[update-autism-order] delivery email failed", e);
      }
    }

    return new Response(JSON.stringify(data), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
