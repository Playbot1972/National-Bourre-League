#!/usr/bin/env node
/**
 * Canonical release baseline — smallest meaningful verification gate.
 *
 * Runs:
 *   1. verify:prod (production version parity)
 *   2. publicTableJoin.integration (mixed matchmaking join policy)
 *   3. firestore-public-table-rules (Phase 2 security guards)
 *
 * Usage:
 *   node scripts/canonical-baseline.mjs
 *   node scripts/canonical-baseline.mjs --skip-prod   # local emulator-only
 */

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PROJECT_ID = "demo-national-bourre-league";

/** @typedef {'PRESENT_WORKING'|'PRESENT_BROKEN'|'ABSENT'|'UNCERTAIN'} BaselineStatus */

/** @type {Record<string, { status: BaselineStatus, detail: string }>} */
const matrix = {};

const skipProd = process.argv.includes("--skip-prod");

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    cwd: opts.cwd ?? ROOT,
    env: { ...process.env, ...opts.env },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function setMatrix(id, status, detail) {
  matrix[id] = { status, detail };
}

function printMatrix() {
  console.log("\n=== Canonical baseline matrix ===\n");
  const order = [
    "verify_prod",
    "public_table_join_integration",
    "firestore_public_table_rules",
    "public_table_stale_reconcile_integration",
    "two_client_playwright_emulator",
  ];
  for (const id of order) {
    const row = matrix[id] ?? { status: "ABSENT", detail: "not evaluated" };
    console.log(`${row.status.padEnd(16)}  ${id}`);
    if (row.detail) console.log(`                  ${row.detail}`);
  }
  console.log("");
}

function stepVerifyProd() {
  if (skipProd) {
    setMatrix("verify_prod", "UNCERTAIN", "skipped (--skip-prod)");
    return true;
  }
  const result = run("npm", ["run", "verify:prod"]);
  if (result.ok) {
    const line = (result.stdout + result.stderr).split("\n").find((l) => l.includes("✓") || l.includes("PASS")) ?? "ok";
    setMatrix("verify_prod", "PRESENT_WORKING", line.trim() || "production version check passed");
    return true;
  }
  const detail = (result.stderr || result.stdout).trim().split("\n").slice(-3).join(" ") || `exit ${result.status}`;
  setMatrix("verify_prod", "PRESENT_BROKEN", detail);
  return false;
}

function stepEmulatorTest(label, matrixId, command, env = {}) {
  const mergedEnv = {
    MIXED_PUBLIC_TABLES_SERVER_ENABLED: "true",
    FIRESTORE_EMULATOR_HOST: "127.0.0.1:8088",
    ...env,
  };

  const runDirect = () => {
    const result = run("bash", ["-lc", command], {
      cwd: resolve(ROOT, "functions"),
      env: mergedEnv,
    });
    return { result, mode: "direct" };
  };

  const runExec = () => {
    const inner = `cd functions && ${command}`;
    const result = run("npx", [
      "firebase",
      "emulators:exec",
      "--only",
      "firestore",
      "--project",
      PROJECT_ID,
      inner,
    ], { env: mergedEnv });
    return { result, mode: "emulators:exec" };
  };

  let { result, mode } = runExec();
  const output = result.stdout + result.stderr;
  if (!result.ok && /port taken|Port \d+ is not open/i.test(output)) {
    console.warn(`[baseline] emulators:exec unavailable (${matrixId}) — trying direct emulator`);
    ({ result, mode } = runDirect());
  }

  const finalOutput = result.stdout + result.stderr;
  if (result.ok) {
    setMatrix(matrixId, "PRESENT_WORKING", `${label} (${mode})`);
    return true;
  }
  const failLine =
    finalOutput.split("\n").find((l) => /not ok|AssertionError|✖/.test(l)) ??
    `exit ${result.status}`;
  setMatrix(matrixId, "PRESENT_BROKEN", failLine.trim().slice(0, 200));
  return false;
}

function stepFirestoreRules() {
  const mergedEnv = { FIRESTORE_EMULATOR_HOST: "127.0.0.1:8088" };
  const inner =
    "node --test --test-concurrency=1 ../scripts/firestore-public-table-rules.test.mjs";

  const runExec = () =>
    run("npx", [
      "firebase",
      "emulators:exec",
      "--only",
      "firestore",
      "--project",
      PROJECT_ID,
      inner,
    ], { env: mergedEnv });

  const runDirect = () =>
    run("node", ["--test", "--test-concurrency=1", "scripts/firestore-public-table-rules.test.mjs"], {
      env: mergedEnv,
    });

  let result = runExec();
  let mode = "emulators:exec";
  let output = result.stdout + result.stderr;
  if (!result.ok && /port taken|Port \d+ is not open/i.test(output)) {
    console.warn("[baseline] emulators:exec unavailable (rules) — trying direct emulator");
    result = runDirect();
    mode = "direct";
    output = result.stdout + result.stderr;
  }

  if (result.ok) {
    setMatrix("firestore_public_table_rules", "PRESENT_WORKING", `9/9 rules guards (${mode})`);
    return true;
  }
  const failLine =
    output.split("\n").find((l) => /not ok|AssertionError|✖/.test(l)) ?? `exit ${result.status}`;
  setMatrix("firestore_public_table_rules", "PRESENT_BROKEN", failLine.trim().slice(0, 200));
  return false;
}

function noteOptionalCoverage() {
  setMatrix(
    "public_table_stale_reconcile_integration",
    "UNCERTAIN",
    "run: cd functions && MIXED_PUBLIC_TABLES_SERVER_ENABLED=true npx firebase emulators:exec --only firestore --project demo-national-bourre-league \"node --test publicTableStaleReconcile.integration.test.mjs\"",
  );
  setMatrix(
    "two_client_playwright_emulator",
    "UNCERTAIN",
    "run: npm run emulators && PLAYWRIGHT_EMULATORS=1 npm run test:e2e:public-table",
  );
}

async function main() {
  console.log("Canonical baseline verification\n");

  const results = [];
  results.push(stepVerifyProd());
  results.push(
    stepEmulatorTest(
      "canonical mixed join policy (publicTableJoin.integration)",
      "public_table_join_integration",
      "node --test publicTableJoin.integration.test.mjs",
    ),
  );
  results.push(stepFirestoreRules());
  noteOptionalCoverage();

  printMatrix();

  const broken = Object.values(matrix).filter((r) => r.status === "PRESENT_BROKEN");
  if (broken.length) {
    console.error(`Baseline FAILED — ${broken.length} check(s) broken.`);
    process.exit(1);
  }
  const evaluated = Object.entries(matrix).filter(([, r]) => r.status !== "UNCERTAIN" && r.status !== "ABSENT");
  const working = evaluated.filter(([, r]) => r.status === "PRESENT_WORKING");
  console.log(`Baseline passed — ${working.length}/${evaluated.length} evaluated checks working.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
