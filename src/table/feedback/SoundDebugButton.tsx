import { playCardSelectFeedback } from "./service";
import { soundAssetUrl } from "./soundPacks";

/** Plays card-select.wav on click (requires user gesture for browser audio unlock). */
export function SoundDebugButton() {
  const src = soundAssetUrl("classic", "card-select");

  return (
    <button
      type="button"
      className="btn btn--sm btn--ghost btable-sound-debug"
      data-testid="sound-debug-button"
      title={`Play ${src}`}
      onClick={() => playCardSelectFeedback()}
    >
      Test card-select.wav
    </button>
  );
}
