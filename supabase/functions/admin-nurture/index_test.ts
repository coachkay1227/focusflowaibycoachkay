// Smoke test for the /admin/nurture console (admin-nurture edge function).
//
// Always runs: the auth guards (401 without a token, 403 with a non-admin one).
//
// End-to-end run (lookup -> preview -> enqueue -> resend one step) needs an
// admin session token, so it only runs when these are set in .env:
//   NURTURE_SMOKE_ADMIN_TOKEN  admin access_token (from a signed-in admin session)
//   NURTURE_SMOKE_QUERY        audit id, cs_... session id, or buyer email
//   NURTURE_SMOKE_SEND=1       opt in to actually delivering one real email
//
// Without those it skips loudly instead of failing, so CI stays green.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN = `${SUPABASE_URL}/functions/v1/admin-nurture`;

const ADMIN_TOKEN = Deno.env.get("NURTURE_SMOKE_ADMIN_TOKEN") ?? "";
const QUERY = Deno.env.get("NURTURE_SMOKE_QUERY") ?? "";
const ALLOW_SEND = Deno.env.get("NURTURE_SMOKE_SEND") === "1";
const e2e = ADMIN_TOKEN !== "" && QUERY !== "";

async function call(body: unknown, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: ANON_KEY,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(FN, { method: "POST", headers, body: JSON.stringify(body) });
  const text = await res.text(); // always consume
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(text);
  } catch { /* non-JSON body, keep {} */ }
  return { status: res.status, json, text };
}

Deno.test("guard: no Authorization header is rejected", async () => {
  const { status, json } = await call({ action: "lookup", query: "nobody@example.com" });
  assertEquals(status, 401);
  assertEquals(json.error, "Unauthorized");
});

Deno.test("guard: a bogus token is rejected", async () => {
  const { status } = await call({ action: "lookup", query: "nobody@example.com" }, "not-a-real-jwt");
  assert(status === 401 || status === 403, `expected 401/403, got ${status}`);
});

Deno.test({
  name: "e2e: lookup finds the audit and returns its steps",
  ignore: !e2e,
  fn: async () => {
    const { status, json } = await call({ action: "lookup", query: QUERY }, ADMIN_TOKEN);
    assertEquals(status, 200);
    assertEquals(json.found, true, `audit not found for query "${QUERY}"`);
    const audit = json.audit as Record<string, unknown>;
    assert(typeof audit.id === "string" && audit.id.length > 0);
    assert(Array.isArray(json.steps) && (json.steps as unknown[]).length > 0);
    assert(Array.isArray(json.touches));
  },
});

Deno.test({
  name: "e2e: preview renders step 1 email html and subject",
  ignore: !e2e,
  fn: async () => {
    const { status, json } = await call({ action: "preview", query: QUERY, step: 1 }, ADMIN_TOKEN);
    assertEquals(status, 200);
    assertEquals(json.step, 1);
    assert(typeof json.templateName === "string" && (json.templateName as string).length > 0);
    assert(typeof json.subject === "string" && (json.subject as string).length > 0);
    const html = json.html as string;
    assert(typeof html === "string" && html.includes("<html"), "preview html looks empty");
  },
});

Deno.test({
  name: "e2e: preview rejects an unknown step",
  ignore: !e2e,
  fn: async () => {
    const { status, json } = await call({ action: "preview", query: QUERY, step: 99 }, ADMIN_TOKEN);
    assertEquals(status, 400);
    assertEquals(json.error, "Unknown step");
  },
});

Deno.test({
  name: "e2e: enqueue is idempotent (second call inserts nothing)",
  ignore: !e2e,
  fn: async () => {
    const first = await call({ action: "enqueue", query: QUERY }, ADMIN_TOKEN);
    assertEquals(first.status, 200);
    assert(Array.isArray(first.json.touches));

    const second = await call({ action: "enqueue", query: QUERY }, ADMIN_TOKEN);
    assertEquals(second.status, 200);
    assertEquals(second.json.inserted, 0);
    assertEquals(second.json.reason, "all_steps_already_exist");
  },
});

Deno.test({
  name: "e2e: queue view exposes per-step status and idempotency keys",
  ignore: !e2e,
  fn: async () => {
    const { status, json } = await call(
      { action: "queue", days: 90, includeTest: true },
      ADMIN_TOKEN,
    );
    assertEquals(status, 200);
    const perStep = json.perStep as Array<Record<string, unknown>>;
    assert(Array.isArray(perStep) && perStep.length > 0);
    const rows = json.rows as Array<Record<string, unknown>>;
    assert(Array.isArray(rows));
    for (const row of rows.slice(0, 5)) {
      assert(
        typeof row.idempotency_key === "string" && (row.idempotency_key as string).startsWith("nurture-"),
        "row is missing its idempotency key",
      );
    }
  },
});

Deno.test({
  name: "e2e: resend delivers one step end-to-end (NURTURE_SMOKE_SEND=1)",
  ignore: !(e2e && ALLOW_SEND),
  fn: async () => {
    const { status, json } = await call({ action: "resend", query: QUERY, step: 1 }, ADMIN_TOKEN);
    if (status === 409) {
      // Suppressed address: the guard fired, which is still correct behaviour.
      assert(String(json.error).includes("suppressed"));
      return;
    }
    assertEquals(status, 200);
    assertEquals(json.sent, true);
    assertEquals(json.step, 1);
    assert(typeof json.recipient === "string" && (json.recipient as string).includes("@"));

    const after = await call({ action: "lookup", query: QUERY }, ADMIN_TOKEN);
    const touches = after.json.touches as Array<Record<string, unknown>>;
    const step1 = touches.find((t) => t.step === 1);
    assert(step1, "step 1 touch missing after resend");
    assertEquals(step1!.status, "sent");
    assert((step1!.attempts as number) >= 1);
  },
});

Deno.test({
  name: "e2e: rejects an unknown action",
  ignore: !e2e,
  fn: async () => {
    const { status, json } = await call({ action: "nope", query: QUERY }, ADMIN_TOKEN);
    assertEquals(status, 400);
    assertEquals(json.error, "Unknown action");
  },
});

if (!e2e) {
  console.log(
    "\n[admin-nurture smoke] guards only. Set NURTURE_SMOKE_ADMIN_TOKEN + NURTURE_SMOKE_QUERY (and NURTURE_SMOKE_SEND=1 to send) in .env for the full lookup -> preview -> enqueue -> resend run.\n",
  );
}
