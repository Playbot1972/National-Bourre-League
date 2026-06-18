import { defineConfig } from "vite";
import { resolve } from "node:path";

/** Session table-startup guards for docs/firestore.js and docs/app.js */
export default defineConfig({
  build: {
    outDir: "docs",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/session/tableStartup.ts"),
      formats: ["es"],
      fileName: "session-startup",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
