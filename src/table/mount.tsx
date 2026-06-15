import { createRoot, type Root } from "react-dom/client";
import { TableSessionView } from "./TableSessionView";
import { TableThemeProvider } from "./theme/TableThemeContext.tsx";
import type { TableSessionViewProps } from "./types";
import {
  initGameFeedback,
  playBigWinFeedback,
  playShuffleFeedback,
  playTrickWinFeedback,
  getFeedbackPrefs,
  saveFeedbackPrefs,
  subscribeFeedbackPrefs,
} from "./feedback";
import "./table.css";
import "./theme/table-themes.css";
import "../components/PlayingCard.css";
import "../components/Hand.css";

let root: Root | null = null;
let rootEl: HTMLElement | null = null;

export function mountTableSession(el: HTMLElement, props: TableSessionViewProps) {
  initGameFeedback();
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
}

export {
  initGameFeedback,
  playShuffleFeedback,
  playTrickWinFeedback,
  playBigWinFeedback,
  getFeedbackPrefs,
  saveFeedbackPrefs,
  subscribeFeedbackPrefs,
};

export type { TableSessionViewProps, TablePlayer, TableSessionData, TableSessionActions } from "./types";
