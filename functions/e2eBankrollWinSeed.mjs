#!/usr/bin/env node
/**
 * Emulator seed for Playwright clean-win bankroll E2E.
 *
 * Usage (from functions/):
 *   node e2eBankrollWinSeed.mjs <hostUid>
 */

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { baselineDocFromBaseline, initialSessionBaseline } from "../docs/money-persistence.js";

const PROJECT = "demo-national-bourre-league";
const ROOM = "e2e_win_room";
const SESSION = "e2e_win_session";
const BUY_IN = 100;
const ANTE = 20;
const BOT_ID = "bot_1";

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8088";
}
if (!getApps().length) {
  initializeApp({ projectId: PROJECT });
}
const db = getFirestore();

async function main() {
  const hostUid = process.argv[2];
  if (!hostUid) {
    console.error("Usage: node e2eBankrollWinSeed.mjs <hostUid>");
    process.exit(2);
  }

  const ids = [hostUid, BOT_ID];

  await db.collection("rooms").doc(ROOM).set({
    inviteCode: "E2E-WIN",
    ownerId: hostUid,
    name: "Bankroll Win E2E",
    status: "active",
    bourreSettings: { buyInAmount: BUY_IN, anteAmount: ANTE },
    createdAt: FieldValue.serverTimestamp(),
  });

  await db.collection("roomMembers").doc(`${ROOM}_${hostUid}`).set({
    roomId: ROOM,
    userId: hostUid,
    displayName: "Bankroll Host",
    role: "owner",
    joinedAt: FieldValue.serverTimestamp(),
  });

  for (const uid of ids) {
    const isBot = uid === BOT_ID;
    await db
      .collection("rooms")
      .doc(ROOM)
      .collection("sessions")
      .doc(SESSION)
      .collection("scores")
      .doc(uid)
      .set({
        sessionId: SESSION,
        roomId: ROOM,
        playerId: uid,
        displayName: isBot ? "Bot Alpha" : "Bankroll Host",
        bankroll: BUY_IN,
        tricksWon: 0,
        handsWon: 0,
        net: 0,
        total: 0,
        isRobot: isBot,
        updatedAt: FieldValue.serverTimestamp(),
      });
  }

  await db
    .collection("rooms")
    .doc(ROOM)
    .collection("sessions")
    .doc(SESSION)
    .set({
      roomId: ROOM,
      sessionName: "Win E2E Table",
      status: "in_progress",
      handCount: 0,
      handStake: ANTE,
      handStakeLocked: false,
      limEnabled: false,
      carryOverPot: 0,
      moneyEngineVersion: "v1",
      moneySequence: 0,
      moneyLedgerBaseline: baselineDocFromBaseline(initialSessionBaseline(ids.length, BUY_IN)),
      dealerId: hostUid,
      players: [
        { playerId: hostUid, displayName: "Bankroll Host" },
        { playerId: BOT_ID, displayName: "Bot Alpha" },
      ],
      tableOptInIds: ids,
      currentHand: { phase: null, participantIds: [], seatedIds: [], tricksByPlayer: {} },
      totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
      rounds: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  console.log(
    JSON.stringify({
      roomId: ROOM,
      sessionId: SESSION,
      hostUid,
      botId: BOT_ID,
      expected: { buyIn: BUY_IN, ante: ANTE },
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
