import { createRoot, type Root } from "react-dom/client";
import { TableSessionView } from "./TableSessionView";
import type { TableSessionViewProps } from "./types";
import "./table.css";
import "../components/PlayingCard.css";

let root: Root | null = null;
let rootEl: HTMLElement | null = null;

export function mountTableSession(el: HTMLElement, props: TableSessionViewProps) {
  if (rootEl !== el) {
    root?.unmount();
    root = createRoot(el);
    rootEl = el;
  }
  root!.render(<TableSessionView {...props} />);
}

export function unmountTableSession() {
  root?.unmount();
  root = null;
  rootEl = null;
}

export type { TableSessionViewProps, TablePlayer, TableSessionData, TableSessionActions } from "./types";
