# FocusFlow AI — Available Scripts

All scripts are defined in `package.json` and run via `npm run <script>` or `bun run <script>`.

---

## Development

### `dev`
Start the Vite development server with hot module replacement.
```bash
npm run dev
# → http://localhost:5173
```

### `preview`
Serve the production build locally for testing before deployment.
```bash
npm run build && npm run preview
# → http://localhost:4173
```

---

## Build

### `build`
Create an optimized production build in `dist/`.
```bash
npm run build
```

### `build:dev`
Create a development build (unminified, with source maps) for debugging.
```bash
npm run build:dev
```

---

## Testing

### `test`
Run all Vitest unit tests once and exit.
```bash
npm run test
```

### `test:watch`
Run Vitest in watch mode — re-runs on file changes.
```bash
npm run test:watch
```

---

## Code Quality

### `lint`
Run ESLint across all files using the flat config.
```bash
npm run lint
```

---

## Notes

- **E2E tests**: Playwright is configured (`playwright.config.ts`) but no test files exist yet. Run with `npx playwright test` when added.
- **Edge functions**: Deployed automatically via Lovable Cloud. No manual deploy script needed.
- **Database migrations**: Managed via Lovable Cloud migration tools, not CLI scripts.
