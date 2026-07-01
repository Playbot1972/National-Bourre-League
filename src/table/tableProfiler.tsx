import type { ReactNode } from "react";
import { Profiler } from "react";
import { isTableRenderProfileEnabled, tableOnRenderProfile } from "./profileRender";

interface TableProfilerProps {
  id: string;
  children: ReactNode;
}

/** Wrap expensive table subtrees for render profiling in dev or opt-in debug. */
export function TableProfiler({ id, children }: TableProfilerProps) {
  if (!isTableRenderProfileEnabled()) return <>{children}</>;
  return (
    <Profiler id={id} onRender={tableOnRenderProfile}>
      {children}
    </Profiler>
  );
}
