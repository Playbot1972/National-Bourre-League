#!/usr/bin/env node
/**
 * One-command local dev: Firebase emulators + social static app.
 *
 *   npm run dev:local
 *
 * Opens:
 *   http://localhost:8080  — social app (auth uses emulators on localhost)
 *   http://localhost:4000  — Firebase Emulator UI
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EMULATOR_UI = "http://127.0.0.1:4000";
const SOCIAL_APP = "http://127.0.0.1:8080";
const START_TIMEOUT_MS = 120_000;

/** @param {string} url @param {number} timeoutMs */
async function waitForUrl(url, timeoutMs = START_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (res.status > 0 && res.status < 500) return true;
    } catch {
      // still starting
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

/** @param {import('node:child_process').ChildProcess} child @param {string} label @param {{ onLine?: (line: string) => void }} [opts] */
function pipeWithPrefix(child, label, opts = {}) {
  const attach = (stream, out) => {
    if (!stream) return;
    let buf = "";
    stream.on("data", (chunk) => {
      buf += chunk.toString();
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (line.trim()) {
          out.write(`[${label}] ${line}\n`);
          opts.onLine?.(line);
        }
      }
    });
  };
  attach(child.stdout, process.stdout);
  attach(child.stderr, process.stderr);
}

/** @param {string} cmd @param {string[]} args */
function run(cmd, args) {
  return new Promise((resolveRun) => {
    const child = spawn(cmd, args, { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" });
    child.on("close", (code) => resolveRun(code ?? 1));
  });
}

if (!existsSync(resolve(ROOT, "package.json"))) {
  console.error("dev:local must be run from the repo root (package.json missing).");
  process.exit(1);
}

const prereqCode = await run("node", ["scripts/ensure-repo-root.mjs"]);
if (prereqCode !== 0) process.exit(prereqCode);

const verifyCode = await run("node", ["scripts/verify-local-dev.mjs", "--prereq"]);
if (verifyCode !== 0) process.exit(verifyCode);

console.log("\nStarting Firebase emulators (auth, firestore, functions)…");
const emulators = spawn("npm", ["run", "emulators"], {
  cwd: ROOT,
  shell: true,
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, DEV_LOCAL_CHILD: "1" },
});
pipeWithPrefix(emulators, "emulators");

if (!(await waitForUrl(EMULATOR_UI))) {
  console.error(`\nEmulators did not respond at ${EMULATOR_UI} within ${START_TIMEOUT_MS / 1000}s.`);
  emulators.kill("SIGTERM");
  process.exit(1);
}
console.log(`✓ Emulator UI ready: ${EMULATOR_UI}\n`);

console.log("Starting social app…");
let socialListenUrl = "";
const social = spawn("npm", ["run", "social"], {
  cwd: ROOT,
  shell: true,
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, DEV_LOCAL_CHILD: "1" },
});
pipeWithPrefix(social, "social", {
  onLine(line) {
    const match = line.match(/Accepting connections at (http:\/\/\S+)/);
    if (match) socialListenUrl = match[1];
  },
});

if (!(await waitForUrl(SOCIAL_APP))) {
  console.error(`\nSocial app did not respond at ${SOCIAL_APP} within ${START_TIMEOUT_MS / 1000}s.`);
  if (socialListenUrl && !socialListenUrl.includes(":8080")) {
    console.error(`serve started on ${socialListenUrl} instead — port 8080 is required for auth emulators.`);
    console.error("Free port 8080 (macOS: lsof -i :8080) and run npm run dev:local again.");
  }
  social.kill("SIGTERM");
  emulators.kill("SIGTERM");
  process.exit(1);
}

if (socialListenUrl && !socialListenUrl.includes(":8080")) {
  console.error(`\nsocial app is on ${socialListenUrl}, but this project requires http://localhost:8080.`);
  console.error("Stop the process on port 8080 or pick another port only after updating docs/firebase-config.js.");
  social.kill("SIGTERM");
  emulators.kill("SIGTERM");
  process.exit(1);
}

console.log(`
Local dev is ready:
  Social app:   ${SOCIAL_APP}
  Emulator UI:  ${EMULATOR_UI}

Sign in with any email/password (Auth emulator). Press Ctrl+C to stop both servers.
`);

/** @type {import('node:child_process').ChildProcess[]} */
const children = [emulators, social];

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(0), 400);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

emulators.on("exit", (code) => {
  if (code && code !== 0 && code !== null) {
    console.error(`[emulators] exited with code ${code}`);
    shutdown();
  }
});
social.on("exit", (code) => {
  if (code && code !== 0 && code !== null) {
    console.error(`[social] exited with code ${code}`);
    shutdown();
  }
});
