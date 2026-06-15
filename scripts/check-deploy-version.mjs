#!/usr/bin/env node
/**
 * Block local deploy when the branch is behind origin/main (prevents rolling production back).
 * CI sets GITHUB_ACTIONS=true and skips this check.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseVersion(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function compare(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return 0;
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

function localVersion() {
  return JSON.parse(readFileSync(join(root, "version.json"), "utf8")).version;
}

function originMainVersion() {
  const result = spawnSync("git", ["show", "origin/main:version.json"], {
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

async function productionVersion() {
  try {
    const res = await fetch("https://booray.win/social/version.js", {
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const body = await res.text();
    const match = body.match(/APP_VERSION\s*=\s*"([^"]+)"/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

if (process.env.CI || process.env.GITHUB_ACTIONS === "true" || process.env.FORCE_DEPLOY === "1") {
  process.exit(0);
}

const local = localVersion();
const origin = originMainVersion();
const prod = await productionVersion();

if (origin && compare(local, origin) < 0) {
  console.error(`Deploy blocked: local v${local} is behind origin/main v${origin}.`);
  console.error("Run: git fetch origin && git checkout main && git pull origin main");
  process.exit(1);
}

if (prod && compare(local, prod) < 0) {
  console.error(`Deploy blocked: local v${local} would overwrite production v${prod}.`);
  console.error("Pull latest main before deploying. To override: FORCE_DEPLOY=1 npm run deploy:hosting");
  process.exit(1);
}

if (prod && compare(local, prod) > 0) {
  console.log(`Deploy will update production v${prod} → v${local}`);
} else if (prod) {
  console.log(`Production already at v${prod} (local v${local})`);
}
