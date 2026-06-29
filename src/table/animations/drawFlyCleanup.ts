import { killDiscardFlights } from "./discardPileMotion";
import { killDrawReceiveFlights } from "./drawSeatMotion";

/** Remove draw-phase fly ghosts and kill in-flight GSAP timelines. */
export function clearDrawFlyGhosts(root: ParentNode = document): void {
  killDiscardFlights();
  killDrawReceiveFlights();
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  const scope = root instanceof Document ? doc.body : root;
  for (const ghost of scope.querySelectorAll(".discard-fly-ghost, .draw-receive-fly-ghost")) {
    ghost.remove();
  }
}
