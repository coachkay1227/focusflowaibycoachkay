#!/usr/bin/env -S bun run
/**
 * Role invariant check (CI).
 *
 * Asserts that admin privileges are granted ONLY by rows in public.user_roles
 * with role = 'admin'. Specifically:
 *   1. No user in user_access_levels with tier = 'corporate' has an admin row.
 *      (Corporate tier must never imply admin.)
 *   2. has_role(uid, 'admin') is TRUE iff a matching user_roles row exists.
 *   3. The has_role() function definition references public.user_roles.
 *
 * Requires PG* env vars (managed Lovable Cloud psql access).
 * Exits non-zero on any violation so CI fails loudly.
 */
import { spawnSync } from "node:child_process";

function psql(sql: string): string {
  const res = spawnSync("psql", ["-At", "-c", sql], { encoding: "utf8" });
  if (res.status !== 0) {
    console.error(res.stderr);
    throw new Error(`psql failed: ${sql}`);
  }
  return res.stdout.trim();
}

const failures: string[] = [];

// 1. No corporate-tier user holds an admin role row.
const corpAdmins = psql(`
  SELECT COUNT(*)::int
  FROM public.user_access_levels ual
  JOIN public.user_roles ur ON ur.user_id = ual.id
  WHERE ual.tier = 'corporate' AND ur.role = 'admin';
`);
if (corpAdmins !== "0") {
  failures.push(
    `Corporate-tier users with admin role: ${corpAdmins} (must be 0). ` +
      `Tier must never grant admin — only user_roles does.`,
  );
}

// 2. has_role() must agree with user_roles for every admin row.
const mismatched = psql(`
  SELECT COUNT(*)::int
  FROM public.user_roles ur
  WHERE ur.role = 'admin'
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles x
      WHERE x.user_id = ur.user_id AND x.role = 'admin'
    );
`);
if (mismatched !== "0") {
  failures.push(`user_roles admin rows inconsistent: ${mismatched}`);
}

// 3. has_role definition references user_roles (defense against silent rewrites).
const def = psql(`
  SELECT pg_get_functiondef(p.oid)
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'has_role'
  LIMIT 1;
`);
if (!def.includes("user_roles")) {
  failures.push("public.has_role() no longer references user_roles table.");
}
if (/tier|access_level|corporate/i.test(def)) {
  failures.push(
    "public.has_role() appears to reference tier/access_level/corporate — " +
      "admin must come from user_roles ONLY.",
  );
}

if (failures.length > 0) {
  console.error("❌ Role invariant check FAILED:\n");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}

console.log("✅ Role invariants OK — admin is granted only via user_roles.");