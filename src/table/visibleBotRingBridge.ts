/** Table UI → bot-play-delay visible ring acknowledgements (presentation only). */

export interface VisibleBotRingPayload {
  turnKey: string;
  playerId: string;
  nowMs: number;
}

export interface VisibleBotRingHiddenPayload {
  turnKey: string;
  reason: string;
  nowMs: number;
}

export interface VisibleBotRingReporter {
  onShown: (payload: VisibleBotRingPayload) => void;
  onHidden: (payload: VisibleBotRingHiddenPayload) => void;
}

let reporter: VisibleBotRingReporter | null = null;

export function setVisibleBotRingReporter(next: VisibleBotRingReporter | null): void {
  reporter = next;
}

export function reportVisibleBotRingShown(payload: VisibleBotRingPayload): void {
  reporter?.onShown(payload);
}

export function reportVisibleBotRingHidden(payload: VisibleBotRingHiddenPayload): void {
  reporter?.onHidden(payload);
}
