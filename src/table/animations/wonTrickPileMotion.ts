import gsap from "gsap";
import { wonTrickPilePlacement } from "../wonTrickPileModel";
import {
  GSAP_DURATIONS,
  PREMIUM_EASE,
  prefersReducedMotion,
  scaledDuration,
} from "./motionTokens";
import { initCardMotion } from "./initMotion";
import { rectFromElement, type MotionRect } from "./flip";

const ACTIVE_WON_TRICK_FLIGHTS = new Set<gsap.core.Timeline>();
const ACTIVE_SOURCE_CARDS = new Set<HTMLElement>();

export const WON_TRICK_FLY_DURATION_SEC = GSAP_DURATIONS.drawDiscard;
/** Packet fly — rake delay + gather + arc; keep in sync with TRICK_SWEEP_MS budget. */
export const WON_TRICK_FLY_MAX_MS = 760;
export const WON_TRICK_GATHER_MS = 160;

function arcMidpoint(dx: number, dy: number): { midX: number; midY: number } {
  return {
    midX: dx * 0.5,
    midY: dy * 0.5,
  };
}

/** Union bounding box for packet shell placement. */
export function unionMotionRects(rects: MotionRect[]): MotionRect {
  if (rects.length === 0) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }
  const left = Math.min(...rects.map((r) => r.left));
  const top = Math.min(...rects.map((r) => r.top));
  const right = Math.max(...rects.map((r) => r.left + r.width));
  const bottom = Math.max(...rects.map((r) => r.top + r.height));
  return { left, top, width: right - left, height: bottom - top };
}

export function readWonTrickPileAnchor(
  winnerPlayerId: string,
  root: ParentNode = document,
): MotionRect | null {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const el = doc.querySelector(`[data-won-trick-pile-anchor="${winnerPlayerId}"]`);
  return el ? rectFromElement(el) : null;
}

function restoreSourceCards(): void {
  for (const el of ACTIVE_SOURCE_CARDS) {
    gsap.set(el, { clearProps: "opacity,transform,willChange,zIndex" });
  }
  ACTIVE_SOURCE_CARDS.clear();
}

function removeFlyArtifacts(root: ParentNode): void {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  for (const ghost of doc.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) {
    ghost.remove();
  }
}

export function clearAllPileRevealReady(root: ParentNode): void {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  for (const seat of doc.querySelectorAll(".bseat--pile-reveal-ready")) {
    seat.classList.remove("bseat--pile-reveal-ready");
  }
}

/** Reset GSAP ghosts, inline card styles, and pile reveal flags after a trick or hand. */
export function clearWonTrickCollectionArtifacts(root: ParentNode = document): void {
  for (const tl of ACTIVE_WON_TRICK_FLIGHTS) tl.kill();
  ACTIVE_WON_TRICK_FLIGHTS.clear();
  removeFlyArtifacts(root);
  restoreSourceCards();
  clearAllPileRevealReady(root);
}

export function killWonTrickFlights(): void {
  for (const tl of ACTIVE_WON_TRICK_FLIGHTS) tl.kill();
  ACTIVE_WON_TRICK_FLIGHTS.clear();
  restoreSourceCards();
}

function forceCompleteTimeline(tl: gsap.core.Timeline, maxMs: number): void {
  const id = window.setTimeout(() => {
    if (tl.progress() < 1) tl.progress(1);
  }, maxMs);
  tl.eventCallback("onComplete", () => window.clearTimeout(id));
  tl.eventCallback("onInterrupt", () => window.clearTimeout(id));
}

interface TrickFlyPacket {
  packet: HTMLElement;
  cardShells: HTMLElement[];
}

/** Fixed-position packet — clones raked trick cards for a single grouped fly. */
function buildTrickFlyPacket(
  cardElements: HTMLElement[],
  host: HTMLElement,
): TrickFlyPacket | null {
  if (cardElements.length === 0) return null;

  const rects = cardElements.map((el) => rectFromElement(el));
  const bounds = unionMotionRects(rects);

  const packet = document.createElement("div");
  packet.className = "won-trick-fly-packet";
  packet.setAttribute("aria-hidden", "true");
  packet.style.position = "fixed";
  packet.style.left = `${bounds.left}px`;
  packet.style.top = `${bounds.top}px`;
  packet.style.width = `${bounds.width}px`;
  packet.style.height = `${bounds.height}px`;
  packet.style.pointerEvents = "none";
  packet.style.zIndex = "150";
  packet.style.overflow = "visible";
  packet.style.transformOrigin = "50% 50%";

  const cardShells: HTMLElement[] = [];
  cardElements.forEach((source, i) => {
    const rect = rects[i]!;
    const shell = document.createElement("div");
    shell.className = "won-trick-fly-packet__card";
    shell.style.position = "absolute";
    shell.style.left = `${rect.left - bounds.left}px`;
    shell.style.top = `${rect.top - bounds.top}px`;
    shell.style.width = `${rect.width}px`;
    shell.style.height = `${rect.height}px`;
    shell.style.zIndex = String(i + 1);
    shell.style.transformOrigin = "50% 100%";

    const clone = source.cloneNode(true) as HTMLElement;
    clone.style.width = "100%";
    clone.style.height = "100%";
    shell.appendChild(clone);
    packet.appendChild(shell);
    cardShells.push(shell);

    ACTIVE_SOURCE_CARDS.add(source);
    gsap.set(source, { opacity: 0 });
  });

  host.appendChild(packet);
  return { packet, cardShells };
}

export function markWinnerPileRevealReady(winnerPlayerId: string, root: ParentNode): void {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const seat = doc.querySelector(`[data-won-trick-pile-anchor="${winnerPlayerId}"]`)?.closest(".bseat");
  seat?.classList.add("bseat--pile-reveal-ready");
}

export function clearWinnerPileRevealReady(winnerPlayerId: string, root: ParentNode): void {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const seat = doc.querySelector(`[data-won-trick-pile-anchor="${winnerPlayerId}"]`)?.closest(".bseat");
  seat?.classList.remove("bseat--pile-reveal-ready");
}

export function animateTrickCardsToWonPile(
  cardElements: HTMLElement[],
  options: {
    winnerPlayerId: string;
    trickKey: string;
    bookIndex: number;
    root?: ParentNode;
    host?: HTMLElement;
    onComplete?: () => void;
  },
): gsap.core.Timeline {
  initCardMotion(options.root ?? document);
  const reduced = prefersReducedMotion();
  const root = options.root ?? document;
  const host = options.host ?? (root instanceof HTMLElement ? root : document.body);
  const anchor = readWonTrickPileAnchor(options.winnerPlayerId, root);
  const gatherSec = reduced ? 0.06 : WON_TRICK_GATHER_MS / 1000;
  const flySec = scaledDuration(WON_TRICK_FLY_DURATION_SEC, reduced);
  const placement = wonTrickPilePlacement(options.trickKey, options.bookIndex);

  const built = buildTrickFlyPacket(cardElements, host);
  const finish = (revealPile: boolean, packet?: HTMLElement) => {
    ACTIVE_WON_TRICK_FLIGHTS.delete(tl);
    packet?.remove();
    restoreSourceCards();
    if (revealPile) {
      markWinnerPileRevealReady(options.winnerPlayerId, root);
    }
    options.onComplete?.();
  };

  const tl = gsap.timeline({
    onComplete: () => finish(true, built?.packet),
    onInterrupt: () => finish(false, built?.packet),
  });
  ACTIVE_WON_TRICK_FLIGHTS.add(tl);

  if (!built) {
    tl.call(() => finish(true));
    return tl;
  }

  const { packet, cardShells } = built;
  const packetRect = rectFromElement(packet);
  const packetCx = packetRect.left + packetRect.width / 2;
  const packetCy = packetRect.top + packetRect.height / 2;
  const stackCx = packetRect.width / 2;
  const stackCy = packetRect.height / 2;
  const sampleShell = cardShells[0];
  const cardW = sampleShell ? sampleShell.offsetWidth : 52;
  const cardH = sampleShell ? sampleShell.offsetHeight : 74;

  gsap.set(packet, {
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    opacity: 1,
    willChange: "transform,opacity",
  });

  // Compress raked cards into one tight packet (newest card on top).
  cardShells.forEach((shell, i) => {
    tl.to(
      shell,
      {
        left: stackCx - cardW / 2 + i * 0.35,
        top: stackCy - cardH / 2 - i * 0.55,
        duration: gatherSec,
        ease: PREMIUM_EASE,
      },
      0,
    );
  });
  tl.to(
    packet,
    {
      scale: 0.93,
      duration: gatherSec,
      ease: PREMIUM_EASE,
    },
    0,
  );

  if (!anchor || reduced) {
    tl.to(
      packet,
      {
        opacity: 0,
        scale: placement.scale * 0.88,
        duration: Math.min(flySec, 0.2),
      },
      gatherSec,
    );
  } else {
    const targetCx = anchor.left + anchor.width / 2 + placement.offsetX;
    const targetCy = anchor.top + anchor.height / 2 + placement.offsetY;
    const dx = targetCx - packetCx;
    const dy = targetCy - packetCy;
    const { midX, midY } = arcMidpoint(dx, dy);

    tl.to(
      packet,
      {
        motionPath: {
          path: [
            { x: 0, y: 0 },
            { x: midX, y: midY },
            { x: dx, y: dy },
          ],
          curviness: 1.1,
        },
        rotation: placement.rotation,
        scale: placement.scale,
        opacity: 0.96,
        duration: flySec,
        ease: PREMIUM_EASE,
      },
      gatherSec,
    );
  }

  const totalMs = Math.round((gatherSec + flySec) * 1000 + 80);
  forceCompleteTimeline(tl, Math.min(WON_TRICK_FLY_MAX_MS, Math.max(360, totalMs)));
  return tl;
}

export function hasActiveWonTrickFlights(): boolean {
  return ACTIVE_WON_TRICK_FLIGHTS.size > 0;
}

export function readTrickRowCardElements(root: ParentNode): HTMLElement[] {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const live = [
    ...doc.querySelectorAll<HTMLElement>(
      '[data-trick-variant="live"] .btrick__play .pcard, [data-testid="trick-row"] .btrick__play .pcard',
    ),
  ].filter((el) => el.closest('[data-trick-variant="echo"]') == null);
  if (live.length > 0) return live;
  return [...doc.querySelectorAll<HTMLElement>('[data-trick-variant="echo"] .btrick__play .pcard')];
}
