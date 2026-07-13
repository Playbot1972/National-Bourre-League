/**
 * Room list ↔ detail ↔ table URL helpers for hash routing + history.
 * Hash forms: #rooms | #rooms?room={id} | #rooms?room={id}&table=1
 */

export const ROOM_NAV_LIST = "list";
export const ROOM_NAV_DETAIL = "detail";
export const ROOM_NAV_TABLE = "table";

export function buildRoomsListHash(scope = "online") {
  return scope === "practice" ? "#rooms-practice" : "#rooms";
}

export function buildRoomDetailHash(roomId) {
  return `#rooms?room=${encodeURIComponent(roomId)}`;
}

export function buildRoomTableHash(roomId) {
  return `#rooms?room=${encodeURIComponent(roomId)}&table=1`;
}

/** Parse room layer from location.hash (path + query only). */
export function parseRoomsLocationHash(hash = "") {
  const cleaned = String(hash).replace(/^#/, "") || "home";
  const [path, queryPart] = cleaned.split("?", 2);
  const params = new URLSearchParams(queryPart || "");
  return {
    path,
    roomId: path === "rooms" ? params.get("room") : null,
    tableOpen: path === "rooms" && params.get("table") === "1",
  };
}

export function roomNavStateForLayer(layer, roomId = null) {
  if (layer === ROOM_NAV_TABLE && roomId) {
    return { nblRoomNav: ROOM_NAV_TABLE, roomId };
  }
  if (layer === ROOM_NAV_DETAIL && roomId) {
    return { nblRoomNav: ROOM_NAV_DETAIL, roomId };
  }
  return { nblRoomNav: ROOM_NAV_LIST };
}
