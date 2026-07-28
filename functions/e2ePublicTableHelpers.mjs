#!/usr/bin/env node
/**
 * Emulator helpers for Playwright public-table e2e (run from functions/).
 *
 *   node e2ePublicTableHelpers.mjs patch <roomId> <sessionId> '<json>'
 *   node e2ePublicTableHelpers.mjs apply-replacements <roomId> <sessionId>
 */

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { applyPendingReplacements } from "./publicTableReplacement.js";

const [command, roomId, sessionId, jsonArg] = process.argv.slice(2);
if (!command || !roomId || !sessionId) {
  console.error(
    "Usage: node e2ePublicTableHelpers.mjs <patch|apply-replacements> <roomId> <sessionId> [json]",
  );
  process.exit(2);
}

process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = "true";
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8088";
}
if (!getApps().length) {
  initializeApp({ projectId: "demo-national-bourre-league" });
}
const db = getFirestore();

if (command === "patch") {
  if (!jsonArg) {
    console.error("patch requires currentHand JSON");
    process.exit(2);
  }
  let currentHand;
  try {
    currentHand = JSON.parse(jsonArg);
  } catch {
    console.error("Invalid JSON for currentHand");
    process.exit(2);
  }
  await db
    .collection("rooms")
    .doc(roomId)
    .collection("sessions")
    .doc(sessionId)
    .update({ currentHand });
  console.log(JSON.stringify({ ok: true }));
  process.exit(0);
}

if (command === "apply-replacements") {
  const roomSnap = await db.collection("rooms").doc(roomId).get();
  const sessionSnap = await db.collection("rooms").doc(roomId).collection("sessions").doc(sessionId).get();
  if (!roomSnap.exists || !sessionSnap.exists) {
    console.error("room or session not found");
    process.exit(1);
  }
  const result = await applyPendingReplacements(db, {
    roomId,
    sessionId,
    roomData: roomSnap.data(),
    sessionData: sessionSnap.data(),
  });
  console.log(JSON.stringify(result));
  process.exit(result.status === "applied" ? 0 : 1);
}

console.error(`Unknown command: ${command}`);
process.exit(2);
