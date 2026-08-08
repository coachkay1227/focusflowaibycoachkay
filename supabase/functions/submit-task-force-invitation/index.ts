import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.23.8";
import { getCorsHeaders } from "../_shared/cors.ts";
import { enforceRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const InvitationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional().default(""),
});

serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const parsed = InvitationSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Please check your name, email, and note." }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (parsed.data.website) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const limit = await enforceRateLimit("submit-task-force-invitation", req, {
      email: parsed.data.email,
      rule: { perHour: 2, perDay: 3 },
    });
    if (!limit.allowed) return rateLimitResponse(limit, cors);

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) throw new Error("Backend is unavailable");

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data, error } = await admin
      .from("task_force_invitations")
      .insert({
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        message: parsed.data.message,
        source: "cbus-ai-task-force",
      })
      .select("id")
      .single();

    if (error || !data) throw new Error("Invitation could not be saved");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[submit-task-force-invitation]", error instanceof Error ? error.message : "Unknown error");
    return new Response(JSON.stringify({ error: "We could not send your request. Please try again." }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});