/**
 * Post-create invite lookup repair — no redundant rooms/{id} read when hints exist.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("firestore invite lookup repair", () => {
  const firestoreSrc = readFileSync(
    fileURLToPath(new URL("../docs/firestore.js", import.meta.url)),
    "utf8",
  );
  const appSrc = readFileSync(
    fileURLToPath(new URL("../docs/app.js", import.meta.url)),
    "utf8",
  );

  it("createRoom does not call ensureInviteLookupForRoom after batch commit", () => {
    const createBlock = firestoreSrc.slice(
      firestoreSrc.indexOf("export async function createRoom"),
      firestoreSrc.indexOf("async function writeInviteLookup"),
    );
    assert.equal(createBlock.includes("ensureInviteLookupForRoom"), false);
    assert.ok(createBlock.includes('batch.set(doc(db, "inviteLookups"'));
  });

  it("ensureInviteLookupForRoom accepts inviteCode + ownerId hints", () => {
    assert.ok(firestoreSrc.includes("export async function ensureInviteLookupForRoom(roomId, hint = {})"));
    assert.ok(firestoreSrc.includes("hint.inviteCode"));
    assert.ok(firestoreSrc.includes("hint.ownerId"));
    assert.ok(firestoreSrc.includes("await whenAuthReady()"));
  });

  it("callers pass room hints to skip redundant getDoc", () => {
    assert.ok(
      appSrc.includes("ensureInviteLookupForRoom(r.id, {\n            inviteCode: r.inviteCode"),
    );
    assert.ok(
      appSrc.includes("ensureInviteLookupForRoom(roomId, {\n          inviteCode: room.inviteCode"),
    );
  });

  it("subscribeRoom registers onSnapshot error handler", () => {
    assert.ok(firestoreSrc.includes("export function subscribeRoom(roomId, callback, onError)"));
    assert.ok(firestoreSrc.includes('logFirestoreError("listen", roomPath, err'));
  });
});
