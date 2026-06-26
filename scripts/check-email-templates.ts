#!/usr/bin/env -S npx -y tsx
/**
 * Build-time guard: every email templateName referenced by an edge function
 * must exist in the registry. Run from CI before deploy.
 *
 *   bun run scripts/check-email-templates.ts
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const FUNCTIONS_DIR = join(ROOT, "supabase/functions");
const TEMPLATES_DIR = join(FUNCTIONS_DIR, "_shared/transactional-email-templates");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const templateFiles = new Set(
  readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith(".tsx") && !f.startsWith("_"))
    .map((f) => f.replace(/\.tsx$/, "")),
);

const TEMPLATE_RE = /templateName:\s*["'`]([a-z0-9-]+)["'`]/g;
const referenced = new Map<string, string[]>();

for (const file of walk(FUNCTIONS_DIR)) {
  const src = readFileSync(file, "utf8");
  let m: RegExpExecArray | null;
  while ((m = TEMPLATE_RE.exec(src)) !== null) {
    const name = m[1];
    if (!referenced.has(name)) referenced.set(name, []);
    referenced.get(name)!.push(relative(ROOT, file));
  }
}

const missing: Array<{ name: string; refs: string[] }> = [];
for (const [name, refs] of referenced) {
  if (!templateFiles.has(name)) missing.push({ name, refs });
}

if (missing.length > 0) {
  console.error("❌ Missing email templates:");
  for (const { name, refs } of missing) {
    console.error(`   - "${name}" referenced from:`);
    refs.forEach((r) => console.error(`       ${r}`));
  }
  console.error(`\nFix: create supabase/functions/_shared/transactional-email-templates/<name>.tsx and register it.`);
  process.exit(1);
}

console.log(`✓ All ${referenced.size} referenced email templates exist.`);