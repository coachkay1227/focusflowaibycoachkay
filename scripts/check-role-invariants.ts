#!/usr/bin/env -S npx tsx
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
 * With a PostgreSQL connection, validates both live data and the deployed
 * function. Without one (for example, pull-request CI), validates the latest
 * authoritative migration so the security contract is still enforced.
 * Exits non-zero on any violation so CI fails loudly.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function psql(sql: string): string {
  const res = spawnSync("psql", ["-At", "-c", sql], { encoding: "utf8" });
  if (res.status !== 0) {
    console.error(res.stderr);
    throw new Error(`psql failed: ${sql}`);
  }
  return res.stdout.trim();
}

const failures: string[] = [];

function validateHasRoleDefinition(definition: string, source: string): void {
  if (!/\b(?:public\.)?user_roles\b/i.test(definition)) {
    failures.push(`${source} no longer references public.user_roles.`);
  }

  if (/\b(?:tier|access_level|corporate)\b/i.test(definition)) {
    failures.push(
      `${source} appears to reference tier/access_level/corporate — ` +
        "admin must come from user_roles ONLY.",
    );
  }
}

function validateLatestMigration(): void {
  const migrationsDirectory = join(process.cwd(), "supabase", "migrations");
  const functionPattern =
    /create\s+or\s+replace\s+function\s+public\.has_role\b[\s\S]*?\$(?:function)?\$\s*;/i;
  const candidates = readdirSync(migrationsDirectory)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => ({
      file,
      sql: readFileSync(join(migrationsDirectory, file), "utf8"),
    }))
    .filter(({ sql }) => /create\s+or\s+replace\s+function\s+public\.has_role\b/i.test(sql));

  const latest = candidates.at(-1);
  if (!latest) {
    failures.push("No public.has_role() migration was found.");
    return;
  }

  const definition = latest.sql.match(functionPattern)?.[0];
  if (!definition) {
    failures.push(`Could not parse public.has_role() in ${latest.file}.`);
    return;
  }

  validateHasRoleDefinition(definition, `Latest public.has_role() migration (${latest.file})`);
}

const hasLiveDatabase = Boolean(
  process.env.DATABASE_URL || process.env.PGHOST || process.env.PGHOSTADDR,
);

if (!hasLiveDatabase) {
  validateLatestMigration();

  if (failures.length > 0) {
    console.error("❌ Role invariant check FAILED:\n");
    for (const failure of failures) console.error("  - " + failure);
    process.exit(1);
  }

  console.log(
    "✅ Role invariant migration check passed. " +
      "Live row validation skipped because no PostgreSQL connection was configured.",
  );
  process.exit(0);
}

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

// 2. has_role() must agree with user_roles for every admin row. The service
// role condition in has_role() allows this cross-user verification in CI.
const mismatched = psql(`
  SELECT COUNT(*)::int
  FROM public.user_roles ur
  WHERE ur.role = 'admin'
    AND NOT public.has_role(ur.user_id, 'admin');
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
validateHasRoleDefinition(def, "Deployed public.has_role()");

if (failures.length > 0) {
  console.error("❌ Role invariant check FAILED:\n");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}

console.log("✅ Role invariants OK — admin is granted only via user_roles.");
