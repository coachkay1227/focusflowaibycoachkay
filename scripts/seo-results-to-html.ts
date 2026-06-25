// Convert seo-results.txt (output of `bun run seo:check`) into a standalone
// HTML summary uploaded alongside the raw log as a CI artifact.
//
// Usage: bun run scripts/seo-results-to-html.ts <input.txt> <output.html>

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const [, , inPath = "seo-results.txt", outPath = "seo-results.html"] = process.argv;

const raw = existsSync(inPath) ? readFileSync(inPath, "utf8") : "(no output captured)";
const lines = raw.split(/\r?\n/);

const errors: string[] = [];
const warnings: string[] = [];
let okLine = "";
let inErrors = false;
let inWarnings = false;

for (const line of lines) {
  if (/^\[seo-check\] FAILED:/.test(line)) { inErrors = true; inWarnings = false; continue; }
  if (/^\[seo-check\] warnings:/.test(line)) { inWarnings = true; inErrors = false; continue; }
  if (/^\[seo-check\] OK/.test(line)) { okLine = line; inErrors = false; inWarnings = false; continue; }
  const m = line.match(/^\s*-\s+(.*)$/);
  if (!m) continue;
  if (inErrors) errors.push(m[1]);
  else if (inWarnings) warnings.push(m[1]);
}

const status = errors.length > 0 ? "FAILED" : "PASSED";
const statusColor = errors.length > 0 ? "#dc2626" : "#16a34a";
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const list = (items: string[]) =>
  items.length === 0
    ? `<p class="muted">None.</p>`
    : `<ul>${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>SEO Regression Summary — ${status}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root { color-scheme: light dark; }
  body { font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1.25rem; color: #111827; background: #f9fafb; }
  header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
  h1 { margin: 0; font-size: 1.5rem; }
  .badge { display: inline-block; padding: 0.25rem 0.65rem; border-radius: 999px; font-weight: 600; color: white; background: ${statusColor}; font-size: 0.85rem; letter-spacing: 0.02em; }
  .meta { color: #6b7280; font-size: 0.9rem; }
  section { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
  h2 { margin: 0 0 0.75rem; font-size: 1.1rem; }
  .count { color: #6b7280; font-weight: 400; font-size: 0.95rem; margin-left: 0.4rem; }
  ul { margin: 0; padding-left: 1.25rem; }
  li { margin: 0.3rem 0; word-break: break-word; }
  .muted { color: #6b7280; margin: 0; }
  details { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.75rem 1rem; }
  details summary { cursor: pointer; font-weight: 600; }
  pre { background: #0b1020; color: #e5e7eb; padding: 1rem; border-radius: 8px; overflow: auto; font-size: 13px; margin-top: 0.75rem; }
  @media (prefers-color-scheme: dark) {
    body { background: #0b0f19; color: #e5e7eb; }
    section, details { background: #111827; border-color: #1f2937; }
    .meta, .muted, .count { color: #9ca3af; }
  }
</style>
</head>
<body>
  <header>
    <h1>SEO Regression Summary</h1>
    <span class="badge">${status}</span>
  </header>
  <p class="meta">Generated ${new Date().toISOString()} · ${esc(okLine || `${errors.length} error(s), ${warnings.length} warning(s)`)}</p>

  <section>
    <h2>Errors <span class="count">(${errors.length})</span></h2>
    ${list(errors)}
  </section>

  <section>
    <h2>Warnings <span class="count">(${warnings.length})</span></h2>
    ${list(warnings)}
  </section>

  <details>
    <summary>Raw output</summary>
    <pre>${esc(raw)}</pre>
  </details>
</body>
</html>
`;

writeFileSync(outPath, html, "utf8");
console.log(`[seo-results-to-html] wrote ${outPath} (${status}, ${errors.length} errors, ${warnings.length} warnings)`);