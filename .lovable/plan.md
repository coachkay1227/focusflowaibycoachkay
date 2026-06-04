## Plan: Verify clean production build

1. Run `npm run build` (Vite production build) and capture full stdout/stderr.
2. Scan output for:
   - TypeScript errors
   - Vite/Rollup warnings (circular deps, unresolved imports, large-chunk warnings, eval, sourcemap issues)
   - Plugin warnings (SWC, lovable-tagger)
3. If any warning/error appears, report it with file + line and propose a targeted fix (no scope creep).
4. If clean, report bundle sizes per chunk and confirm publish-ready.

No code changes will be made unless a warning/error is found — in which case I'll come back with a follow-up plan before editing.