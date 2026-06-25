#!/usr/bin/env node
/**
 * Post-deploy checks for https://booray.win
 * Run: npm run verify:prod
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { compareAppVersion } from "./lib/version-format.mjs";

const ORIGIN = process.env.PROD_ORIGIN || "https://booray.win";
const TIMEOUT_MS = 15000;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** @typedef {{ ok: boolean, detail: string }} CheckResult */

function expectedRepoVersion() {
  try {
    const raw = readFileSync(join(root, "package.json"), "utf8");
    return JSON.parse(raw).version;
  } catch {
    return null;
  }
}

/**
 * @param {string} path
 * @returns {Promise<{ ok: boolean, status: number, body: string }>}
 */
async function fetchPath(path) {
  const res = await fetch(`${ORIGIN}${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "follow",
    cache: "no-store",
  });
  return { ok: res.ok, status: res.status, body: await res.text() };
}

/** @returns {Promise<CheckResult>} */
async function checkVersion() {
  const { ok, body } = await fetchPath("/social/version.js");
  if (!ok) return { ok: false, detail: "Could not fetch /social/version.js" };

  const prodVersion = body.match(/APP_VERSION\s*=\s*"([^"]+)"/)?.[1];
  if (!prodVersion) return { ok: false, detail: "APP_VERSION not found in version.js" };

  const prodBuildId = body.match(/BUILD_ID\s*=\s*"([^"]+)"/)?.[1];
  const prodLabel = body.match(/VERSION_LABEL\s*=\s*"([^"]+)"/)?.[1];
  const repoVersion = expectedRepoVersion();

  if (repoVersion && compareAppVersion(prodVersion, repoVersion) < 0) {
    return {
      ok: false,
      detail: `Production ${prodLabel ?? `v${prodVersion}`} is behind repo v${repoVersion} — run npm run deploy:patch or push to main`,
    };
  }

  const buildHint = prodBuildId ? `+${prodBuildId}` : "";
  return {
    ok: true,
    detail: repoVersion
      ? `${prodLabel ?? `v${prodVersion}${buildHint}`} (repo v${repoVersion})`
      : prodLabel ?? `v${prodVersion}${buildHint}`,
  };
}

/** @returns {Promise<CheckResult>} */
async function checkBuildMeta() {
  const { ok, body } = await fetchPath("/build-meta.json");
  if (!ok) return { ok: false, detail: "Could not fetch /build-meta.json" };
  try {
    const meta = JSON.parse(body);
    if (!meta.version || !meta.buildId || !meta.label) {
      return { ok: false, detail: "build-meta.json missing version/buildId/label" };
    }
    return { ok: true, detail: meta.label };
  } catch {
    return { ok: false, detail: "build-meta.json is not valid JSON" };
  }
}

/** @returns {Promise<CheckResult>} */
async function checkFirebaseConfig() {
  const { ok, body } = await fetchPath("/social/firebase-config.js");
  if (!ok) return { ok: false, detail: "Could not fetch /social/firebase-config.js" };
  if (body.includes("REPLACE_WITH_YOUR_API_KEY")) {
    return { ok: false, detail: "apiKey is still REPLACE_WITH_YOUR_API_KEY" };
  }
  if (body.includes("demo-national-bourre-league")) {
    return { ok: false, detail: "projectId is still demo-national-bourre-league" };
  }
  if (/grep -E|npm install|git status/.test(body)) {
    return { ok: false, detail: "firebase-config.js is corrupted (shell text in file)" };
  }
  const apiKey = body.match(/apiKey:\s*"([^"]+)"/)?.[1];
  const projectId = body.match(/projectId:\s*"([^"]+)"/)?.[1];
  if (!apiKey?.startsWith("AIza")) {
    return { ok: false, detail: "apiKey missing or not a Firebase web key (expected AIza…)" };
  }
  return { ok: true, detail: `projectId=${projectId}, apiKey=${apiKey.slice(0, 8)}…` };
}

/** @returns {Promise<CheckResult>} */
async function checkSocialApp() {
  const { ok, status } = await fetchPath("/social/");
  if (status === 404) {
    return {
      ok: false,
      detail: "HTTP 404 — social app not deployed (run npm run deploy / full build:hosting)",
    };
  }
  if (!ok && status >= 500) {
    return { ok: false, detail: `HTTP ${status} from /social/` };
  }
  if (status < 200 || status >= 400) {
    return { ok: false, detail: `HTTP ${status} from /social/` };
  }
  return { ok: true, detail: `HTTP ${status} from /social/` };
}

/** @returns {Promise<CheckResult>} */
async function checkTableSessionBundle() {
  const { ok, body } = await fetchPath("/social/table-session.js");
  if (!ok) return { ok: false, detail: "Could not fetch /social/table-session.js" };

  const markers = [
    "getTablePresentationBlockReason",
    "draw-receive-commit",
    "reinit-play-entry",
  ];
  const missing = markers.filter((m) => !body.includes(m));
  if (missing.length) {
    return {
      ok: false,
      detail: `table-session.js missing fixes: ${missing.join(", ")} — presentation patches not deployed`,
    };
  }
  return { ok: true, detail: `table-session.js includes ${markers.length} presentation-gate markers` };
}

/**
 * @param {string} label
 * @param {CheckResult} result
 */
function print(label, result) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${label}`);
  console.log(`       ${result.detail}`);
}

console.log(`Production verify — ${ORIGIN}\n`);

const version = await checkVersion();
print("Social version", version);

const buildMeta = await checkBuildMeta();
print("React build meta", buildMeta);

const firebase = await checkFirebaseConfig();
print("Firebase config", firebase);

const social = await checkSocialApp();
print("Social app", social);

const tableBundle = await checkTableSessionBundle();
print("Table session bundle", tableBundle);

const passed = version.ok && buildMeta.ok && firebase.ok && social.ok && tableBundle.ok;
console.log(passed ? "\nProduction checks passed." : "\nProduction checks failed.");
process.exit(passed ? 0 : 1);
