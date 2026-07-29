/**
 * Delete-room idempotency guards — source regression checks.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("delete room false-error guards", () => {
  const appSrc = readFileSync(
    fileURLToPath(new URL("../docs/app.js", import.meta.url)),
    "utf8",
  );
  const firestoreSrc = readFileSync(
    fileURLToPath(new URL("../docs/firestore.js", import.meta.url)),
    "utf8",
  );

  it("onDeleteRoom guards duplicate in-flight deletes", () => {
    assert.ok(appSrc.includes("let deleteRoomInFlight = null"));
    assert.ok(appSrc.includes("if (deleteRoomInFlight === roomId) return"));
    assert.ok(appSrc.includes("deleteRoomInFlight = roomId"));
  });

  it("onDeleteRoom suppresses room-gone handler during intentional delete", () => {
    const block = appSrc.slice(appSrc.indexOf("async function onDeleteRoom"), appSrc.indexOf("const createRoomModal"));
    assert.ok(block.includes("roomGoneHandled = true"));
  });

  it("deleteRoom treats permission-denied getDoc as idempotent cleanup", () => {
    const block = firestoreSrc.slice(
      firestoreSrc.indexOf("export async function deleteRoom"),
      firestoreSrc.indexOf("export async function updateRoomStatus"),
    );
    assert.ok(block.includes('err?.code === "permission-denied"'));
    assert.ok(block.includes("await leaveRoom(roomId, user)"));
    assert.ok(!block.includes('throw new Error("Only the room owner can delete this room. Try Leave instead.")'));
  });
});
