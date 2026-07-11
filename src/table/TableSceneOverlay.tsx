import type { TableActionFeedback } from "./types";

interface TableSceneOverlayProps {
  actionFeedback?: TableActionFeedback | null;
  feedbackErrorPulse?: number;
  feedbackSuccessPulse?: number;
  turnLabel?: string | null;
  isMyTurn?: boolean;
  showTurn?: boolean;
  actionCue?: string | null;
}

/** Transient table copy — painted over the stage without affecting layout. */
export function TableSceneOverlay({
  actionFeedback,
  feedbackErrorPulse = 0,
  feedbackSuccessPulse = 0,
  turnLabel = null,
  isMyTurn = false,
  showTurn = false,
  actionCue = null,
}: TableSceneOverlayProps) {
  const showFeedback =
    actionFeedback &&
    actionFeedback.status !== "idle" &&
    !(actionFeedback.status === "loading" && !actionFeedback.message?.trim());

  const hasContent = showFeedback || (showTurn && turnLabel) || actionCue;
  if (!hasContent) return null;

  return (
    <div className="btable-stage__overlay" aria-live="polite">
      {showFeedback && (
        <div
          className={[
            `btable-stage__feedback btable-stage__feedback--${actionFeedback!.status}`,
            actionFeedback!.status === "error" ? "btable-stage__feedback--pulse-error" : "",
            actionFeedback!.status === "success" ? "btable-stage__feedback--pulse" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          key={
            actionFeedback!.status === "error"
              ? `feedback-error-${feedbackErrorPulse}`
              : actionFeedback!.status === "success"
                ? `feedback-success-${feedbackSuccessPulse}`
                : `feedback-${actionFeedback!.status}`
          }
          data-testid="feedback-banner"
          role={actionFeedback!.status === "error" ? "alert" : "status"}
        >
          {actionFeedback!.message}
        </div>
      )}
      {showTurn && turnLabel && (
        <p
          className={[
            "btable-stage__turn",
            isMyTurn ? "btable-stage__turn--yours" : "btable-stage__turn--waiting",
          ].join(" ")}
          data-testid="turn-indicator"
        >
          {turnLabel}
        </p>
      )}
      {actionCue && (
        <p className="btable-stage__action-cue" data-testid="action-cue">
          {actionCue}
        </p>
      )}
    </div>
  );
}
