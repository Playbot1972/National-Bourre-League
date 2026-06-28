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
export const WON_TRICK_FLY_MAX_MS = 480;
export const WON_TRICK_GATHER_MS = 140;

function arcMidpoint(dx: number, dy: number): { midX: number; midY: number } {
  return {
    midX: dx * 0.5,
    midY: dy * 0.5,
  };
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

function removeFlyGhosts(root: ParentNode): void {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  for (const ghost of doc.querySelectorAll(".won-trick-fly-ghost")) {
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
  removeFlyGhosts(root);
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

function cloneCardForFly(source: HTMLElement, host: HTMLElement): HTMLElement {
  const rect = rectFromElement(source);
  const shell = document.createElement("div");
  shell.className = "won-trick-fly-ghost";
  shell.setAttribute("aria-hidden", "true");
  shell.style.position = "fixed";
  shell.style.left = `${rect.left}px`;
  shell.style.top = `${rect.top}px`;
  shell.style.width = `${rect.width}px`;
  shell.style.height = `${rect.height}px`;
  shell.style.pointerEvents = "none";
  shell.style.zIndex = "150";
  shell.style.transformOrigin = "50% 50%";

  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.width = "100%";
  clone.style.height = "100%";
  shell.appendChild(clone);
  host.appendChild(shell);
  return shell;
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
  const stagger = reduced ? 0.03 : 0.05;
  const ghosts: HTMLElement[] = [];

  const finish = (revealPile: boolean) => {
    ACTIVE_WON_TRICK_FLIGHTS.delete(tl);
    for (const g of ghosts) g.remove();
    restoreSourceCards();
    if (revealPile) {
      markWinnerPileRevealReady(options.winnerPlayerId, root);
    }
    options.onComplete?.();
  };

  const tl = gsap.timeline({
    onComplete: () => finish(true),
    onInterrupt: () => finish(false),
  });
  ACTIVE_WON_TRICK_FLIGHTS.add(tl);

  cardElements.forEach((source, i) => {
    const placement = wonTrickPilePlacement(options.trickKey, options.bookIndex);
    const ghost = cloneCardForFly(source, host);
    ghosts.push(ghost);
    ACTIVE_SOURCE_CARDS.add(source);
    gsap.set(source, { opacity: 0 });

    const last = rectFromElement(ghost);
    gsap.set(ghost, {
      transformOrigin: "50% 50%",
      willChange: "transform,opacity",
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
    });

    const startAt = i * stagger;

    if (!anchor || reduced) {
      tl.to(
        ghost,
        {
          opacity: 0,
          scale: placement.scale,
          duration: Math.min(flySec, 0.18),
          onComplete: () => ghost.remove(),
        },
        startAt,
      );
      return;
    }

    const targetCx = anchor.left + anchor.width / 2 + placement.offsetX;
    const targetCy = anchor.top + anchor.height / 2 + placement.offsetY;
    const cardCx = last.left + last.width / 2;
    const cardCy = last.top + last.height / 2;
    const dx = targetCx - cardCx;
    const dy = targetCy - cardCy;
    const { midX, midY } = arcMidpoint(dx, dy);

    tl.to(
      ghost,
      {
        scale: 0.98,
        duration: gatherSec,
        ease: PREMIUM_EASE,
      },
      startAt,
    );

    tl.to(
      ghost,
      {
        motionPath: {
          path: [
            { x: 0, y: 0 },
            { x: midX, y: midY },
            { x: dx, y: dy },
          ],
          curviness: 1.15,
        },
        rotation: placement.rotation,
        scale: placement.scale,
        opacity: 0.95,
        duration: flySec,
        ease: PREMIUM_EASE,
        onComplete: () => ghost.remove(),
      },
      startAt + gatherSec,
    );
  });

  const totalMs = Math.round(
    (cardElements.length > 0 ? (cardElements.length - 1) * stagger : 0) * 1000 +
      (gatherSec + flySec) * 1000 +
      60,
  );
  forceCompleteTimeline(tl, Math.min(WON_TRICK_FLY_MAX_MS, Math.max(300, totalMs)));
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
