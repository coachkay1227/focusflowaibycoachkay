// Authorization for scheduled worker functions.
//
// These functions send email, so an unauthenticated caller must never reach
// them. A pg_cron caller cannot present a user JWT, so authorization is decided
// by the database itself: the caller's own bearer token calls
// public.is_privileged_caller(), which returns true only for the service role
// or a signed-in admin. EXECUTE is revoked from anon, so an anonymous token
// cannot even reach the function.
//
// Two earlier approaches were wrong and must not come back:
//   - Reading a privileged table and treating "no error" as proof. PostgREST
//     answers a blocked read with an empty array and HTTP 200, so the anon key
//     passed that probe.
//   - String-matching the service-role key. The scheduler's Vault credential is
//     a different form of the same credential and does not compare equal.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export function bearerFrom(req: Request): string {
  const header = req.headers.get("Authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
}

export interface WorkerAuthResult {
  ok: boolean;
  actor: "privileged" | null;
  reason?: string;
}

export async function authorizeWorkerCaller(
  req: Request,
  supabaseUrl: string,
): Promise<WorkerAuthResult> {
  const bearer = bearerFrom(req);
  if (!bearer) return { ok: false, actor: null, reason: "no_credential" };

  const callerClient = createClient(supabaseUrl, bearer, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${bearer}` } },
  });
  const { data, error } = await callerClient.rpc("is_privileged_caller");
  if (error) {
    // anon has no EXECUTE grant, so an unprivileged token fails here outright.
    return { ok: false, actor: null, reason: `rpc_denied:${error.message}` };
  }
  if (data !== true) return { ok: false, actor: null, reason: "not_privileged" };
  return { ok: true, actor: "privileged" };
}
