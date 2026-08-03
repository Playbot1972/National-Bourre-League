import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("HeroHand shows loading before auth is ready", () => {
  const src = readFileSync(new URL("./HeroHand.tsx", import.meta.url), "utf8");
  assert.match(src, /if \(!authReady\) \{[\s\S]*Loading your hand/);
  const authReadyIdx = src.indexOf("if (!authReady)");
  const signedInIdx = src.indexOf("if (!signedIn)");
  assert.ok(authReadyIdx >= 0 && signedInIdx >= 0);
  assert.ok(authReadyIdx < signedInIdx, "authReady guard must precede signedIn guard");
});

test("CardTable derives signedIn from authSignedIn not watchOnly currentUserId", () => {
  const cardTable = readFileSync(new URL("./CardTable.tsx", import.meta.url), "utf8");
  assert.match(cardTable, /signedIn=\{authSignedIn \?\? Boolean\(currentUserId\)\}/);
  const appJs = readFileSync(new URL("../../docs/app.js", import.meta.url), "utf8");
  assert.match(appJs, /currentUserId: myUid/);
  assert.doesNotMatch(
    appJs.slice(appJs.indexOf("function buildTableSessionProps"), appJs.indexOf("function maybeLogHandTransitionSnapshot")),
    /currentUserId: watchOnly \? null : myUid/,
  );
});
