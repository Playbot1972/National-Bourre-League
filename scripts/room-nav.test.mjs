import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildRoomDetailHash,
  buildRoomsListHash,
  buildRoomTableHash,
  parseRoomsLocationHash,
  ROOM_NAV_DETAIL,
  ROOM_NAV_LIST,
  roomNavStateForLayer,
} from "../docs/room-nav.js";

describe("room-nav", () => {
  it("builds list, detail, and table hashes", () => {
    assert.equal(buildRoomsListHash(), "#rooms");
    assert.equal(buildRoomsListHash("practice"), "#rooms-practice");
    assert.equal(buildRoomDetailHash("room_abc"), "#rooms?room=room_abc");
    assert.equal(buildRoomTableHash("room_abc"), "#rooms?room=room_abc&table=1");
  });

  it("parses room id and table flag from hash query", () => {
    assert.deepEqual(parseRoomsLocationHash("#rooms"), {
      path: "rooms",
      roomId: null,
      tableOpen: false,
    });
    assert.deepEqual(parseRoomsLocationHash("#rooms?room=room_abc"), {
      path: "rooms",
      roomId: "room_abc",
      tableOpen: false,
    });
    assert.deepEqual(parseRoomsLocationHash("#rooms?room=room_abc&table=1"), {
      path: "rooms",
      roomId: "room_abc",
      tableOpen: true,
    });
    assert.deepEqual(parseRoomsLocationHash("#home"), {
      path: "home",
      roomId: null,
      tableOpen: false,
    });
  });

  it("maps nav layers to history state payloads", () => {
    assert.deepEqual(roomNavStateForLayer(ROOM_NAV_LIST), { nblRoomNav: ROOM_NAV_LIST });
    assert.deepEqual(roomNavStateForLayer(ROOM_NAV_DETAIL, "r1"), {
      nblRoomNav: ROOM_NAV_DETAIL,
      roomId: "r1",
    });
  });
});
