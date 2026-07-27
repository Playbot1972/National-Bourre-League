import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rosterPlayerOrder, sortMergedRosterForDisplay } from "../docs/table-roster-order.js";

function sortScoresForDisplay(scores, players = []) {
  const order = new Map(players.map((p, i) => [p.playerId, i]));
  return [...scores].sort((a, b) => {
    const ai = order.has(a.playerId) ? order.get(a.playerId) : 999;
    const bi = order.has(b.playerId) ? order.get(b.playerId) : 999;
    if (ai !== bi) return ai - bi;
    return (a.displayName || "").localeCompare(b.displayName || "");
  });
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appSrc = readFileSync(join(root, "docs/app.js"), "utf8");

describe("rosterPlayerOrder", () => {
  it("preserves room member join order for two live players", () => {
    const order = rosterPlayerOrder(
      [
        { userId: "host_uid", displayName: "Zara" },
        { userId: "guest_uid", displayName: "Alex" },
      ],
      [{ playerId: "guest_uid" }, { playerId: "host_uid" }],
    );
    assert.deepEqual(order, [{ playerId: "host_uid" }, { playerId: "guest_uid" }]);
  });

  it("falls back to session.players when members are absent", () => {
    const order = rosterPlayerOrder([], [{ playerId: "p1" }, { playerId: "p2" }]);
    assert.deepEqual(order, [{ playerId: "p1" }, { playerId: "p2" }]);
  });
});

describe("sortMergedRosterForDisplay", () => {
  it("does not reorder two humans when score snapshots arrive alphabetically", () => {
    const scores = [
      { playerId: "guest_uid", displayName: "Alex" },
      { playerId: "host_uid", displayName: "Zara" },
    ];
    const members = [
      { userId: "host_uid", displayName: "Zara" },
      { userId: "guest_uid", displayName: "Alex" },
    ];
    const sorted = sortMergedRosterForDisplay(scores, members, [], sortScoresForDisplay);
    assert.deepEqual(
      sorted.map((s) => s.playerId),
      ["host_uid", "guest_uid"],
    );
  });

  it("stays stable when only the host has a score row initially", () => {
    const hostOnly = [{ playerId: "host_uid", displayName: "Zara" }];
    const members = [
      { userId: "host_uid", displayName: "Zara" },
      { userId: "guest_uid", displayName: "Alex" },
    ];
    const mergedHostOnly = sortMergedRosterForDisplay(hostOnly, members, [], sortScoresForDisplay);
    assert.deepEqual(mergedHostOnly.map((s) => s.playerId), ["host_uid"]);

    const bothScores = [
      { playerId: "guest_uid", displayName: "Alex" },
      { playerId: "host_uid", displayName: "Zara" },
    ];
    const mergedBoth = sortMergedRosterForDisplay(bothScores, members, [], sortScoresForDisplay);
    assert.deepEqual(mergedBoth.map((s) => s.playerId), ["host_uid", "guest_uid"]);
  });
});

describe("Play transition guards (app.js wiring)", () => {
  it("promotes table URL when overlay is open instead of tearing down", () => {
    assert.match(appSrc, /tablePlayOpen && !tableOpen[\s\S]*navigateToRoomTable/);
    assert.doesNotMatch(
      appSrc,
      /if \(tablePlayOpen\) \{\s*teardownTableOverlay\(\{ restoreDetail: false \}\)/,
    );
  });

  it("navigates to table hash before async enrollment", () => {
    assert.match(appSrc, /tablePlayOpen = true[\s\S]*navigateToRoomTable\(currentRoomId/);
  });

  it("uses member-count fallback while table play is opening", () => {
    assert.match(appSrc, /function effectiveTablePlayerCount/);
    assert.match(appSrc, /effectiveTablePlayerCount\(sessionObj\) < 2/);
  });

  it("sorts setup roster with rosterPlayerOrder", () => {
    assert.match(appSrc, /sortScoresForDisplay\([\s\S]*rosterPlayerOrder\(currentMembers/);
  });
});
