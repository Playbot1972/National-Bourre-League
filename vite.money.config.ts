import { defineConfig } from "vite";
import { resolve } from "node:path";

/** Builds the versioned Bourré money engine for docs/ and Cloud Functions vendor sync. */
export default defineConfig({
  build: {
    outDir: "docs",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/game/money/index.ts"),
      formats: ["es"],
      fileName: "money-engine",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
