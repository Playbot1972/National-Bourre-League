import gsap from "gsap";
import { ensureGsapMotionPlugins, isMotionPathAvailable } from "./initMotion";

export interface ArcPathPoint {
  x: number;
  y: number;
}

type ArcTweenExtras = Record<string, unknown>;

/**
 * Arc flight tween — uses MotionPathPlugin when registered, otherwise a two-keyframe
 * approximation so presentation never throws on missing plugin.
 */
export function tweenAlongArc(
  target: gsap.TweenTarget,
  vars: {
    path: ArcPathPoint[];
    curviness?: number;
    duration: number;
    ease?: string;
    onComplete?: () => void;
  } & ArcTweenExtras,
): gsap.core.Tween {
  ensureGsapMotionPlugins();
  const { path, curviness = 1.2, duration, ease, onComplete, ...rest } = vars;
  const end = path[path.length - 1] ?? { x: 0, y: 0 };

  if (isMotionPathAvailable()) {
    return gsap.to(target, {
      motionPath: { path, curviness },
      duration,
      ease,
      onComplete,
      ...rest,
    });
  }

  const start = path[0] ?? { x: 0, y: 0 };
  const mid = path[1] ?? {
    x: (start.x + end.x) * 0.5,
    y: (start.y + end.y) * 0.5,
  };
  return gsap.to(target, {
    keyframes: [
      { ...rest, x: mid.x, y: mid.y, duration: duration * 0.5, ease },
      { ...rest, x: end.x, y: end.y, duration: duration * 0.5, ease, onComplete },
    ],
  });
}
