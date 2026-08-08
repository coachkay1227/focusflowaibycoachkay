// Authorization for scheduled worker functions.
//
// These functions send email, so an unauthenticated caller must never reach
// them. A pg_cron caller cannot present a user JWT, so two credentials are
// accepted and nothing else:
//
//   1. The service-role key, compared in constant time. This is what the
//      scheduler pulls from Vault.
//   2. A signed-in user who passes has_role(uid, 'admin'), for the manual
//      "run now" buttons in the admin console.
//
// An earlier version probed a privileged table with the caller's own token and
// treated "no error" as proof. That is not sound: PostgREST answers a blocked
// read with an empty array and HTTP 200 rather than an error, so the anon key
// passed the probe. This module replaces that check.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export function bearerFrom(req: Request): string {
  const header = req.headers.get("Authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
}

function constantTimeEquals(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export interface WorkerAuthResult {
  ok: boolean;
  actor: "service_role" | "admin" | null;
  reason?: string;
}

export async function authorizeWorkerCaller(
  req: Request,
  supabaseUrl: string,
): Promise<WorkerAuthResult> {
  const bearer = bearerFrom(req);
  if (!bearer) return { ok: false, actor: null, reason: "no_credential" };

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const secretKeys = (Deno.env.get("SUPABASE_SECRET_KEYS") ?? "")
    .split(/[,\s]+/)
    .filter(Boolean);

  // The project holds both the legacy JWT and newer secret-key forms of the
  // service-role credential, and they are not equal as strings.
  for (const candidate of [serviceKey, ...secretKeys]) {
    if (constantTimeEquals(bearer, candidate)) {
      return { ok: true, actor: "service_role" };
    }
  }

  // Otherwise the caller must be a signed-in admin.
  const callerClient = createClient(supabaseUrl, bearer, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${bearer}` } },
  });
  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData?.user) {
    return { ok: false, actor: null, reason: "not_a_session" };
  }
  const { data: isAdmin, error: roleError } = await callerClient.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (roleError || isAdmin !== true) {
    return { ok: false, actor: null, reason: "not_an_admin" };
  }
  return { ok: true, actor: "admin" };
}
