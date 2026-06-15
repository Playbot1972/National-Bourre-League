#!/usr/bin/env node
/**
 * Verify minimal local dev pass/fail order (docs/TESTING.md steps 1–3).
 *
 * 1. java -version → Java 21.x on PATH
 * 2. npm run emulators → Emulator UI at http://localhost:4000
 * 3. npm run social → Social app at http://localhost:8080
 *
 * Run: npm run verify:local
 * Prereq only (step 1 + port 8080 free): npm run verify:local -- --prereq
 */
import { execFile } from "node:child_process";
import net from "node:net";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const EMULATOR_UI = "http://127.0.0.1:4000";
const SOCIAL_APP = "http://127.0.0.1:8080";
const SOCIAL_PORT = 8080;
const FETCH_TIMEOUT_MS = 4000;

/** @typedef {{ ok: boolean, detail: string, hint?: string }} CheckResult */

/**
 * @param {string} url
 * @returns {Promise<boolean>}
 */
async function urlResponds(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });
    return res.status > 0 && res.status < 500;
  } catch {
    return false;
  }
}

/**
 * @param {number} port
 * @param {string} host
 * @returns {Promise<boolean>}
 */
function portInUse(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.setTimeout(1500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

/** @returns {Promise<CheckResult>} */
async function checkJava() {
  try {
    const { stderr, stdout } = await execFileAsync("java", ["-version"]);
    const output = `${stderr}${stdout}`;
    const match = output.match(/version "(\d+)(?:\.(\d+))?/);
    if (!match) {
      return {
        ok: false,
        detail: "Could not parse java -version output",
        hint: "Install OpenJDK 21 (macOS: brew install openjdk@21) and reload your shell.",
      };
    }

    const major = Number(match[1]);
    if (major === 1 && match[2]) {
      // legacy format: version "1.8.0"
      const legacyMajor = Number(match[2]);
      if (legacyMajor >= 21) {
        return { ok: true, detail: output.trim().split("\n")[0] ?? output.trim() };
      }
    } else if (major >= 21) {
      return { ok: true, detail: output.trim().split("\n")[0] ?? output.trim() };
    }

    return {
      ok: false,
      detail: output.trim().split("\n")[0] ?? output.trim(),
      hint: "Firebase emulators need Java 21+. macOS: brew install openjdk@21, then source ~/.zshrc.",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      detail: message.includes("ENOENT") ? "java not found on PATH" : message,
      hint: "Install OpenJDK 21 and add it to PATH. See docs/TESTING.md (Java & Firebase emulators).",
    };
  }
}

/** @returns {Promise<CheckResult>} */
async function checkEmulators() {
  const uiUp = await urlResponds(EMULATOR_UI);
  if (uiUp) {
    return { ok: true, detail: `Emulator UI responding at ${EMULATOR_UI}` };
  }

  const authPort = await portInUse(9099);
  const firestorePort = await portInUse(8088);
  const partial =
    authPort || firestorePort
      ? " (auth or firestore port is open, but UI is not reachable yet — emulators may still be starting)"
      : "";

  return {
    ok: false,
    detail: `No response from ${EMULATOR_UI}${partial}`,
    hint: "From the repo root, run: npm run emulators (Terminal 1). Open http://localhost:4000 when ready.",
  };
}

/** @returns {Promise<CheckResult>} */
async function checkSocial() {
  const appUp = await urlResponds(SOCIAL_APP);
  if (appUp) {
    return { ok: true, detail: `Social app responding at ${SOCIAL_APP}` };
  }

  const portBusy = await portInUse(SOCIAL_PORT);
  const portHint = portBusy
    ? `Port ${SOCIAL_PORT} is in use but not serving the social app. Stop the other process or free the port.`
    : `Port ${SOCIAL_PORT} is free — start the server with: npm run social (Terminal 2).`;

  return {
    ok: false,
    detail: `No response from ${SOCIAL_APP}`,
    hint: portHint,
  };
}

/** @returns {Promise<CheckResult>} */
async function checkSocialPortFree() {
  const busy = await portInUse(SOCIAL_PORT);
  if (!busy) {
    return { ok: true, detail: `Port ${SOCIAL_PORT} is free for npm run social` };
  }

  const appUp = await urlResponds(SOCIAL_APP);
  if (appUp) {
    return {
      ok: true,
      detail: `Port ${SOCIAL_PORT} is serving the social app (already running)`,
    };
  }

  return {
    ok: false,
    detail: `Port ${SOCIAL_PORT} is in use by another process`,
    hint: "Free port 8080 (macOS: lsof -i :8080, then kill the PID). This repo expects http://localhost:8080.",
  };
}

/**
 * @param {number} step
 * @param {string} label
 * @param {CheckResult} result
 */
function printStep(step, label, result) {
  const icon = result.ok ? "PASS" : "FAIL";
  console.log(`\n${step}. ${label}: ${icon}`);
  console.log(`   ${result.detail}`);
  if (!result.ok && result.hint) {
    console.log(`   → ${result.hint}`);
  }
}

const prereqOnly = process.argv.includes("--prereq");

console.log("National Bourré League — local dev verification");
console.log(prereqOnly ? "(prereq checks only: step 1 + port 8080)" : "(steps 1–3 from docs/TESTING.md)");

const java = await checkJava();
printStep(1, "Java 21 on PATH (java -version)", java);

if (prereqOnly) {
  const port = await checkSocialPortFree();
  printStep(2, `Port ${SOCIAL_PORT} ready for npm run social`, port);
  const passed = java.ok && port.ok;
  console.log(passed ? "\nPrereq checks passed." : "\nPrereq checks failed — fix the items above.");
  process.exit(passed ? 0 : 1);
}

const emulators = await checkEmulators();
printStep(2, "Firebase emulators (npm run emulators)", emulators);

const social = await checkSocial();
printStep(3, "Social app (npm run social)", social);

const passed = java.ok && emulators.ok && social.ok;
console.log(
  passed
    ? "\nAll three checks passed — local dev for this project is set."
    : "\nOne or more checks failed — see hints above.",
);
process.exit(passed ? 0 : 1);
