import type { TableActionFeedback } from "./types";

interface TableSceneOverlayProps {
  actionFeedback?: TableActionFeedback | null;
  feedbackErrorPulse?: number;
  feedbackSuccessPulse?: number;
  turnLabel?: string | null;
  isMyTurn?: boolean;
  showTurn?: boolean;
}

/** Transient table copy — painted over the stage without affecting layout. */
export function TableSceneOverlay({
  actionFeedback,
  feedbackErrorPulse = 0,
  feedbackSuccessPulse = 0,
  turnLabel = null,
  isMyTurn = false,
  showTurn = false,
}: TableSceneOverlayProps) {
  const showFeedback =
    actionFeedback &&
    actionFeedback.status !== "idle" &&
    !(actionFeedback.status === "loading" && !actionFeedback.message?.trim());

  const showTurnLabel = showTurn && Boolean(turnLabel);

  if (!showFeedback && !showTurnLabel) return null;

  return (
    <>
      {showFeedback && (
        <div className="btable-stage__overlay btable-stage__overlay--chrome" aria-live="polite">
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
        </div>
      )}
      {showTurnLabel && (
        <div className="btable-stage__overlay btable-stage__overlay--turn" aria-live="polite">
          <p
            className={[
              "btable-stage__turn",
              isMyTurn ? "btable-stage__turn--yours" : "btable-stage__turn--waiting",
            ].join(" ")}
            data-testid="turn-indicator"
          >
            {turnLabel}
          </p>
        </div>
      )}
    </>
  );
}
