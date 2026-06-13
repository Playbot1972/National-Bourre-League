import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/** Builds the live-session card table bundle into docs/ for /social/ */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "docs",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/table/mount.tsx"),
      formats: ["es"],
      fileName: "table-session",
    },
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: "table-session[extname]",
      },
    },
  },
});
