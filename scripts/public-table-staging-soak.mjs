#!/usr/bin/env node
/**
 * Phase 3 public-table staging soak runner.
 *
 * Authenticated find → join → leave cycles via Cloud Function callables.
 * Staging / emulator only. Does not enable client-facing public matchmaking.
 *
 * @see docs/PUBLIC_TABLES_PHASE3_STAGING.md
 * @see scripts/public-table-staging-soak.env.example
 */

import { mkdirSync, appendFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import {
  getFirestore,
  doc,
  getDoc,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { publicTableIndexKey } from "../docs/public-table-schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

function loadDotEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnvFile(resolve(REPO_ROOT, ".env.soak"));

function parseArgs(argv) {
  const opts = {
    cycles: Number(process.env.SOAK_CYCLES || 1),
    delayMs: Number(process.env.SOAK_DELAY_MS ?? 0),
    startCycle: Number(process.env.SOAK_START_CYCLE || 1),
    stopOnFail: process.env.SOAK_STOP_ON_FAIL === "1",
    logCsv: process.env.SOAK_LOG_CSV || "artifacts/public-table-soak/soak-log.csv",
    logMd: process.env.SOAK_LOG_MD || "artifacts/public-table-soak/soak-log.md",
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--cycles" && argv[i + 1]) {
      opts.cycles = Number(argv[++i]);
    } else if (arg === "--delay" && argv[i + 1]) {
      opts.delayMs = Number(argv[++i]);
    } else if (arg === "--start-cycle" && argv[i + 1]) {
      opts.startCycle = Number(argv[++i]);
    } else if (arg === "--log" && argv[i + 1]) {
      opts.logCsv = argv[++i];
    } else if (arg === "--fast" || arg === "--back-to-back") {
      opts.delayMs = 0;
    } else if (arg === "--stop-on-fail") {
      opts.stopOnFail = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  return opts;
}

function printHelp() {
  console.log(`Usage: node scripts/public-table-staging-soak.mjs [options]

Runs authenticated find → join → leave cycles back-to-back (default: no delay).

Options:
  --cycles N         Number of cycles in one invocation (default: SOAK_CYCLES or 1)
  --start-cycle N    Starting cycle number for log (default: 1)
  --fast             Alias for --delay 0 (back-to-back, no pause between cycles)
  --back-to-back     Same as --fast
  --delay MS         Pause between cycles (default: SOAK_DELAY_MS or 0)
  --stop-on-fail     Stop after first failed cycle (default: log all, exit 1 at end)
  --log PATH         CSV log path (default: artifacts/public-table-soak/soak-log.csv)

Examples:
  # 42 back-to-back cycles (9→50) after manual Days 1–8
  npm run soak:public-table -- --cycles 42 --start-cycle 9

  # Emulator smoke
  npm run soak:public-table:emulator

Environment: see scripts/public-table-staging-soak.env.example
`);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function ensureLogHeader(csvPath) {
  const abs = resolve(REPO_ROOT, csvPath);
  mkdirSync(dirname(abs), { recursive: true });
  if (!existsSync(abs)) {
    appendFileSync(
      abs,
      "timestamp,cycle,pass,roomId,sessionId,joinId,hostUid,guestUid,error\n",
    );
  }
  return abs;
}

function appendCsvRow(csvPath, row) {
  const line = [
    row.timestamp,
    row.cycle,
    row.pass ? "true" : "false",
    row.roomId,
    row.sessionId,
    row.joinId,
    row.hostUid,
    row.guestUid,
    row.error,
  ]
    .map(csvEscape)
    .join(",");
  appendFileSync(csvPath, `${line}\n`);
}

function appendMarkdownRow(mdPath, row) {
  const abs = resolve(REPO_ROOT, mdPath);
  mkdirSync(dirname(abs), { recursive: true });
  const date = row.timestamp.slice(0, 10);
  const mark = row.pass ? "☑" : "☐";
  const note = row.error ? row.error.replace(/\|/g, "/") : "";
  appendFileSync(abs, `| ${row.cycle} | ${date} | ${mark} | auto | ${note} |\n`);
}

function initFirebase() {
  const useEmulator = process.env.SOAK_USE_EMULATOR === "1";
  const projectId =
    process.env.SOAK_FIREBASE_PROJECT_ID ||
    (useEmulator ? "demo-national-bourre-league" : null);

  if (!useEmulator && process.env.SOAK_ENV !== "staging") {
    throw new Error(
      "Set SOAK_ENV=staging for remote soak, or SOAK_USE_EMULATOR=1 for local emulator.",
    );
  }

  if (!useEmulator && process.env.SOAK_ALLOW_PRODUCTION !== "1") {
    const prodIds = new Set(["national-bourre-league", "booray-win"]);
    if (prodIds.has(projectId)) {
      throw new Error(
        `Refusing production project "${projectId}". Use a staging project or set SOAK_ALLOW_PRODUCTION=1 (not recommended).`,
      );
    }
  }

  const apiKey = requireEnv("SOAK_FIREBASE_API_KEY");
  const app = initializeApp({
    apiKey,
    authDomain:
      process.env.SOAK_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    projectId,
    appId: process.env.SOAK_FIREBASE_APP_ID || "soak-runner",
  });

  const auth = getAuth(app);
  const region = process.env.SOAK_FUNCTIONS_REGION || "us-central1";
  const functions = getFunctions(app, region);
  const db = getFirestore(app);

  if (useEmulator) {
    const host = process.env.SOAK_EMULATOR_HOST || "127.0.0.1";
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFunctionsEmulator(functions, host, 5001);
    connectFirestoreEmulator(db, host, 8088);
  }

  return { auth, functions, db };
}

async function ensureSignedIn(auth, email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (err) {
    if (
      process.env.SOAK_USE_EMULATOR === "1" ||
      process.env.SOAK_CREATE_USERS === "1"
    ) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      return cred.user;
    }
    throw err;
  }
}

async function callAs(functions, name, data) {
  const fn = httpsCallable(functions, name);
  const result = await fn(data);
  return result.data;
}

async function verifyPostLeave(db, auth, { guestUid, roomId, sessionId }) {
  const errors = [];

  const queueSnap = await getDoc(doc(db, "matchQueue", guestUid));
  if (queueSnap.exists()) {
    errors.push("guest matchQueue still exists after leave");
  }

  const sessionSnap = await getDoc(
    doc(db, "rooms", roomId, "sessions", sessionId),
  );
  if (!sessionSnap.exists()) {
    errors.push("session missing after leave");
  } else {
    const pending = sessionSnap.data()?.pendingJoins?.[guestUid];
    if (pending != null) {
      errors.push("guest pendingJoins entry still present after leave");
    }
  }

  const guestScoreSnap = await getDoc(
    doc(db, "rooms", roomId, "sessions", sessionId, "scores", guestUid),
  );
  if (guestScoreSnap.exists()) {
    errors.push("unexpected guest score row after spectating join/leave");
  }

  const indexKey = publicTableIndexKey(roomId, sessionId);
  const indexSnap = await getDoc(doc(db, "publicTableIndex", indexKey));
  if (!indexSnap.exists()) {
    errors.push("publicTableIndex missing (expected rebuild after leave)");
  } else {
    const idx = indexSnap.data();
    if (typeof idx.realPlayerCount !== "number" || idx.realPlayerCount < 1) {
      errors.push(`index realPlayerCount unexpected: ${idx.realPlayerCount}`);
    }
    if (typeof idx.openSeats !== "number" || idx.openSeats < 0) {
      errors.push(`index openSeats invalid: ${idx.openSeats}`);
    }
  }

  return errors;
}

async function runOneCycle({
  cycle,
  auth,
  functions,
  db,
  hostEmail,
  hostPassword,
  guestEmail,
  guestPassword,
}) {
  const joinId = `soak-${Date.now()}-${cycle}`;
  let hostUid = "";
  let guestUid = "";
  let roomId = "";
  let sessionId = "";

  await signOut(auth);

  const hostUser = await ensureSignedIn(auth, hostEmail, hostPassword);
  hostUid = hostUser.uid;

  const created = await callAs(functions, "gameFindOrCreatePublicTable", {
    joinId,
    displayName: "Soak Host",
    targetSeatCount: 6,
  });
  if (!created?.ok) {
    throw new Error(`find/create not ok: ${JSON.stringify(created)}`);
  }
  roomId = created.roomId;
  sessionId = created.sessionId;
  if (!roomId || !sessionId) {
    throw new Error(`missing roomId/sessionId: ${JSON.stringify(created)}`);
  }

  await signOut(auth);
  const guestUser = await ensureSignedIn(auth, guestEmail, guestPassword);
  guestUid = guestUser.uid;

  const joined = await callAs(functions, "gameJoinPublicTable", {
    joinId: `${joinId}-guest`,
    roomId,
    sessionId,
    displayName: "Soak Guest",
  });
  if (joined?.status !== "spectating") {
    throw new Error(`join expected spectating: ${JSON.stringify(joined)}`);
  }

  const left = await callAs(functions, "gameLeavePublicTable", {});
  if (!left?.cleared) {
    throw new Error(`leave expected cleared:true: ${JSON.stringify(left)}`);
  }

  const leftAgain = await callAs(functions, "gameLeavePublicTable", {});
  if (leftAgain?.cleared !== false) {
    throw new Error(
      `idempotent leave expected cleared:false: ${JSON.stringify(leftAgain)}`,
    );
  }

  const verifyErrors = await verifyPostLeave(db, auth, {
    guestUid,
    roomId,
    sessionId,
  });
  if (verifyErrors.length) {
    throw new Error(verifyErrors.join("; "));
  }

  await signOut(auth);

  return { joinId, roomId, sessionId, hostUid, guestUid };
}

async function main() {
  const opts = parseArgs(process.argv);
  const hostEmail = requireEnv("SOAK_HOST_EMAIL");
  const hostPassword = requireEnv("SOAK_HOST_PASSWORD");
  const guestEmail = requireEnv("SOAK_GUEST_EMAIL");
  const guestPassword = requireEnv("SOAK_GUEST_PASSWORD");

  const csvPath = ensureLogHeader(opts.logCsv);
  const { auth, functions, db } = initFirebase();
  const startedAt = Date.now();
  const endCycle = opts.startCycle + opts.cycles - 1;

  console.log(
    `[soak] back-to-back cycles ${opts.startCycle}..${endCycle} (delay ${opts.delayMs}ms, stop-on-fail=${opts.stopOnFail})`,
  );

  let failures = 0;
  let passes = 0;
  for (let i = 0; i < opts.cycles; i += 1) {
    const cycle = opts.startCycle + i;
    const timestamp = new Date().toISOString();
    const row = {
      timestamp,
      cycle,
      pass: false,
      roomId: "",
      sessionId: "",
      joinId: "",
      hostUid: "",
      guestUid: "",
      error: "",
    };

    try {
      const result = await runOneCycle({
        cycle,
        auth,
        functions,
        db,
        hostEmail,
        hostPassword,
        guestEmail,
        guestPassword,
      });
      row.pass = true;
      row.roomId = result.roomId;
      row.sessionId = result.sessionId;
      row.joinId = result.joinId;
      row.hostUid = result.hostUid;
      row.guestUid = result.guestUid;
      passes += 1;
      console.log(`[soak] cycle ${cycle} PASS room=${result.roomId}`);
    } catch (err) {
      failures += 1;
      row.error = err?.message ?? String(err);
      console.error(`[soak] cycle ${cycle} FAIL: ${row.error}`);
    }

    appendCsvRow(csvPath, row);
    if (opts.logMd) appendMarkdownRow(opts.logMd, row);

    if (opts.stopOnFail && failures > 0) {
      console.error(`[soak] stopping after cycle ${cycle} failure`);
      break;
    }

    if (i < opts.cycles - 1 && opts.delayMs > 0) {
      await sleep(opts.delayMs);
    }
  }

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(
    `[soak] done. log=${csvPath} pass=${passes} fail=${failures} elapsed=${elapsedSec}s`,
  );
  if (failures > 0) process.exit(1);
}

main().catch((err) => {
  console.error("[soak] fatal:", err?.message ?? err);
  process.exit(1);
});
