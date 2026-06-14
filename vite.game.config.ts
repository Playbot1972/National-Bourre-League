import { defineConfig } from "vite";
import { resolve } from "node:path";

/** Builds the pure Bourré game engine for the static social app (docs/firestore.js). */
export default defineConfig({
  build: {
    outDir: "docs",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/game/index.ts"),
      formats: ["es"],
      fileName: "game-engine",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
