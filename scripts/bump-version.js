// Bump patch in version.json (N.NN.NN) and sync derived files.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const versionPath = join(root, "version.json");

/** @returns {string} */
export function nextAppVersion(current) {
  const match = /^(\d+)\.(\d{2})\.(\d{2})$/.exec(current);
  if (!match) {
    throw new Error(`version.json format expected N.NN.NN, got: ${current}`);
  }
  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]) + 1;
  if (patch > 99) {
    patch = 0;
    minor += 1;
  }
  if (minor > 99) {
    minor = 0;
    major += 1;
  }
  return `${major}.${String(minor).padStart(2, "0")}.${String(patch).padStart(2, "0")}`;
}

function main() {
  const data = JSON.parse(readFileSync(versionPath, "utf8"));
  const current = data.version;
  const next = nextAppVersion(current);
  writeFileSync(versionPath, `${JSON.stringify({ version: next }, null, 2)}\n`);

  const sync = spawnSync(process.execPath, ["scripts/sync-version.js"], {
    cwd: root,
    stdio: "inherit",
  });
  if (sync.status !== 0) {
    process.exit(sync.status ?? 1);
  }

  console.log(`Version bumped: v${current} → v${next}`);
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main();
}
