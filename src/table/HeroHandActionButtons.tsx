import { memo, useCallback } from "react";

export interface HeroHandActionButtonsProps {
  visible: boolean;
  busy: boolean;
  selectedCount: number;
  onDraw: () => void;
  onPassDraw: () => void;
  onFoldDraw: () => void;
}

function HeroHandActionButtonsInner({
  visible,
  busy,
  selectedCount,
  onDraw,
  onPassDraw,
  onFoldDraw,
}: HeroHandActionButtonsProps) {
  const handleDraw = useCallback(() => {
    onDraw();
  }, [onDraw]);
  const handlePass = useCallback(() => {
    onPassDraw();
  }, [onPassDraw]);
  const handleFold = useCallback(() => {
    onFoldDraw();
  }, [onFoldDraw]);

  return (
    <div className="btable-hero__actions-slot" aria-hidden={!visible}>
      {visible && (
        <div className="btable-hero__actions btable-hero__actions--triple">
          <button
            type="button"
            className="btn btn--sm btn--primary"
            data-testid="draw-button"
            disabled={busy}
            aria-busy={busy}
            onClick={handleDraw}
          >
            {busy ? "Drawing…" : `Draw${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
          </button>
          <button
            type="button"
            className="btn btn--sm btn--secondary-muted"
            data-testid="pass-draw-button"
            disabled={busy}
            onClick={handlePass}
          >
            Stand pat
          </button>
          <button
            type="button"
            className="btn btn--sm btn--secondary-muted"
            data-testid="im-out-button"
            disabled={busy}
            onClick={handleFold}
          >
            I&apos;m Out
          </button>
        </div>
      )}
    </div>
  );
}

export const HeroHandActionButtons = memo(HeroHandActionButtonsInner);
