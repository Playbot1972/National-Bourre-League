/**
 * Firestore startup gate — auth timing + subscription error handling.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("firestore startup gate", () => {
  const appSrc = readFileSync(fileURLToPath(new URL("../docs/app.js", import.meta.url)), "utf8");
  const firestoreSrc = readFileSync(
    fileURLToPath(new URL("../docs/firestore.js", import.meta.url)),
    "utf8",
  );
  const authSrc = readFileSync(fileURLToPath(new URL("../docs/auth.js", import.meta.url)), "utf8");

  it("exports whenAuthReady from auth.js", () => {
    assert.ok(authSrc.includes("export function whenAuthReady()"));
    assert.ok(authSrc.includes("auth.authStateReady()"));
  });

  it("ensureUserDoc requires uid and logs structured errors", () => {
    assert.ok(firestoreSrc.includes("if (!user?.uid)"));
    assert.ok(firestoreSrc.includes('logFirestoreError("set", path, err'));
  });

  it("subscribeMyRooms guards uid and registers onSnapshot error handler", () => {
    assert.ok(firestoreSrc.includes("subscribeMyRooms(uid, callback, onError)"));
    assert.ok(firestoreSrc.includes('logFirestoreError("listen", listenPath, err'));
    assert.ok(firestoreSrc.includes('logFirestoreError("get", roomPath, err'));
  });

  it("subscribeLeaderboard registers onSnapshot error handler", () => {
    assert.ok(firestoreSrc.includes("subscribeLeaderboard(callback, onError)"));
    assert.ok(firestoreSrc.includes('logFirestoreError("listen", listenPath, err'));
  });

  it("startRoomsSubscription waits for auth before Firestore", () => {
    assert.ok(appSrc.includes("await whenAuthReady()"));
    assert.ok(appSrc.includes("async function startRoomsSubscription()"));
    assert.match(appSrc, /if \(!uid\) return/);
    assert.ok(appSrc.includes("void startRoomsSubscription()"));
  });

  it("does not eagerly bootstrap Firestore from currentUser() at module load", () => {
    assert.equal(appSrc.includes("setSession(currentUser())"), false);
    assert.equal(
      /if \(session\) \{\s*startRoomsSubscription\(\)/.test(appSrc),
      false,
    );
  });

  it("surfaces permission-denied distinctly in subscription errors", () => {
    assert.ok(appSrc.includes("describeFirestoreSubscriptionError"));
    assert.ok(appSrc.includes("isPermissionDenied(err)"));
    assert.ok(appSrc.includes("permission denied"));
  });
});
