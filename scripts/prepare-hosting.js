// Copies the static social app into dist/social/ after the Vite React build.
// Appends a build id to module URLs so phones pick up new JS after deploy.
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

const buildId =
  process.env.GITHUB_SHA?.slice(0, 8) ||
  process.env.BUILD_ID ||
  Date.now().toString(36);

for (const name of readdirSync(socialDest)) {
  if (!name.endsWith(".js")) continue;
  const filePath = join(socialDest, name);
  let content = readFileSync(filePath, "utf8");
  content = content.replace(/from "\.\/([^"]+\.js)"/g, `from "./$1?v=${buildId}"`);
  writeFileSync(filePath, content);
}

const indexPath = join(socialDest, "index.html");
let html = readFileSync(indexPath, "utf8");
html = html.replace(
  '<script type="module" src="./app.js"></script>',
  `<script type="module" src="./app.js?v=${buildId}"></script>`,
);
writeFileSync(indexPath, html);

console.log(`Copied docs/ → dist/social/ (build ${buildId})`);
