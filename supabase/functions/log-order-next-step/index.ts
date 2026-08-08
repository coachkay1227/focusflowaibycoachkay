// @ts-nocheck
// Records which next action a buyer chose after a verified purchase, and the
// exact link they were sent to. Public endpoint: the order reference is the
// capability, and nothing is returned but an acknowledgement.
//
// Nothing is logged unless the order is verified first — a settled Stripe
// session or a real fulfillment row. That keeps the trail trustworthy: every
// row on /admin/audit-log is backed by money that actually landed.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { logOrderAudit, ORDER_AUDIT_ACTIONS } from "../_shared/order-audit.ts";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_ACTIONS = new Set([
  "book_call",
  "start_challenge",
  "start_here",
  "view_offer",
  "join_community",
  "join_waitlist",
  "open_dashboard",
]);

const ORDER_TABLES = [
  "business_audits",
  "one_time_orders",
  "agent_orders",
  "book_orders",
  "autism_orders",
];

const str = (v: unknown, max = 300): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });

  try {
    const body = await req.json().catch(() => ({}));
    const action = str(body.action, 40);
    if (!action || !ALLOWED_ACTIONS.has(action)) {
      return json({ error: "invalid action" }, 400);
    }

    const sessionId = str(body.session_id, 200);
    const orderId = str(body.order_id, 64);
    if (!sessionId && !orderId) return json({ error: "missing order reference" }, 400);
    if (sessionId && !sessionId.startsWith("cs_")) {
      return json({ error: "invalid session_id" }, 400);
    }
    if (orderId && !UUID_RE.test(orderId)) return json({ error: "invalid order_id" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Verify the order before writing anything.
    let verified = false;
    let fulfilledIn: string | null = null;
    let paymentStatus: string | null = null;

    if (sessionId) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey) {
        try {
          const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          paymentStatus = session.payment_status ?? null;
          verified = paymentStatus === "paid" || paymentStatus === "no_payment_required";
        } catch {
          verified = false;
        }
      }
      if (verified) {
        for (const table of ORDER_TABLES) {
          const { data } = await supabase
            .from(table)
            .select("id")
            .eq("stripe_session_id", sessionId)
            .maybeSingle();
          if (data?.id) {
            fulfilledIn = table;
            break;
          }
        }
      }
    } else if (orderId) {
      // A fulfillment row on its own is proof enough: it only exists because
      // the webhook already settled the payment.
      for (const table of ORDER_TABLES) {
        const { data } = await supabase
          .from(table)
          .select("id, stripe_session_id")
          .eq("id", orderId)
          .maybeSingle();
        if (data?.id) {
          fulfilledIn = table;
          verified = true;
          break;
        }
      }
    }

    if (!verified) return json({ logged: false, reason: "unverified_order" }, 200);

    const logged = await logOrderAudit(supabase, {
      action: ORDER_AUDIT_ACTIONS.nextStepChosen,
      targetTable: fulfilledIn,
      targetId: sessionId ?? orderId,
      metadata: {
        next_action: action,
        link_target: str(body.link_target, 500),
        session_type: str(body.session_type, 40),
        product_name: str(body.product_name, 200),
        placement: str(body.placement, 60),
        amount_subtotal_cents: typeof body.amount_subtotal_cents === "number"
          ? body.amount_subtotal_cents
          : null,
        order_id: orderId,
        stripe_session_id: sessionId,
        stripe_payment_status: paymentStatus,
        fulfillment_verified: !!fulfilledIn,
        fulfilled_in: fulfilledIn,
        logged_at: new Date().toISOString(),
      },
    });

    return json({ logged });
  } catch (_e) {
    return json({ error: "Internal server error" }, 500);
  }
});