// Copies the static social app into dist/social/ after the Vite React build.
// Appends a build id to module URLs so phones pick up new JS after deploy.
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const socialDest = join(dist, "social");

function readBuildIdFromMeta() {
  const metaPath = join("public", "build-meta.json");
  if (!existsSync(metaPath)) return null;
  try {
    return JSON.parse(readFileSync(metaPath, "utf8")).buildId;
  } catch {
    return null;
  }
}

const REQUIRED_FIREBASE_CONFIG_EXPORTS = [
  "FIREBASE_SDK_VERSION",
  "AUTH_EMULATOR_URL",
  "FIRESTORE_EMULATOR",
  "FUNCTIONS_EMULATOR",
  "SERVER_HAND_AUTHORITY",
];

function assertFirebaseConfigComplete(src) {
  const missing = REQUIRED_FIREBASE_CONFIG_EXPORTS.filter(
    (name) => !src.includes(`export const ${name}`),
  );
  if (missing.length) {
    console.error(
      `docs/firebase-config.js is missing required exports: ${missing.join(", ")}`,
    );
    console.error("Regenerate with: node scripts/write-firebase-config.js");
    process.exit(1);
  }
}

const firebaseConfigPath = join("docs", "firebase-config.js");
const firebaseConfig = readFileSync(firebaseConfigPath, "utf8");
if (
  firebaseConfig.includes("REPLACE_WITH_YOUR_API_KEY") ||
  firebaseConfig.includes("REPLACE_WITH_YOUR_APP_ID") ||
  firebaseConfig.includes("demo-national-bourre-league")
) {
  console.error(
    "docs/firebase-config.js still has placeholder values — auth will fail in production.",
  );
  console.error("Run: node scripts/ensure-firebase-config.js (or npm run deploy, which runs it first).");
  console.error("Or: npm run setup:webapp -- national-bourre-league booray.win");
  process.exit(1);
}
assertFirebaseConfigComplete(firebaseConfig);

if (!existsSync(dist)) {
  console.error("Run `npm run build` first — dist/ not found.");
  process.exit(1);
}

if (existsSync(socialDest)) {
  rmSync(socialDest, { recursive: true });
}

cpSync("docs", socialDest, { recursive: true });

const buildId =
  process.env.BUILD_ID ||
  readBuildIdFromMeta() ||
  process.env.GITHUB_SHA?.slice(0, 8) ||
  Date.now().toString(36);

for (const name of readdirSync(socialDest)) {
  if (!name.endsWith(".js")) continue;
  const filePath = join(socialDest, name);
  let content = readFileSync(filePath, "utf8");
  content = content.replace(/from "\.\/([^"]+\.js)"/g, `from "./$1?v=${buildId}"`);
  content = content.replace(/import\("\.\/([^"]+\.js)"\)/g, `import("./$1?v=${buildId}")`);
  writeFileSync(filePath, content);
}

const indexPath = join(socialDest, "index.html");
let html = readFileSync(indexPath, "utf8");
html = html.replace(
  '<script type="module" src="./app.js"></script>',
  `<script type="module" src="./app.js?v=${buildId}"></script>`,
);
html = html.replace(
  '<link rel="stylesheet" href="./table-session.css" />',
  `<link rel="stylesheet" href="./table-session.css?v=${buildId}" />`,
);
writeFileSync(indexPath, html);

console.log(`Copied docs/ → dist/social/ (build ${buildId})`);
