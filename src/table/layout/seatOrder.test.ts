import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { nextActivePlayerClockwise, playerOrderFromDealer } from "../../game/playerOrder";
import { seatPosition } from "../logic";
import { orderPlayersForTable, seatRingPlayerIds } from "./seatOrder";
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

  it("play order follows the seat ring clockwise, not numeric bot labels", () => {
    const playerIds = ["human", "bot_1", "bot_3", "bot_2"];
    const session = {
      dealerId: "human",
      participantIds: playerIds,
      handEnrollment: null,
    };
    const ring = seatRingPlayerIds(playerIds, session);
    assert.deepEqual(ring, ["bot_1", "bot_3", "bot_2", "human"]);

    const actionOrder = playerOrderFromDealer("human", ring);
    assert.deepEqual(actionOrder, ["bot_1", "bot_3", "bot_2", "human"]);

    let turn = actionOrder[0]!;
    const playSequence: string[] = [turn];
    for (let i = 0; i < 3; i++) {
      turn = nextActivePlayerClockwise(actionOrder, turn)!;
      playSequence.push(turn);
    }
    assert.deepEqual(playSequence, ["bot_1", "bot_3", "bot_2", "human"]);

    const players: TablePlayer[] = playerIds.map((id) => ({
      playerId: id,
      displayName: id,
      handsWon: 0,
      inHand: true,
      tricksThisHand: 0,
      isSelf: id === "human",
      isDealer: id === "human",
      isWinner: false,
      canToggleInHand: false,
      canEditTricks: false,
    }));
    const ordered = orderPlayersForTable(players, session, "human");
    const layouts = ordered.map((_, i) => seatPosition(i, ordered.length));
    assert.equal(ordered[1]?.playerId, "bot_1");
    assert.equal(ordered[2]?.playerId, "bot_3");
    assert.equal(ordered[3]?.playerId, "bot_2");
    assert.ok(layouts[1]!.x < layouts[0]!.x, "next actor is left of hero");
    assert.ok(layouts[2]!.y < layouts[0]!.y, "then top");
    assert.ok(layouts[3]!.x > layouts[0]!.x, "then right");
  });

  it("orders 7 bots with Bot 1 at index 1 and Bot 7 at index 7", () => {
    const players: TablePlayer[] = [
      { playerId: "human", displayName: "You", handsWon: 0, inHand: true, tricksThisHand: 0, isSelf: true, isDealer: false, isWinner: false, canToggleInHand: false, canEditTricks: false },
      ...Array.from({ length: 7 }, (_, i) => ({
        playerId: `bot_${i + 1}`,
        displayName: `Bot ${i + 1}`,
        handsWon: 0,
        inHand: true,
        tricksThisHand: 0,
        isSelf: false,
        isDealer: i === 0,
        isWinner: false,
        canToggleInHand: false,
        canEditTricks: false,
      })),
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
    assert.equal(ordered.length, 8);
    assert.equal(ordered[0]?.playerId, "human");
    assert.equal(ordered[1]?.playerId, "bot_1");
    assert.equal(ordered[7]?.playerId, "bot_7");
    const layouts = ordered.map((_, i) => seatPosition(i, ordered.length));
    assert.ok(layouts[1]!.x < layouts[0]!.x, "Bot 1 bottom-left of hero");
    assert.ok(layouts[7]!.x > layouts[0]!.x, "Bot 7 bottom-right of hero");
  });
});
