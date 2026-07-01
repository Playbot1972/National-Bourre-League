import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from "react";

const PROFILE_THRESHOLD_MS = 8;

export const onRenderProfile: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
) => {
  if (actualDuration > PROFILE_THRESHOLD_MS) {
    console.log("[PROFILE]", {
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    });
  }
};

export function TableProfiler({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <Profiler id={id} onRender={onRenderProfile}>
      {children}
    </Profiler>
  );
}
