// Sync version.json → package.json, docs/version.js, src/version.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(readFileSync(join(root, "version.json"), "utf8"));

if (!/^\d+\.\d{2}\.\d{2}$/.test(version)) {
  console.warn(`version.json format expected N.NN.NN, got: ${version}`);
}

writeFileSync(
  join(root, "docs", "version.js"),
  `// Generated from version.json — run: npm run version:sync\nexport const APP_VERSION = ${JSON.stringify(version)};\n`,
);

writeFileSync(
  join(root, "src", "version.ts"),
  `// Generated from version.json — run: npm run version:sync\nexport const APP_VERSION = ${JSON.stringify(version)} as const;\n`,
);

const pkgPath = join(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.version = version;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log(`Version synced: v${version}`);
