/**
 * Auto-deal session hand reference + attemptAutoDeal gate tests.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  resolveSessionHandRef,
  validateSessionHandIds,
} from "../docs/session-hand-ref.js";

describe("session hand ref", () => {
  it("accepts valid room/session ids and path", () => {
    const ids = validateSessionHandIds("room_abc", "session_xyz");
    assert.deepEqual(ids, {
      roomId: "room_abc",
      sessionId: "session_xyz",
      path: "rooms/room_abc/sessions/session_xyz",
    });
  });

  it("rejects missing or slash-containing ids", () => {
    assert.equal(validateSessionHandIds("", "s1"), null);
    assert.equal(validateSessionHandIds("r1", ""), null);
    assert.equal(validateSessionHandIds("room/x", "s1"), null);
    assert.equal(validateSessionHandIds(null, "s1"), null);
  });

  it("resolves Firestore DocumentReference when path matches", () => {
    const resolved = resolveSessionHandRef("room1", "sess2", (roomId, sessionId) => ({
      path: `rooms/${roomId}/sessions/${sessionId}`,
    }));
    assert.ok(resolved);
    assert.equal(resolved.path, "rooms/room1/sessions/sess2");
  });

  it("rejects handRef with missing or mismatched path", () => {
    assert.equal(
      resolveSessionHandRef("room1", "sess2", () => ({ path: "" })),
      null,
    );
    assert.equal(
      resolveSessionHandRef("room1", "sess2", () => ({ path: "rooms/other/sessions/sess2" })),
      null,
    );
    assert.equal(resolveSessionHandRef("room1", "sess2", () => null), null);
  });
});

describe("attemptAutoDeal wiring", () => {
  const firestoreSrc = readFileSync(
    fileURLToPath(new URL("../docs/firestore.js", import.meta.url)),
    "utf8",
  );

  it("guards invalid handRef before deal work", () => {
    assert.ok(firestoreSrc.includes("Invalid handRef passed to attemptAutoDeal"));
    assert.ok(firestoreSrc.includes("resolveSessionHandRef(roomId, sessionId, sessionDoc)"));
  });

  it("uses server deal first when SERVER_HAND_AUTHORITY is enabled", () => {
    const idx = firestoreSrc.indexOf("async function attemptAutoDeal");
    const body = firestoreSrc.slice(idx, idx + 2200);
    const serverIdx = body.indexOf("gameEnsureHandEnrollment");
    const clientIdx = body.indexOf("ensureHandEnrollmentClient");
    assert.ok(serverIdx >= 0 && clientIdx >= 0);
    assert.ok(serverIdx < clientIdx, "server enrollment must run before client deal");
  });

  it("writes hand ledger with deterministic handNumber doc id", () => {
    assert.ok(firestoreSrc.includes("handDoc(roomId, sessionId, handNumber)"));
    assert.equal(firestoreSrc.includes("doc(handsCol(roomId, sessionId))"), false);
  });

  it("ensureHandEnrollment validates hand ref before prepare", () => {
    assert.ok(firestoreSrc.includes("invalid-hand-ref"));
    const idx = firestoreSrc.indexOf("export async function ensureHandEnrollment");
    const body = firestoreSrc.slice(idx, idx + 600);
    assert.ok(body.indexOf("resolveSessionHandRef") < body.indexOf("prepareSessionForTableOpen"));
  });
});
