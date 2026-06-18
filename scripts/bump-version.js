// Bump patch in package.json (N.NN.NN) and sync derived version artifacts.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { nextAppVersion } from "./lib/version-format.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = join(root, "package.json");

export { nextAppVersion };

function main() {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const current = pkg.version;
  const next = nextAppVersion(current);
  pkg.version = next;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  const sync = spawnSync(process.execPath, ["scripts/sync-version.js"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env },
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
