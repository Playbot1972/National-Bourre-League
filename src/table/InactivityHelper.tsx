import { useInactivityHelper } from "./hooks/useInactivityHelper";

interface InactivityHelperProps {
  actionRequired: boolean;
  activityKey: string;
  phase: string | null | undefined;
  hasUserInteracted: boolean;
}

export function InactivityHelper({
  actionRequired,
  activityKey,
  phase,
  hasUserInteracted,
}: InactivityHelperProps) {
  const { visible, text, flashOn } = useInactivityHelper({
    actionRequired,
    activityKey,
    phase,
    hasUserInteracted,
  });

  if (!visible || !text) return null;

  return (
    <p
      className={[
        "btable-session__inactivity-helper",
        flashOn ? "btable-session__inactivity-helper--on" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="inactivity-helper"
      aria-live="polite"
    >
      {text}
    </p>
  );
}
