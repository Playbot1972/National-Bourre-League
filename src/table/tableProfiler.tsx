import type { ReactNode } from "react";
import { Profiler } from "react";
import { tableOnRenderProfile } from "./profileRender";

interface TableProfilerProps {
  id: string;
  children: ReactNode;
}

/** Wrap expensive table subtrees for render profiling in dev. */
export function TableProfiler({ id, children }: TableProfilerProps) {
  return (
    <Profiler id={id} onRender={tableOnRenderProfile}>
      {children}
    </Profiler>
  );
}
