// Copies the static social app into dist/social/ after the Vite React build.
import { cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const socialDest = join(dist, "social");

if (!existsSync(dist)) {
  console.error("Run `npm run build` first — dist/ not found.");
  process.exit(1);
}

if (existsSync(socialDest)) {
  rmSync(socialDest, { recursive: true });
}

cpSync("docs", socialDest, { recursive: true });
console.log("Copied docs/ → dist/social/");
