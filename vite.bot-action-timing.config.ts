import { defineConfig } from "vite";
import { resolve } from "node:path";

/** Bot action pacing policy for docs/app.js and table presentation. */
export default defineConfig({
  build: {
    outDir: "docs",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/session/botActionTiming.ts"),
      formats: ["es"],
      fileName: "bot-play-delay",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
