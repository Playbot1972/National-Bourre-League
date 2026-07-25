#!/usr/bin/env node
/**
 * CI smoke: confirm Functions emulator + publicTableIndex rebuild after Play Now callable.
 *
 * Uses firebase-admin from functions/ (bypasses rules; matches production index writes).
 */
import { execSync, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CALLABLE_PROBE = String.raw`
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";

const projectId = process.env.SMOKE_PROJECT_ID;
const app = initializeApp({ apiKey: "fake", projectId });
const auth = getAuth(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8088);
const functions = getFunctions(app);
connectFunctionsEmulator(functions, "127.0.0.1", 5001);

const email = "idx-smoke-" + Date.now() + "@test.com";
await createUserWithEmailAndPassword(auth, email, "TestPass123!");
const fn = httpsCallable(functions, "gameFindOrCreatePublicTable");
const joinId = "join-" + Date.now();
const { data: result } = await fn({
  joinId,
  displayName: "Smoke Host",
  targetSeatCount: 6,
  queueMode: "mixed",
  buyInAmount: 100,
  anteAmount: 5,
});
if (!result?.roomId || !result?.sessionId) {
  console.error("[smoke-public-table] callable missing room/session", JSON.stringify(result));
  process.exit(1);
}
console.log(JSON.stringify({ roomId: result.roomId, sessionId: result.sessionId }));
`;

const ADMIN_COUNT = String.raw`
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.SMOKE_PROJECT_ID;
const roomId = process.env.SMOKE_ROOM_ID;
const sessionId = process.env.SMOKE_SESSION_ID;
const key = roomId + "_" + sessionId;

initializeApp({ projectId });
const db = getFirestore();
const listSnap = await db.collection("publicTableIndex").get();
const docSnap = await db.collection("publicTableIndex").doc(key).get();
console.log("[smoke-public-table] callable ok", JSON.stringify({ roomId, sessionId }));
console.log("[smoke-public-table] index doc exists=" + docSnap.exists + " listCount=" + listSnap.size);
if (!docSnap.exists || listSnap.size < 1) {
  console.error("[smoke-public-table] FAIL — publicTableIndex missing after create");
  process.exit(1);
}
console.log("[smoke-public-table] PASS");
`;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FUNCTIONS_DIR = join(ROOT, "functions");
const PROJECT_ID = "demo-national-bourre-league";

const flag = process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED ?? "(unset)";
console.log(`[smoke-public-table] MIXED_PUBLIC_TABLES_SERVER_ENABLED=${flag}`);

const maxAttempts = Number(process.env.SMOKE_PUBLIC_TABLE_ATTEMPTS ?? "30");
let lastStdout = "";
let lastStderr = "";
let roomId = "";
let sessionId = "";

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const callableProbe = spawnSync(
    "node",
    ["--input-type=module", "-e", CALLABLE_PROBE],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8088",
        SMOKE_PROJECT_ID: PROJECT_ID,
      },
      encoding: "utf8",
    },
  );

  lastStdout = callableProbe.stdout ?? "";
  lastStderr = callableProbe.stderr ?? "";

  if (callableProbe.status === 0) {
    ({ roomId, sessionId } = JSON.parse(lastStdout.trim()));
    break;
  }

  const retryable =
    lastStderr.includes("functions/not-found") ||
    lastStderr.includes("ECONNREFUSED") ||
    lastStderr.includes("connect ECONNREFUSED");
  if (!retryable || attempt === maxAttempts) {
    process.stdout.write(lastStdout);
    process.stderr.write(lastStderr);
    process.exit(callableProbe.status ?? 1);
  }

  console.log(
    `[smoke-public-table] waiting for Functions emulator (attempt ${attempt}/${maxAttempts})`,
  );
  execSync("sleep 2");
}

const adminCount = spawnSync(
  "node",
  ["--input-type=module", "-e", ADMIN_COUNT],
  {
    cwd: FUNCTIONS_DIR,
    env: {
      ...process.env,
      FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8088",
      SMOKE_PROJECT_ID: PROJECT_ID,
      SMOKE_ROOM_ID: roomId,
      SMOKE_SESSION_ID: sessionId,
    },
    encoding: "utf8",
  },
);

process.stdout.write(adminCount.stdout ?? "");
process.stderr.write(adminCount.stderr ?? "");
process.exit(adminCount.status ?? 1);
