import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("/react/") ||
            id.includes("\\react\\") ||
            id.includes("react-dom") ||
            id.includes("react-router-dom")
          ) {
            return "vendor-react";
          }

          if (
            id.includes("@radix-ui/") ||
            id.includes("\\@radix-ui\\")
          ) {
            return "vendor-ui";
          }

          if (
            id.includes("@tanstack/react-query") ||
            id.includes("@tanstack/query-core")
          ) {
            return "vendor-query";
          }

          if (
            id.includes("react-hook-form") ||
            id.includes("@hookform/resolvers") ||
            id.includes("/zod/") ||
            id.includes("\\zod\\")
          ) {
            return "vendor-forms";
          }

          if (id.includes("date-fns")) {
            return "vendor-date";
          }
        },
      },
    },
  },
}));
