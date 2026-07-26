#!/usr/bin/env node
/**
 * Run live-player E2E with preflight gating.
 *
 * Exit codes:
 *   0 — preflight + serial suite passed
 *   2 — ENVIRONMENT_FAILURE (preflight failed; suite skipped)
 *   1 — suite or harness failure
 */
import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  PLAYWRIGHT_EMULATORS: "1",
};

function run(cmd, args, extraEnv = {}) {
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    env: { ...env, ...extraEnv },
  });
  return result.status ?? 1;
}

const preflightCode = run("npx", ["playwright", "test", "e2e/live-players.preflight.spec.ts"]);
if (preflightCode !== 0) {
  console.error("\n[live-player-e2e] ENVIRONMENT_FAILURE — skipping serial suite");
  console.error("See test-results/live-player-preflight.json for timings and crash hints.");
  process.exit(2);
}

const retries = process.env.LIVE_PLAYER_E2E_RETRIES ?? "1";
const suiteCode = run("npx", [
  "playwright",
  "test",
  "e2e/live-players.emulator.spec.ts",
  "--retries",
  retries,
  ...(process.env.LIVE_PLAYER_E2E_GREP ? ["-g", process.env.LIVE_PLAYER_E2E_GREP] : []),
], {
  LIVE_PLAYER_SKIP_PREFLIGHT: "1",
});

process.exit(suiteCode === 0 ? 0 : 1);
