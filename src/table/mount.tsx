import { createRoot, type Root } from "react-dom/client";
import { TableSessionView } from "./TableSessionView";
import { TableThemeProvider } from "./theme/TableThemeContext.tsx";
import type { TableSessionViewProps } from "./types";
import { initCardMotion } from "./animations/initMotion";
import { clearWonTrickCollectionArtifacts } from "./animations/wonTrickPileMotion";
import { clearDrawFlyGhosts } from "./animations/drawFlyCleanup";
import {
  initGameFeedback,
  playBigWinFeedback,
  playBourreFeedback,
  playBourrePrivatePunishmentFeedback,
  playDrawFeedback,
  playGameStartFeedback,
  playOpenRoomFeedback,
  playDeleteRoomFeedback,
  playLastCardTrickWinFeedback,
  playLastCardTrickWinSequenceFeedback,
  playCardSelectFeedback,
  playUiButtonFeedback,
  playFoldFeedback,
  playShuffleFeedback,
  playTrickWinFeedback,
  getFeedbackPrefs,
  saveFeedbackPrefs,
  subscribeFeedbackPrefs,
} from "./feedback";
import {
  evaluateBotPresentationGate,
  forceReleasePresentationForBots,
  getTablePresentationBlockReason,
  getTrickAnimationBusyState,
  handPresentingBlocksBots,
  isTablePresentationBusy,
  isTablePresentationBusyForBots,
  isTrickAnimationBusy,
  resetTrickAnimationBusyState,
  disposeTrickAnimationBusyListeners,
  subscribeTrickAnimationBusy,
} from "./trickAnimationBridge";
import {
  isCoWinResultLatched,
  resetCoWinResultLatchBridge,
} from "./coWinResultLatchBridge";
import {
  resetPresentationMotionBusy,
  disposePresentationMotionBusyListeners,
} from "./presentationMotionBusy";
import { resetStageFitMotionFreeze } from "./stageFitMotionFreeze";
import "./table.css";
import "./mobile-table.css";
import "./theme/table-themes.css";
import "./theme/card-packs.css";
import "../components/PlayingCard.css";
import "../components/Hand.css";
import "./cardAnimations.css";

let root: Root | null = null;
let rootEl: HTMLElement | null = null;

export function mountTableSession(el: HTMLElement, props: TableSessionViewProps) {
  initGameFeedback();
  initCardMotion(el);
  if (rootEl !== el) {
    root?.unmount();
    root = createRoot(el);
    rootEl = el;
  }
  root!.render(
    <TableThemeProvider>
      <TableSessionView {...props} />
    </TableThemeProvider>,
  );
}

export function unmountTableSession() {
  if (rootEl) {
    clearWonTrickCollectionArtifacts(rootEl);
    clearDrawFlyGhosts(rootEl);
  }
  root?.unmount();
  root = null;
  rootEl = null;
  resetTrickAnimationBusyState();
  resetCoWinResultLatchBridge();
  resetPresentationMotionBusy();
  disposeTrickAnimationBusyListeners();
  disposePresentationMotionBusyListeners();
  resetStageFitMotionFreeze();
}

export {
  initGameFeedback,
  playShuffleFeedback,
  playDrawFeedback,
  playTrickWinFeedback,
  playBigWinFeedback,
  playBourreFeedback,
  playBourrePrivatePunishmentFeedback,
  playGameStartFeedback,
  playOpenRoomFeedback,
  playDeleteRoomFeedback,
  playLastCardTrickWinFeedback,
  playLastCardTrickWinSequenceFeedback,
  playCardSelectFeedback,
  playUiButtonFeedback,
  playFoldFeedback,
  getFeedbackPrefs,
  saveFeedbackPrefs,
  subscribeFeedbackPrefs,
  getTrickAnimationBusyState,
  getTablePresentationBlockReason,
  handPresentingBlocksBots,
  isTablePresentationBusy,
  isTablePresentationBusyForBots,
  evaluateBotPresentationGate,
  forceReleasePresentationForBots,
  isCoWinResultLatched,
  isTrickAnimationBusy,
  subscribeTrickAnimationBusy,
  clearWonTrickCollectionArtifacts,
  clearDrawFlyGhosts,
};

export type { TableSessionViewProps, TablePlayer, TableSessionData, TableSessionActions } from "./types";
