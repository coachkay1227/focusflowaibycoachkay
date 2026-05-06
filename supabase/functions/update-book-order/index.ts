import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.23.8";
import { getCorsHeaders } from "../_shared/cors.ts";

const Body = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending_payment","paid","in_progress","delivered","cancelled"]).optional(),
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

    // Capture previous status to detect transitions
    const { data: prev } = await admin
      .from("book_orders")
      .select("status")
      .eq("id", id)
      .maybeSingle();

    const { data, error } = await admin
      .from("book_orders")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Fire status-update email when status actually changed.
    // Skip "paid" — that's already emailed by the Stripe webhook.
    const newStatus = data.status as string;
    const prevStatus = (prev?.status as string | undefined) ?? null;
    if (
      newStatus &&
      newStatus !== prevStatus &&
      newStatus !== "pending_payment" &&
      newStatus !== "paid" &&
      data.client_email
    ) {
      try {
        await admin.functions.invoke("send-transactional-email", {
          body: {
            templateName: "book-order-status-update",
            recipientEmail: data.client_email,
            idempotencyKey: `book-order-status-${data.id}-${newStatus}`,
            templateData: {
              name: data.client_name,
              packageName: data.package_name,
              status: newStatus,
              orderId: data.id,
              note: data.admin_notes ?? undefined,
            },
          },
        });
      } catch (e) {
        console.error("[update-book-order] status email failed", e);
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
