import { createRoot, type Root } from "react-dom/client";
import { TableSessionView } from "./TableSessionView";
import { TableThemeProvider } from "./theme/TableThemeContext.tsx";
import type { TableSessionViewProps } from "./types";
import { initCardMotion } from "./animations/initMotion";
import {
  initGameFeedback,
  playBigWinFeedback,
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
  subscribeTrickAnimationBusy,
} from "./trickAnimationBridge";
import "./table.css";
import "./mobile-table.css";
import "./theme/table-themes.css";
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
  root?.unmount();
  root = null;
  rootEl = null;
  resetTrickAnimationBusyState();
}

export {
  initGameFeedback,
  playShuffleFeedback,
  playTrickWinFeedback,
  playBigWinFeedback,
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
  isTrickAnimationBusy,
  subscribeTrickAnimationBusy,
};

export type { TableSessionViewProps, TablePlayer, TableSessionData, TableSessionActions } from "./types";
