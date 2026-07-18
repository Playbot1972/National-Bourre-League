import { defineConfig } from "vite";
import { resolve } from "node:path";

/** Canonical match-key readiness helpers for docs/app.js and table-session. */
export default defineConfig({
  build: {
    outDir: "docs",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/table/matchKey.ts"),
      formats: ["es"],
      fileName: "match-key",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
