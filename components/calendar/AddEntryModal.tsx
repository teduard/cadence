import { useEffect, useState } from "react";
import { X, Check, Clock } from "lucide-react";
import type { Title, WatchStatus } from "../../types";
import { toDateKey } from "../../lib/calendarUtils";
import "./AddEntryModal.css";

export function AddEntryModal({
  titles,
  initialDate,
  onClose,
  onSave,
}: {
  titles: Title[];
  initialDate: Date;
  onClose: () => void;
  onSave: (data: { titleId: string; date: string; time: string; status: WatchStatus }) => void;
}) {
  const [titleId, setTitleId] = useState(titles[0]?.id ?? "");
  const [date, setDate] = useState(toDateKey(initialDate));
  const [time, setTime] = useState("19:00");
  const [status, setStatus] = useState<WatchStatus>("planned");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleId || !date) return;
    onSave({ titleId, date, time, status });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="add-entry" onClick={(e) => e.stopPropagation()}>
        <button className="add-entry__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h2 className="add-entry__title">Add to calendar</h2>
        <p className="add-entry__sub">Log a movie or show you've watched, or schedule one ahead.</p>

        <form className="add-entry__form" onSubmit={handleSubmit}>
          <label className="add-entry__field">
            <span>Title</span>
            <select value={titleId} onChange={(e) => setTitleId(e.target.value)}>
              {titles.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.kind === "series" ? "Series" : "Movie"})
                </option>
              ))}
            </select>
          </label>

          <div className="add-entry__row">
            <label className="add-entry__field">
              <span>Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label className="add-entry__field">
              <span>Time</span>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </label>
          </div>

          <div className="add-entry__field">
            <span>Status</span>
            <div className="add-entry__status">
              <button
                type="button"
                className={`add-entry__status-btn ${status === "planned" ? "add-entry__status-btn--active" : ""}`}
                onClick={() => setStatus("planned")}
              >
                <Clock size={15} /> Plan to watch
              </button>
              <button
                type="button"
                className={`add-entry__status-btn ${status === "watched" ? "add-entry__status-btn--active" : ""}`}
                onClick={() => setStatus("watched")}
              >
                <Check size={15} /> Already watched
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn--primary add-entry__submit">
            Save to calendar
          </button>
        </form>
      </div>
    </div>
  );
}
