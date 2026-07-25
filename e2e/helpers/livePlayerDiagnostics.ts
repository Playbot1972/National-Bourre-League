import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

export type PreflightStage = "emulator" | "social" | "signup" | "pair";

export type PreflightFailureClass = "environment" | "harness" | "app";

export type LivePlayerDiagnostics = {
  startedAt: string;
  emulatorReadyMs: number;
  socialAppMs: number;
  signupBootstrapMs: number;
  pairBootstrapMs: number;
  totalPreflightMs: number;
  pageCrashes: string[];
  browserEvents: string[];
};

export type PreflightResult = {
  ok: boolean;
  failureClass: PreflightFailureClass | null;
  stage: PreflightStage | null;
  message: string;
  diagnostics: LivePlayerDiagnostics;
};

export function createDiagnosticsSink(): LivePlayerDiagnostics {
  return {
    startedAt: new Date().toISOString(),
    emulatorReadyMs: 0,
    socialAppMs: 0,
    signupBootstrapMs: 0,
    pairBootstrapMs: 0,
    totalPreflightMs: 0,
    pageCrashes: [],
    browserEvents: [],
  };
}

export function attachPageDiagnostics(page: Page, diagnostics: LivePlayerDiagnostics) {
  page.on("crash", () => {
    diagnostics.pageCrashes.push(`page crash @ ${new Date().toISOString()}`);
  });
  page.on("close", () => {
    diagnostics.browserEvents.push(`page closed @ ${new Date().toISOString()}`);
  });
}

const ENV_PATTERNS = [
  /EAGAIN/i,
  /failed to launch/i,
  /browser has been closed/i,
  /target page, context or browser has been closed/i,
  /spawn .* EAGAIN/i,
  /emulator ui not reachable/i,
  /emulator endpoints not ready/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
  /social app/i,
];

const HARNESS_PATTERNS = [
  /timed out waiting for/i,
  /openSignupModal/i,
  /createPlayerPair/i,
  /bootstrapPlayerContext/i,
  /visibleSetupPlayButton/i,
  /roomDetail/i,
  /publicTableIndex/i,
];

const APP_PATTERNS = [
  /rooms-error/i,
  /play now failed/i,
  /permission.denied/i,
  /firestore/i,
  /watch-only/i,
  /enrollment/i,
];

export function classifyFailure(
  error: unknown,
  stage: PreflightStage,
): PreflightFailureClass {
  const text = String(error instanceof Error ? error.message : error);

  if (ENV_PATTERNS.some((pattern) => pattern.test(text))) {
    return "environment";
  }

  if (stage === "signup" || stage === "pair") {
    if (/hero-signup|auth-modal|app-version/i.test(text) && /timeout|visible/i.test(text)) {
      return "environment";
    }
  }

  if (APP_PATTERNS.some((pattern) => pattern.test(text))) {
    return "app";
  }

  if (HARNESS_PATTERNS.some((pattern) => pattern.test(text))) {
    return "harness";
  }

  if (stage === "emulator" || stage === "social") {
    return "environment";
  }

  return stage === "pair" || stage === "signup" ? "environment" : "harness";
}

export function writePreflightReport(result: PreflightResult) {
  const dir = path.join(process.cwd(), "test-results");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "live-player-preflight.json");
  fs.writeFileSync(file, `${JSON.stringify(result, null, 2)}\n`);
  return file;
}

export function logPreflightSummary(result: PreflightResult) {
  const { diagnostics: d } = result;
  const lines = [
    "[live-player-preflight]",
    `  ok: ${result.ok}`,
    `  stage: ${result.stage ?? "none"}`,
    `  failureClass: ${result.failureClass ?? "none"}`,
    `  message: ${result.message}`,
    `  emulatorReadyMs: ${d.emulatorReadyMs}`,
    `  socialAppMs: ${d.socialAppMs}`,
    `  signupBootstrapMs: ${d.signupBootstrapMs}`,
    `  pairBootstrapMs: ${d.pairBootstrapMs}`,
    `  totalPreflightMs: ${d.totalPreflightMs}`,
  ];
  if (d.pageCrashes.length) lines.push(`  pageCrashes: ${d.pageCrashes.join("; ")}`);
  if (d.browserEvents.length) lines.push(`  browserEvents: ${d.browserEvents.join("; ")}`);
  console.log(lines.join("\n"));
}
