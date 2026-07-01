import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { tableSeatSlotPropsEqual } from "./tableSeatSlotEqual";
import type { TablePlayer } from "./types";

const noop = () => {};

function basePlayer(overrides: Partial<TablePlayer> = {}): TablePlayer {
  return {
    playerId: "p1",
    displayName: "Alice",
    inHand: true,
    isSelf: false,
    ...overrides,
  };
}

function baseProps(overrides: Partial<Parameters<typeof tableSeatSlotPropsEqual>[0]> = {}) {
  const player = basePlayer();
  return {
    seatIndex: 1,
    player,
    seatPlayer: player,
    playerCount: 4,
    isMobile: false,
    clockwiseDealing: false,
    onToggleInHand: noop,
    onTrickDelta: noop,
    ...overrides,
  };
}

describe("tableSeatSlotPropsEqual", () => {
  it("treats unchanged visual seat props as equal despite new object refs", () => {
    const prev = baseProps();
    const next = baseProps({
      seatPlayer: { ...prev.seatPlayer },
      player: { ...prev.player },
    });
    assert.equal(tableSeatSlotPropsEqual(prev, next), true);
  });

  it("rerenders when active turn changes on seatPlayer", () => {
    const prev = baseProps();
    const next = baseProps({
      seatPlayer: { ...prev.seatPlayer, isActiveActor: true, isOnTurn: true },
    });
    assert.equal(tableSeatSlotPropsEqual(prev, next), false);
  });

  it("rerenders when trick overlay fields change on seatPlayer", () => {
    const prev = baseProps();
    const next = baseProps({
      seatPlayer: { ...prev.seatPlayer, isLeading: true, isTrickCapture: true },
    });
    assert.equal(tableSeatSlotPropsEqual(prev, next), false);
  });

  it("rerenders when enrollment shell fields on player change", () => {
    const prev = baseProps();
    const next = baseProps({
      player: { ...prev.player, canPassEnrollment: true },
      seatPlayer: { ...prev.seatPlayer, canPassEnrollment: true },
    });
    assert.equal(tableSeatSlotPropsEqual(prev, next), false);
  });

  it("rerenders when stable callback refs change", () => {
    const prev = baseProps();
    const next = baseProps({ onTrickDelta: () => {} });
    assert.equal(tableSeatSlotPropsEqual(prev, next), false);
  });
});
