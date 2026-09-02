import { Check, Clock } from "lucide-react";
import type { Title, WatchEntry } from "../../types";
import { accentFor } from "../../artwork";
import { formatTimeLabel } from "../../lib/calendarUtils";
import "./EventChip.css";

export function EventChip({
  entry,
  title,
  onClick,
  dense,
}: {
  entry: WatchEntry;
  title: Title | undefined;
  onClick: () => void;
  dense?: boolean;
}) {
  if (!title) return null;
  const accent = accentFor(title.id);
  return (
    <button
      className={`event-chip ${dense ? "event-chip--dense" : ""}`}
      style={{ "--chip-accent": accent } as React.CSSProperties}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={`${title.name} — ${formatTimeLabel(entry.time)}`}
    >
      <span className="event-chip__dot" />
      {!dense && (
        <span className="event-chip__time">{formatTimeLabel(entry.time)}</span>
      )}
      <span className="event-chip__name">{title.name}</span>
      {entry.status === "watched" ? (
        <Check size={11} className="event-chip__status" />
      ) : (
        <Clock size={11} className="event-chip__status" />
      )}
    </button>
  );
}
