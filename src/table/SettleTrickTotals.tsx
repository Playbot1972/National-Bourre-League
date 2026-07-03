export type SettleSeatRow = {
  playerId: string;
  displayName: string;
};

export type SettleTrickTotalsProps = {
  tricksByPlayer: Record<string, number>;
  seats: SettleSeatRow[];
  winnerIds: string[];
  visible: boolean;
};

export function SettleTrickTotals({
  tricksByPlayer,
  seats,
  winnerIds,
  visible,
}: SettleTrickTotalsProps) {
  if (!visible) return null;

  const rows = seats
    .map((seat) => ({
      playerId: seat.playerId,
      name: seat.displayName,
      tricks: tricksByPlayer[seat.playerId] ?? 0,
      isWinner: winnerIds.includes(seat.playerId),
    }))
    .sort((a, b) => b.tricks - a.tricks || a.name.localeCompare(b.name));

  return (
    <div className="btable-settle-trick-totals" role="status" aria-live="polite">
      <p className="btable-settle-trick-totals__title">Hand tricks</p>
      <ul className="btable-settle-trick-totals__list">
        {rows.map((row) => (
          <li
            key={row.playerId}
            className={`btable-settle-trick-totals__row${row.isWinner ? " btable-settle-trick-totals__row--winner" : ""}`}
          >
            <span className="btable-settle-trick-totals__name">{row.name}</span>
            <span className="btable-settle-trick-totals__count">{row.tricks}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
