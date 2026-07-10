#!/usr/bin/env node
/**
 * v1.0 release-readiness checks (repo + optional production).
 *
 *   node scripts/verify-release-readiness.mjs          # repo only
 *   node scripts/verify-release-readiness.mjs --prod   # repo + npm run verify:prod
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const checkProd = process.argv.includes("--prod");

/** @typedef {{ ok: boolean; detail: string }} Row */

/** @type {Row[]} */
const rows = [];

function pass(label, detail) {
  rows.push({ ok: true, detail: `${label}: ${detail}` });
}

function fail(label, detail) {
  rows.push({ ok: false, detail: `${label}: ${detail}` });
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function requireFile(rel, label) {
  if (!existsSync(join(root, rel))) {
    fail(label, `missing ${rel}`);
    return null;
  }
  pass(label, rel);
  return read(rel);
}

// Legal pages (repo)
const privacy = requireFile("docs/privacy.html", "privacy page");
if (privacy && !privacy.includes("Privacy Policy")) {
  fail("privacy content", 'docs/privacy.html must contain "Privacy Policy"');
}
const support = requireFile("docs/support.html", "support page");
if (support && !support.includes("support@booray.win")) {
  fail("support content", "docs/support.html must list support@booray.win");
}

// iOS export compliance
const infoPlist = requireFile("ios/App/App/Info.plist", "Info.plist");
if (infoPlist && !infoPlist.includes("ITSAppUsesNonExemptEncryption")) {
  fail("export compliance", "Info.plist missing ITSAppUsesNonExemptEncryption");
} else if (infoPlist?.includes("<false/>") || infoPlist?.includes("<false />")) {
  pass("export compliance", "ITSAppUsesNonExemptEncryption=false");
}

// Capacitor release build path
const pkg = JSON.parse(read("package.json"));
if (pkg.scripts?.["build:cap:release"]) {
  pass("cap release script", "build:cap:release defined");
} else {
  fail("cap release script", "package.json missing build:cap:release");
}

const cap = read("capacitor.config.ts");
if (cap.includes("CAPACITOR_WEB_DEBUG === '1'")) {
  pass("cap debug default", "webContentsDebuggingEnabled opt-in only");
} else {
  fail("cap debug default", "capacitor.config.ts must opt in CAPACITOR_WEB_DEBUG=1");
}

// iOS Google wiring
const capGoogle = spawnSync("npm", ["run", "verify:cap:ios-google"], {
  cwd: root,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
if (capGoogle.status === 0) {
  pass("ios google wiring", "verify:cap:ios-google passed");
} else {
  fail("ios google wiring", "verify:cap:ios-google failed — run npm run verify:cap:ios-google");
}

if (checkProd) {
  const prod = spawnSync("npm", ["run", "verify:prod"], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (prod.status === 0) {
    pass("production verify", "verify:prod passed");
  } else {
    fail("production verify", "verify:prod failed — deploy hosting then re-run");
  }
}

console.log("\nv1.0 release-readiness\n");
for (const row of rows) {
  console.log(`${row.ok ? "PASS" : "FAIL"}  ${row.detail}`);
}

const failed = rows.filter((r) => !r.ok);
if (failed.length) {
  console.log(`\n${failed.length} check(s) failed.`);
  if (!checkProd) {
    console.log("After deploy: node scripts/verify-release-readiness.mjs --prod");
  }
  process.exit(1);
}

console.log("\nAll release-readiness checks passed.");
if (!checkProd) {
  console.log("Next: merge release/v1.0 → main, deploy hosting, then re-run with --prod");
}
