// Stamp build metadata from package.json → src/version.ts, docs/version.js, public/build-meta.json
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { formatVersionLabel, formatVersionDisplayLabel, isAppVersion } from "./lib/version-format.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = join(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const version = pkg.version;

if (!isAppVersion(version)) {
  console.warn(`package.json version expected N.NN.NN, got: ${version}`);
}

function gitShortSha() {
  const result = spawnSync("git", ["rev-parse", "--short=8", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status === 0) {
    return result.stdout.trim();
  }
  return null;
}

function resolveBuildChannel() {
  const fromEnv = process.env.BUILD_CHANNEL;
  if (fromEnv === "production" || fromEnv === "dev") return fromEnv;
  if (process.env.GITHUB_ACTIONS === "true" || process.env.CI === "true") {
    return "production";
  }
  return "dev";
}

const buildId =
  process.env.BUILD_ID ||
  process.env.GITHUB_SHA?.slice(0, 8) ||
  gitShortSha() ||
  Date.now().toString(36);

const channel = resolveBuildChannel();
const stampedAt = new Date().toISOString();
const label = formatVersionLabel(version, buildId, channel);
const displayLabel = formatVersionDisplayLabel(label);

const meta = {
  version,
  buildId,
  channel,
  label,
  stampedAt,
};

const generatedBanner = "// Generated from package.json — run: npm run version:sync\n";

writeFileSync(
  join(root, "docs", "version.js"),
  `${generatedBanner}export const APP_VERSION = ${JSON.stringify(version)};
export const BUILD_ID = ${JSON.stringify(buildId)};
export const BUILD_CHANNEL = ${JSON.stringify(channel)};
export const BUILD_STAMPED_AT = ${JSON.stringify(stampedAt)};
export const VERSION_LABEL = ${JSON.stringify(label)};
export const VERSION_DISPLAY_LABEL = ${JSON.stringify(displayLabel)};
`,
);

writeFileSync(
  join(root, "src", "version.ts"),
  `${generatedBanner}export const APP_VERSION = ${JSON.stringify(version)} as const;
export const BUILD_ID = ${JSON.stringify(buildId)} as const;
export const BUILD_CHANNEL = ${JSON.stringify(channel)} as const;
export const BUILD_STAMPED_AT = ${JSON.stringify(stampedAt)} as const;
export const VERSION_LABEL = ${JSON.stringify(label)} as const;
export const VERSION_DISPLAY_LABEL = ${JSON.stringify(displayLabel)} as const;
`,
);

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(join(root, "public", "build-meta.json"), `${JSON.stringify(meta, null, 2)}\n`);

console.log(`Version stamped: ${label} (${stampedAt})`);
