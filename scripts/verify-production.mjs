#!/usr/bin/env node
/**
 * Post-deploy checks for https://booray.win
 * Run: npm run verify:prod
 */
const ORIGIN = process.env.PROD_ORIGIN || "https://booray.win";
const TIMEOUT_MS = 15000;

/** @typedef {{ ok: boolean, detail: string }} CheckResult */

/**
 * @param {string} path
 * @returns {Promise<{ ok: boolean, status: number, body: string }>}
 */
async function fetchPath(path) {
  const res = await fetch(`${ORIGIN}${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "follow",
  });
  return { ok: res.ok, status: res.status, body: await res.text() };
}

/** @returns {Promise<CheckResult>} */
async function checkVersion() {
  const { ok, body } = await fetchPath("/social/version.js");
  if (!ok) return { ok: false, detail: "Could not fetch /social/version.js" };
  const match = body.match(/APP_VERSION\s*=\s*"([^"]+)"/);
  if (!match) return { ok: false, detail: "APP_VERSION not found in version.js" };
  if (match[1] === "1.00.60") {
    return { ok: false, detail: `Still on old release v${match[1]} — redeploy required` };
  }
  return { ok: true, detail: `v${match[1]}` };
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
print("Version", version);

const firebase = await checkFirebaseConfig();
print("Firebase config", firebase);

const social = await checkSocialApp();
print("Social app", social);

const passed = version.ok && firebase.ok && social.ok;
console.log(passed ? "\nProduction checks passed." : "\nProduction checks failed.");
process.exit(passed ? 0 : 1);
