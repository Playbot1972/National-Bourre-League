/**
 * Recon: why the watch-only "bot in card area" is consistently the last bot.
 * Proves seat-order + seat-layout index mapping — not turn/timer or duplicate render.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { orderPlayersForTable } from "./seatOrder";
import { resolveMobileOpponentLayout, resolveSeatLayout } from "./seatLayout";

function mixedTable(nBots: number) {
  const host = "host";
  const bots = Array.from({ length: nBots }, (_, i) => `bot_${i + 1}`);
  const seatedIds = [host, ...bots];
  const players = seatedIds.map((id) => ({
    playerId: id,
    displayName: id,
    handsWon: 0,
    inHand: true,
    tricksThisHand: 0,
    isSelf: false,
    isDealer: id === "bot_1",
    isWinner: false,
    canToggleInHand: false,
    canEditTricks: false,
  }));
  const session = {
    dealerId: "bot_1",
    participantIds: seatedIds,
    handEnrollment: null,
    seatedIds,
  };
  const ordered = orderPlayersForTable(players, session, "spectator_uid").map(
    (p) => p.playerId,
  );
  const lastBot = [...ordered].reverse().find((id) => id.startsWith("bot_"))!;
  return { seatedIds, ordered, lastBot, total: ordered.length };
}

function isCenterAdjacent(x: number, y: number, region: string): boolean {
  const sideMidRail =
    (region === "left" || region === "right") && y >= 36 && y <= 52;
  const bottomCenter = Math.abs(x - 50) < 8 && y >= 36 && y <= 58;
  return sideMidRail || bottomCenter;
}

describe("spectator last-bot overlap recon", () => {
  it("4p desktop: last bot maps to right mid-rail overlap slot (index 3)", () => {
    const { ordered, lastBot, total } = mixedTable(3);
    assert.deepEqual(ordered, ["host", "bot_1", "bot_2", "bot_3"]);
    assert.equal(lastBot, "bot_3");
    assert.equal(ordered.indexOf(lastBot), total - 1);

    const layout = resolveSeatLayout(total - 1, total, {
      isMobile: false,
      isSelf: false,
      spectatorView: false,
    });
    assert.equal(layout.region, "right");
    assert.ok(Math.abs(layout.y - 50) < 1);
    assert.ok(isCenterAdjacent(layout.x, layout.y, layout.region));
  });

  it("mobile watch-only: last bot always lands bottom-center (seatIndex overflow)", () => {
    for (const nBots of [1, 2, 3, 4, 5, 6, 7]) {
      const { ordered, lastBot, total } = mixedTable(nBots);
      const lastOppIdx = ordered.indexOf(lastBot);
      assert.equal(lastOppIdx, total - 1);

      const layout = resolveMobileOpponentLayout(lastOppIdx, total, "portrait", false);
      assert.equal(layout.seatIndex, total, `n=${total}: last bot uses seatIndex ${total}`);
      assert.ok(
        isCenterAdjacent(layout.x, layout.y, layout.region),
        `n=${total}: last bot ${lastBot} at (${layout.x},${layout.y}) ${layout.region}`,
      );
    }
  });

  it("seatedIds join order is preserved in ring and rotated array", () => {
    const { seatedIds, ordered } = mixedTable(3);
    assert.deepEqual(seatedIds, ["host", "bot_1", "bot_2", "bot_3"]);
    assert.deepEqual(ordered, seatedIds);
  });
});
