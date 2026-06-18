import type { TablePlayer } from "./types";

interface SmartHudProps {
  player: TablePlayer;
  compact?: boolean;
}

function HudPill({
  label,
  value,
  accent,
  title,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  title?: string;
}) {
  return (
    <span
      className={`bhud__pill${accent ? " bhud__pill--accent" : ""}`}
      title={title ?? `${label}: ${value}`}
    >
      <span className="bhud__pill-label">{label}</span>
      <span className="bhud__pill-value">{value}</span>
    </span>
  );
}

export function SmartHud({ player, compact = false }: SmartHudProps) {
  const showRating = player.apeScore != null && !player.isRobot;

  return (
    <div className={`bhud${compact ? " bhud--compact" : ""}`} aria-label={`${player.displayName} stats`}>
      {showRating && (
        <>
          <HudPill label="Ape" value={player.apeScore ?? 0} accent title="Ape Score" />
          {player.apeClass && !compact && (
            <HudPill label="Class" value={player.apeClass} title="Ape Class" />
          )}
          {player.apeStatus && !compact && (
            <HudPill label="Status" value={player.apeStatus} title="Ape Status" />
          )}
        </>
      )}
      {player.sessionStreak != null && player.sessionStreak > 0 && (
        <HudPill label="Streak" value={player.sessionStreak} title="Hands won this session" />
      )}
    </div>
  );
}
