import { defineConfig } from "vite";
import { resolve } from "node:path";

/** Bundles @capacitor-firebase/authentication for the static social app (docs/auth.js). */
export default defineConfig({
  build: {
    outDir: "docs",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/native/auth-google-native.ts"),
      formats: ["es"],
      fileName: "auth-google-native",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
