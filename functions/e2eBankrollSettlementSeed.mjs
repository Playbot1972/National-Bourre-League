#!/usr/bin/env node
/**
 * Emulator seed for Playwright bourré settlement hybrid test.
 * Mirrors scripts/live-emulator-settlement-trace.mjs single-bourre fixture.
 *
 * Usage (from functions/):
 *   node e2eBankrollSettlementSeed.mjs <hostUid>
 *
 * stdout: JSON { roomId, sessionId, ids, expected }
 */

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { baselineDocFromBaseline, initialSessionBaseline } from "../docs/money-persistence.js";

const PROJECT = "demo-national-bourre-league";
const ROOM = "e2e_bourre_room";
const SESSION = "e2e_bourre_session";
const BUY_IN = 1000;
const ANTE = 1;
const CARRY_IN = 0;

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8088";
}
if (!getApps().length) {
  initializeApp({ projectId: PROJECT });
}
const db = getFirestore();

async function authSignUp(email) {
  const res = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: "test-pass-123",
        returnSecureToken: true,
      }),
    },
  );
  if (!res.ok) throw new Error(`Auth signUp failed: ${await res.text()}`);
  const data = await res.json();
  return { uid: data.localId, idToken: data.idToken };
}

async function main() {
  const hostUid = process.argv[2];
  if (!hostUid) {
    console.error("Usage: node e2eBankrollSettlementSeed.mjs <hostUid>");
    process.exit(2);
  }

  const stamp = Date.now();
  const p2 = await authSignUp(`e2e-bourre-p2-${stamp}@test.local`);
  const p3 = await authSignUp(`e2e-bourre-p3-${stamp}@test.local`);
  const p4 = await authSignUp(`e2e-bourre-p4-${stamp}@test.local`);

  const ids = {
    HOST: hostUid,
    P2: p2.uid,
    P3: p3.uid,
    P4: p4.uid,
  };
  const ALL = [ids.HOST, ids.P2, ids.P3, ids.P4];
  const ACTIVE = [ids.HOST, ids.P2, ids.P3];
  const tricksByPlayer = { [ids.HOST]: 3, [ids.P2]: 2, [ids.P3]: 0 };
  const postedAntes = { [ids.HOST]: ANTE, [ids.P2]: ANTE, [ids.P3]: ANTE };

  const roomRef = db.collection("rooms").doc(ROOM);
  const sessionRef = roomRef.collection("sessions").doc(SESSION);

  await roomRef.set({
    inviteCode: "E2E-BR",
    ownerId: ids.HOST,
    name: "E2E Bourré Settlement",
    status: "active",
    bourreSettings: { buyInAmount: BUY_IN, anteAmount: ANTE },
    createdAt: FieldValue.serverTimestamp(),
  });

  const hostBankroll = BUY_IN - ANTE;
  const p2Bankroll = BUY_IN - ANTE;
  const p3Bankroll = BUY_IN - ANTE;
  const p4Bankroll = BUY_IN;

  for (const uid of ALL) {
    const bankroll =
      uid === ids.P4 ? p4Bankroll : uid === ids.HOST ? hostBankroll : uid === ids.P2 ? p2Bankroll : p3Bankroll;
    await db.collection("roomMembers").doc(`${ROOM}_${uid}`).set({
      roomId: ROOM,
      userId: uid,
      displayName: uid,
      role: uid === ids.HOST ? "owner" : "player",
      joinedAt: FieldValue.serverTimestamp(),
    });
    await sessionRef.collection("scores").doc(uid).set({
      sessionId: SESSION,
      roomId: ROOM,
      playerId: uid,
      displayName: uid,
      bankroll: bankroll,
      tricksWon: 0,
      handsWon: 0,
      net: bankroll - BUY_IN,
      total: 0,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await sessionRef.set({
    roomId: ROOM,
    sessionName: "E2E Bourré",
    status: "in_progress",
    handCount: 0,
    handStake: ANTE,
    handStakeLocked: false,
    limEnabled: false,
    carryOverPot: CARRY_IN,
    moneyEngineVersion: "v1",
    moneySequence: 0,
    moneyLedgerBaseline: baselineDocFromBaseline(initialSessionBaseline(ALL.length, BUY_IN)),
    dealerId: ids.HOST,
    players: ALL.map((id) => ({ playerId: id, displayName: id })),
    currentHand: {
      phase: "play",
      participantIds: ACTIVE,
      seatedIds: ALL,
      dealerId: ids.HOST,
      tricksByPlayer,
      postedAntes,
    },
    totals: { byPlayer: {}, netByPlayer: {}, tricks: 0 },
    rounds: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const settledPot = CARRY_IN + 3 * ANTE;
  const payload = {
    roomId: ROOM,
    sessionId: SESSION,
    ids,
    tricksByPlayer,
    participantIds: ACTIVE,
    postedAntes,
    expected: {
      buyIn: BUY_IN,
      ante: ANTE,
      carryIn: CARRY_IN,
      settledPot,
      bourrePlayerId: ids.P3,
      foldedPlayerId: ids.P4,
      nextDealPosted: {
        [ids.HOST]: ANTE,
        [ids.P2]: ANTE,
        [ids.P3]: 0,
        [ids.P4]: ANTE,
      },
    },
  };
  console.log(JSON.stringify(payload));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
