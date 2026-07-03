/** Temporary debug logs for hero tap/swipe play interaction (dev consoles). */

export interface PlayClickDebugPayload {
  event: string;
  handNumber?: number;
  trickNumber?: number | null;
  turnPlayerId?: string | null;
  selectedPlay?: number | null;
  cardIndex?: number;
  actorId?: string | null;
  isMyTurn?: boolean;
  isLegal?: boolean;
  busy?: boolean;
  playLock?: boolean;
  reason?: string;
  delayMs?: number;
  generation?: number;
  gesture?: string;
}

const PREFIX = "[play-click]";

export function logPlayClick(payload: PlayClickDebugPayload): void {
  if (typeof import.meta !== "undefined" && import.meta.env?.PROD) return;
  try {
    console.debug(PREFIX, payload.event, payload);
  } catch {
    /* ignore */
  }
}
