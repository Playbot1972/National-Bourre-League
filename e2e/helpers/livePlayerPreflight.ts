import { expect, type Browser } from "@playwright/test";
import { clearEmulatorData, closePlayerContext, createPlayerContext, createPlayerPair } from "./livePlayerHarness";
import { emulatorReady } from "./roomFlow";
import {
  attachPageDiagnostics,
  classifyFailure,
  createDiagnosticsSink,
  logPreflightSummary,
  type LivePlayerDiagnostics,
  type PreflightResult,
  type PreflightStage,
  writePreflightReport,
} from "./livePlayerDiagnostics";

const SOCIAL_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080";
const FIRESTORE_EMULATOR_URL =
  "http://127.0.0.1:8088/emulator/v1/projects/demo-national-bourre-league/databases/(default)/documents";

async function timed<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = Date.now();
  const value = await fn();
  return [value, Date.now() - start];
}

async function checkEndpoint(url: string, timeoutMs = 3000, okStatuses: number[] = [200, 404]): Promise<boolean> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    return okStatuses.includes(res.status);
  } catch {
    return false;
  }
}

async function checkEmulatorBoot(diagnostics: LivePlayerDiagnostics) {
  const [, ms] = await timed(async () => {
    if (!(await emulatorReady())) {
      throw new Error("Firebase emulator UI not reachable on :4000");
    }
    const authOk = await checkEndpoint("http://127.0.0.1:9099/", 3000, [200]);
    const firestoreOk = await checkEndpoint(FIRESTORE_EMULATOR_URL, 3000, [200, 404]);
    if (!authOk || !firestoreOk) {
      throw new Error(
        `Emulator endpoints not ready (auth=${authOk}, firestore=${firestoreOk})`,
      );
    }
  });
  diagnostics.emulatorReadyMs = ms;
}

async function checkSocialApp(diagnostics: LivePlayerDiagnostics) {
  const [, ms] = await timed(async () => {
    const res = await fetch(SOCIAL_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      throw new Error(`Social app not reachable at ${SOCIAL_URL} (HTTP ${res.status})`);
    }
    const html = await res.text();
    if (!html.includes('id="hero-signup"')) {
      throw new Error("Social app HTML missing #hero-signup — wrong server on :8080?");
    }
  });
  diagnostics.socialAppMs = ms;
}

async function runSignupBootstrapSmoke(browser: Browser, diagnostics: LivePlayerDiagnostics) {
  const [, ms] = await timed(async () => {
    const player = await createPlayerContext(browser, "Preflight Host");
    attachPageDiagnostics(player.page, diagnostics);
    try {
      await expect(player.page.locator("#view-rooms")).toBeVisible({ timeout: 15_000 });
    } finally {
      await closePlayerContext(player);
    }
  });
  diagnostics.signupBootstrapMs = ms;
  if (ms > 60_000) {
    throw new Error(`Signup bootstrap slow (${ms}ms) — runner likely exhausted`);
  }
}

async function runPairContextSmoke(browser: Browser, diagnostics: LivePlayerDiagnostics) {
  const [, ms] = await timed(async () => {
    const [host, guest] = await createPlayerPair(browser, "Preflight Host", "Preflight Guest");
    attachPageDiagnostics(host.page, diagnostics);
    attachPageDiagnostics(guest.page, diagnostics);
    try {
      await expect(host.page.locator("#view-rooms")).toBeVisible({ timeout: 15_000 });
      await expect(guest.page.locator("#view-rooms")).toBeVisible({ timeout: 15_000 });
    } finally {
      await closePlayerContext(host);
      await closePlayerContext(guest);
    }
  });
  diagnostics.pairBootstrapMs = ms;
}

function fail(
  diagnostics: LivePlayerDiagnostics,
  stage: PreflightStage,
  error: unknown,
): PreflightResult {
  const message = error instanceof Error ? error.message : String(error);
  diagnostics.totalPreflightMs = Date.now() - new Date(diagnostics.startedAt).getTime();
  const result: PreflightResult = {
    ok: false,
    failureClass: classifyFailure(error, stage),
    stage,
    message,
    diagnostics,
  };
  writePreflightReport(result);
  logPreflightSummary(result);
  return result;
}

/** Lightweight gate: emulators, signup, and two-user bootstrap before the serial suite. */
export async function runLivePlayerPreflight(browser: Browser): Promise<PreflightResult> {
  const diagnostics = createDiagnosticsSink();
  const started = Date.now();

  await clearEmulatorData();

  try {
    await checkEmulatorBoot(diagnostics);
  } catch (error) {
    return fail(diagnostics, "emulator", error);
  }

  try {
    await checkSocialApp(diagnostics);
  } catch (error) {
    return fail(diagnostics, "social", error);
  }

  try {
    await runSignupBootstrapSmoke(browser, diagnostics);
  } catch (error) {
    return fail(diagnostics, "signup", error);
  }

  try {
    await runPairContextSmoke(browser, diagnostics);
  } catch (error) {
    return fail(diagnostics, "pair", error);
  }

  diagnostics.totalPreflightMs = Date.now() - started;
  const result: PreflightResult = {
    ok: true,
    failureClass: null,
    stage: null,
    message: "ok",
    diagnostics,
  };
  writePreflightReport(result);
  logPreflightSummary(result);
  return result;
}

export { logPreflightSummary, writePreflightReport };
