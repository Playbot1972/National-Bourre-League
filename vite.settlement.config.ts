import { defineConfig } from "vite";
import { resolve } from "node:path";

/** Pure settlement copy helpers for docs/app.js (hand history, vote feedback). */
export default defineConfig({
  build: {
    outDir: "docs",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/table/settlementCopy.ts"),
      formats: ["es"],
      fileName: "settlement-copy",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
