import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { seatPosition } from "../logic";
import { orderPlayersForTable } from "./seatOrder";
import type { TablePlayer } from "../types";

describe("seat order", () => {
  it("keeps 6-bot table in dealer-relative order with hero at bottom", () => {
    const players: TablePlayer[] = [
      { playerId: "human", displayName: "You", handsWon: 0, inHand: true, tricksThisHand: 0, isSelf: true, isDealer: false, isWinner: false, canToggleInHand: false, canEditTricks: false },
      { playerId: "bot_1", displayName: "Bot 1", handsWon: 0, inHand: true, tricksThisHand: 0, isSelf: false, isDealer: true, isWinner: false, canToggleInHand: false, canEditTricks: false },
      { playerId: "bot_2", displayName: "Bot 2", handsWon: 0, inHand: true, tricksThisHand: 0, isSelf: false, isDealer: false, isWinner: false, canToggleInHand: false, canEditTricks: false },
      { playerId: "bot_3", displayName: "Bot 3", handsWon: 0, inHand: true, tricksThisHand: 0, isSelf: false, isDealer: false, isWinner: false, canToggleInHand: false, canEditTricks: false },
      { playerId: "bot_4", displayName: "Bot 4", handsWon: 0, inHand: true, tricksThisHand: 0, isSelf: false, isDealer: false, isWinner: false, canToggleInHand: false, canEditTricks: false },
      { playerId: "bot_5", displayName: "Bot 5", handsWon: 0, inHand: true, tricksThisHand: 0, isSelf: false, isDealer: false, isWinner: false, canToggleInHand: false, canEditTricks: false },
      { playerId: "bot_6", displayName: "Bot 6", handsWon: 0, inHand: true, tricksThisHand: 0, isSelf: false, isDealer: false, isWinner: false, canToggleInHand: false, canEditTricks: false },
    ];
    const ordered = orderPlayersForTable(
      players,
      {
        dealerId: "bot_1",
        participantIds: players.map((p) => p.playerId),
        handEnrollment: null,
      },
      "human",
    );
    assert.equal(ordered.length, 7);
    assert.equal(ordered[0]?.playerId, "human");
    assert.deepEqual(
      ordered.slice(1).map((p) => p.playerId),
      ["bot_1", "bot_2", "bot_3", "bot_4", "bot_5", "bot_6"],
    );
  });

  it("maps dealer then clockwise seats for a 4-player dealer view", () => {
    const players: TablePlayer[] = [
      { playerId: "human", displayName: "You", handsWon: 0, inHand: true, tricksThisHand: 0, isSelf: true, isDealer: true, isWinner: false, canToggleInHand: false, canEditTricks: false },
      { playerId: "bot_1", displayName: "Bot 1", handsWon: 0, inHand: true, tricksThisHand: 0, isSelf: false, isDealer: false, isWinner: false, canToggleInHand: false, canEditTricks: false },
      { playerId: "bot_2", displayName: "Bot 2", handsWon: 0, inHand: true, tricksThisHand: 0, isSelf: false, isDealer: false, isWinner: false, canToggleInHand: false, canEditTricks: false },
      { playerId: "bot_3", displayName: "Bot 3", handsWon: 0, inHand: true, tricksThisHand: 0, isSelf: false, isDealer: false, isWinner: false, canToggleInHand: false, canEditTricks: false },
    ];
    const ordered = orderPlayersForTable(
      players,
      {
        dealerId: "human",
        participantIds: players.map((p) => p.playerId),
        handEnrollment: null,
      },
      "human",
    );
    assert.deepEqual(
      ordered.map((p) => p.displayName),
      ["You", "Bot 1", "Bot 2", "Bot 3"],
    );
    const layouts = ordered.map((_, i) => seatPosition(i, ordered.length));
    assert.ok(layouts[1]!.x < layouts[0]!.x, "Bot 1 should sit left of dealer");
  });
});
