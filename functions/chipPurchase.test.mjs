/**
 * Chip purchase grant handler tests (dev verification path).
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  handleGrantChipPurchase,
  CHIP_PURCHASE_GRANTS_COLLECTION,
} from "./chipPurchase.js";
import { getChipPackById } from "./vendor/chip-packs.js";

const PROJECT_ID = "demo-national-bourre-league";
const ROOM_ID = "chip_purchase_room";
const SESSION_ID = "chip_purchase_session";
const PLAYER_ID = "chip_purchase_player";

let db;
let emulatorAvailable = false;

before(async () => {
  process.env.CHIP_PURCHASE_ALLOW_DEV_VERIFY = "true";
  process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = "true";
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8088";
  }
  try {
    if (!getApps().length) initializeApp({ projectId: PROJECT_ID });
    db = getFirestore();
    await db.collection("_ping").doc("chip-purchase").set({ ok: true });
    emulatorAvailable = true;
  } catch {
    emulatorAvailable = false;
  }
});

after(async () => {
  delete process.env.CHIP_PURCHASE_ALLOW_DEV_VERIFY;
});

async function seedSession(bankroll = 0) {
  await db.collection("rooms").doc(ROOM_ID).set({
    ownerId: PLAYER_ID,
    name: "Chip test",
    bourreSettings: { buyInAmount: 1000, rebuyEnabled: true },
  });
  await db.collection("rooms").doc(ROOM_ID).collection("sessions").doc(SESSION_ID).set({
    roomId: ROOM_ID,
    status: "in_progress",
    handCount: 2,
    buyInAmount: 1000,
    moneyEngineVersion: 1,
    moneySequence: 0,
    players: [{ playerId: PLAYER_ID, displayName: "Buyer" }],
  });
  await db
    .collection("rooms")
    .doc(ROOM_ID)
    .collection("sessions")
    .doc(SESSION_ID)
    .collection("scores")
    .doc(PLAYER_ID)
    .set({
      playerId: PLAYER_ID,
      displayName: "Buyer",
      bankroll,
      out: true,
      net: -bankroll,
    });
}

async function clearFixtures() {
  const grantSnap = await db.collection(CHIP_PURCHASE_GRANTS_COLLECTION).get();
  const batch = db.batch();
  grantSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  await db.recursiveDelete(db.collection("rooms").doc(ROOM_ID));
}

describe("handleGrantChipPurchase", () => {
  it("grants chips once for verified dev purchase", async (t) => {
    if (!emulatorAvailable) {
      t.skip("Firestore emulator not running");
      return;
    }
    await clearFixtures();
    await seedSession(0);

    const pack = getChipPackById("starter");
    const token = `dev-verify:starter:test-${Date.now()}`;
    const first = await handleGrantChipPurchase(db, {
      actorId: PLAYER_ID,
      roomId: ROOM_ID,
      sessionId: SESSION_ID,
      packId: pack.id,
      platform: "dev",
      productId: pack.storeProductId,
      purchaseToken: token,
    });

    assert.equal(first.status, "granted");
    assert.equal(first.chipsGranted, pack.chips);

    const score = await db
      .collection("rooms")
      .doc(ROOM_ID)
      .collection("sessions")
      .doc(SESSION_ID)
      .collection("scores")
      .doc(PLAYER_ID)
      .get();
    assert.equal(score.data().bankroll, pack.chips);
    assert.equal(score.data().out, undefined);

    const second = await handleGrantChipPurchase(db, {
      actorId: PLAYER_ID,
      roomId: ROOM_ID,
      sessionId: SESSION_ID,
      packId: pack.id,
      platform: "dev",
      productId: pack.storeProductId,
      purchaseToken: token,
    });
    assert.equal(second.status, "already_granted");
    assert.equal(second.chipsGranted, pack.chips);
    assert.equal(second.bankroll, pack.chips);
  });
});
