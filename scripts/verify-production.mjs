#!/usr/bin/env node
/**
 * Post-deploy checks for https://booray.win
 * Run: npm run verify:prod
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { compareAppVersion } from "./lib/version-format.mjs";
import {
  DEFAULT_FETCH_TIMEOUT_MS,
  FetchPathError,
  fetchWithRetry,
} from "./lib/fetch-with-retry.mjs";
import {
  extractFirebaseConfigImportBindings,
  parseFirebaseConfigNamedExports,
} from "./lib/firebase-config-export-contract.mjs";

const ORIGIN = process.env.PROD_ORIGIN || "https://booray.win";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** @typedef {{ ok: boolean; detail: string }} CheckResult */

function expectedRepoVersion() {
  try {
    const raw = readFileSync(join(root, "package.json"), "utf8");
    return JSON.parse(raw).version;
  } catch {
    return null;
  }
}

/**
 * @typedef {{ ok: boolean; status: number; body: string; detail?: string }} FetchPathResult
 */

/**
 * @param {string} path
 * @returns {Promise<FetchPathResult>}
 */
async function fetchPath(path) {
  try {
    const result = await fetchWithRetry(`${ORIGIN}${path}`, {
      timeoutMs: DEFAULT_FETCH_TIMEOUT_MS,
    });
    return { ok: result.ok, status: result.status, body: result.body };
  } catch (error) {
    if (error instanceof FetchPathError) {
      return {
        ok: false,
        status: error.status ?? 0,
        body: "",
        detail: error.message,
      };
    }
    throw error;
  }
}

/**
 * @param {string} path
 * @param {FetchPathResult} fetchResult
 * @param {string} [fallback]
 */
function fetchFailureDetail(path, fetchResult, fallback) {
  if (fetchResult.detail) return fetchResult.detail;
  if (fetchResult.status > 0) {
    return `${path}: HTTP ${fetchResult.status}`;
  }
  return fallback ?? `Could not fetch ${path}`;
}

/** @returns {Promise<CheckResult>} */
async function checkVersion() {
  const path = "/social/version.js";
  const fetched = await fetchPath(path);
  if (!fetched.ok) {
    return { ok: false, detail: fetchFailureDetail(path, fetched, `Could not fetch ${path}`) };
  }
  const { body } = fetched;

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
  const path = "/build-meta.json";
  const fetched = await fetchPath(path);
  if (!fetched.ok) {
    return { ok: false, detail: fetchFailureDetail(path, fetched, `Could not fetch ${path}`) };
  }
  const { body } = fetched;
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
  const path = "/social/firebase-config.js";
  const fetched = await fetchPath(path);
  if (!fetched.ok) {
    return {
      ok: false,
      detail: fetchFailureDetail(path, fetched, `Could not fetch ${path}`),
    };
  }
  const { body } = fetched;
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
async function checkFirebaseConfigExportContract() {
  const versionFetched = await fetchPath("/social/version.js");
  if (!versionFetched.ok) {
    return {
      ok: false,
      detail: fetchFailureDetail(
        "/social/version.js",
        versionFetched,
        "Could not fetch /social/version.js for BUILD_ID",
      ),
    };
  }
  const buildId = versionFetched.body.match(/BUILD_ID\s*=\s*"([^"]+)"/)?.[1];
  const versionedQuery = buildId ? `?v=${buildId}` : "";
  const configPath = `/social/firebase-config.js${versionedQuery}`;
  const firestorePath = `/social/firestore.js${versionedQuery}`;

  const configFetched = await fetchPath(configPath);
  if (!configFetched.ok) {
    return {
      ok: false,
      detail: fetchFailureDetail(configPath, configFetched, `Could not fetch ${configPath}`),
    };
  }

  const exports = parseFirebaseConfigNamedExports(configFetched.body);
  const required = ["SERVER_HAND_AUTHORITY", "SERVER_MONEY_AUTHORITY"];
  const missingExports = required.filter((name) => !exports.has(name));
  if (missingExports.length) {
    return {
      ok: false,
      detail: `${configPath} missing exports: ${missingExports.join(", ")}`,
    };
  }

  const firestoreFetched = await fetchPath(firestorePath);
  if (!firestoreFetched.ok) {
    return {
      ok: false,
      detail: fetchFailureDetail(
        firestorePath,
        firestoreFetched,
        `Could not fetch ${firestorePath}`,
      ),
    };
  }

  const firestoreBindings = extractFirebaseConfigImportBindings(firestoreFetched.body);
  const missingImports = [...firestoreBindings].filter((binding) => !exports.has(binding));
  if (missingImports.length) {
    return {
      ok: false,
      detail: `${firestorePath} imports missing from ${configPath}: ${missingImports.join(", ")}`,
    };
  }

  return {
    ok: true,
    detail: `${configPath} exports SERVER_HAND_AUTHORITY + SERVER_MONEY_AUTHORITY; firestore imports satisfied`,
  };
}

/** @returns {Promise<CheckResult>} */
async function checkSocialApp() {
  const path = "/social/";
  const fetched = await fetchPath(path);
  const { ok, status } = fetched;
  if (status === 404) {
    return {
      ok: false,
      detail: "HTTP 404 — social app not deployed (run npm run deploy / full build:hosting)",
    };
  }
  if (!ok && status >= 500) {
    return { ok: false, detail: `HTTP ${status} from ${path}` };
  }
  if (status < 200 || status >= 400) {
    return { ok: false, detail: `HTTP ${status} from ${path}` };
  }
  return { ok: true, detail: `HTTP ${status} from ${path}` };
}

/** @returns {Promise<CheckResult>} */
async function checkTableSessionBundle() {
  const path = "/social/table-session.js";
  const fetched = await fetchPath(path);
  if (!fetched.ok) {
    return { ok: false, detail: fetchFailureDetail(path, fetched, `Could not fetch ${path}`) };
  }
  const { body } = fetched;

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

/** @returns {Promise<CheckResult>} */
async function checkAppStoreLegalPages() {
  const privacyPath = "/social/privacy.html";
  const privacy = await fetchPath(privacyPath);
  if (!privacy.ok || !privacy.body.includes("Privacy Policy")) {
    return { ok: false, detail: "Missing or invalid /social/privacy.html" };
  }
  const supportPath = "/social/support.html";
  const support = await fetchPath(supportPath);
  if (!support.ok || !support.body.includes("Support")) {
    return { ok: false, detail: "Missing or invalid /social/support.html" };
  }
  return { ok: true, detail: "privacy.html + support.html reachable" };
}

/**
 * @param {string} label
 * @param {CheckResult} result
 */
function print(label, result) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${label}`);
  console.log(`       ${result.detail}`);
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
  console.log(`Production verify — ${ORIGIN}\n`);

  const version = await checkVersion();
  print("Social version", version);

  const buildMeta = await checkBuildMeta();
  print("React build meta", buildMeta);

  const firebase = await checkFirebaseConfig();
  print("Firebase config", firebase);

  const firebaseContract = await checkFirebaseConfigExportContract();
  print("Firebase config export contract", firebaseContract);

  const social = await checkSocialApp();
  print("Social app", social);

  const tableBundle = await checkTableSessionBundle();
  print("Table session bundle", tableBundle);

  const legalPages = await checkAppStoreLegalPages();
  print("App Store legal pages", legalPages);

  const passed =
    version.ok &&
    buildMeta.ok &&
    firebase.ok &&
    firebaseContract.ok &&
    social.ok &&
    tableBundle.ok &&
    legalPages.ok;
  console.log(passed ? "\nProduction checks passed." : "\nProduction checks failed.");
  process.exit(passed ? 0 : 1);
}

export {
  checkAppStoreLegalPages,
  checkBuildMeta,
  checkFirebaseConfig,
  checkFirebaseConfigExportContract,
  checkSocialApp,
  checkTableSessionBundle,
  checkVersion,
  fetchPath,
};
