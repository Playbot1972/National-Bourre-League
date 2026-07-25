#!/usr/bin/env node
/**
 * Nightly validation: preflight gate + N consecutive serial suite passes.
 *
 * Exit codes:
 *   0 — preflight + all suite passes succeeded
 *   2 — ENVIRONMENT_FAILURE (preflight failed; suites skipped)
 *   1 — one or more suite passes failed
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const PASSES = Number(process.env.LIVE_PLAYER_VALIDATION_PASSES ?? "3");
const AUTH_CLEAR_URL =
  "http://127.0.0.1:9099/emulator/v1/projects/demo-national-bourre-league/accounts";
const FIRESTORE_CLEAR_URL =
  "http://127.0.0.1:8088/emulator/v1/projects/demo-national-bourre-league/databases/(default)/documents";

const env = {
  ...process.env,
  PLAYWRIGHT_EMULATORS: "1",
};

function run(cmd, args, extraEnv = {}) {
  const started = Date.now();
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    env: { ...env, ...extraEnv },
  });
  return { code: result.status ?? 1, durationMs: Date.now() - started };
}

function readPreflightReport() {
  const file = path.join(process.cwd(), "test-results/live-player-preflight.json");
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

async function clearEmulatorData() {
  await fetch(AUTH_CLEAR_URL, { method: "DELETE" }).catch(() => {});
  await fetch(FIRESTORE_CLEAR_URL, { method: "DELETE" }).catch(() => {});
}

function writeValidationReport(report) {
  const dir = path.join(process.cwd(), "test-results");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "live-player-nightly-validation.json");
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`);
  return file;
}

const report = {
  startedAt: new Date().toISOString(),
  requiredPasses: PASSES,
  preflight: null,
  suitePasses: [],
  summary: {
    preflightOk: false,
    passesSucceeded: 0,
    passesFailed: 0,
    failureClass: null,
    stage: null,
  },
};

const preflight = run("npx", ["playwright", "test", "e2e/live-players.preflight.spec.ts"]);
report.preflight = {
  exitCode: preflight.code,
  durationMs: preflight.durationMs,
  diagnostics: readPreflightReport(),
};

if (preflight.code !== 0) {
  const diag = report.preflight.diagnostics;
  report.summary.failureClass = diag?.failureClass ?? "environment";
  report.summary.stage = diag?.stage ?? "preflight";
  report.summary.preflightOk = false;
  writeValidationReport(report);
  console.error("\n[live-player-nightly] ENVIRONMENT_FAILURE — skipping serial suites");
  console.error("See test-results/live-player-preflight.json");
  process.exit(2);
}

report.summary.preflightOk = true;

const retries = process.env.LIVE_PLAYER_E2E_RETRIES ?? "0";

for (let i = 1; i <= PASSES; i += 1) {
  await clearEmulatorData();
  const suite = run(
    "npx",
    [
      "playwright",
      "test",
      "e2e/live-players.emulator.spec.ts",
      "--retries",
      retries,
    ],
    { LIVE_PLAYER_SKIP_PREFLIGHT: "1" },
  );
  report.suitePasses.push({
    pass: i,
    exitCode: suite.code,
    durationMs: suite.durationMs,
    ok: suite.code === 0,
  });
  if (suite.code !== 0) {
    report.summary.passesFailed += 1;
    report.summary.failureClass = "harness";
    report.summary.stage = "suite";
    writeValidationReport(report);
    console.error(`\n[live-player-nightly] Suite pass ${i}/${PASSES} failed (exit ${suite.code})`);
    process.exit(1);
  }
  report.summary.passesSucceeded += 1;
  console.log(`\n[live-player-nightly] Suite pass ${i}/${PASSES} OK (${suite.durationMs}ms)`);
}

report.completedAt = new Date().toISOString();
writeValidationReport(report);
console.log(`\n[live-player-nightly] ${PASSES}/${PASSES} consecutive suite passes succeeded`);
process.exit(0);
