#!/usr/bin/env node
/**
 * Block local deploy when the branch is behind origin/main (prevents rolling production back).
 * CI sets GITHUB_ACTIONS=true and skips this check.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { compareAppVersion } from "./lib/version-format.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function localVersion() {
  return JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
}

function originMainVersion() {
  const result = spawnSync("git", ["show", "origin/main:package.json"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) return null;
  try {
    return JSON.parse(result.stdout).version;
  } catch {
    return null;
  }
}

async function productionVersionInfo() {
  try {
    const res = await fetch("https://booray.win/social/version.js", {
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = await res.text();
    const version = body.match(/APP_VERSION\s*=\s*"([^"]+)"/)?.[1] ?? null;
    const buildId = body.match(/BUILD_ID\s*=\s*"([^"]+)"/)?.[1] ?? null;
    if (!version) return null;
    return { version, buildId };
  } catch {
    return null;
  }
}

if (process.env.CI || process.env.GITHUB_ACTIONS === "true" || process.env.FORCE_DEPLOY === "1") {
  process.exit(0);
}

const local = localVersion();
const origin = originMainVersion();
const prod = await productionVersionInfo();

if (origin && compareAppVersion(local, origin) < 0) {
  console.error(`Deploy blocked: local v${local} is behind origin/main v${origin}.`);
  console.error("Run: git fetch origin && git checkout main && git pull origin main");
  process.exit(1);
}

if (prod && compareAppVersion(local, prod.version) < 0) {
  console.error(`Deploy blocked: local v${local} would overwrite production v${prod.version}.`);
  console.error("Pull latest main before deploying. To override: FORCE_DEPLOY=1 npm run deploy:hosting");
  process.exit(1);
}

if (prod && compareAppVersion(local, prod.version) > 0) {
  const buildHint = prod.buildId ? `+${prod.buildId}` : "";
  console.log(`Deploy will update production v${prod.version}${buildHint} → v${local}`);
} else if (prod) {
  const buildHint = prod.buildId ? `+${prod.buildId}` : "";
  console.log(`Production already at v${prod.version}${buildHint} (local v${local})`);
}
