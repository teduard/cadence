import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Check, Clock, X } from "lucide-react";
import type { CalendarGranularity, Title, WatchEntry } from "../../types";
import { MonthView, WeekView, DayView, YearView } from "./CalendarViews";
import { AddEntryModal } from "./AddEntryModal";
import {
  addDays,
  formatDayHeading,
  formatMonthYear,
  formatWeekRange,
  formatTimeLabel,
} from "../../lib/calendarUtils";
import "./CalendarPage.css";

const STORAGE_KEY = "nightreel-calendar";
const GRANULARITIES: { id: CalendarGranularity; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

function loadEntries(): WatchEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WatchEntry[]) : [];
  } catch {
    return [];
  }
}

function genId() {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function CalendarPage({
  titles,
  onOpenTitle,
}: {
  titles: Title[];
  onOpenTitle: (t: Title) => void;
}) {
  const [entries, setEntries] = useState<WatchEntry[]>(() => loadEntries());
  const [granularity, setGranularity] = useState<CalendarGranularity>("month");
  const [cursor, setCursor] = useState<Date>(() => new Date());
  const [addOpen, setAddOpen] = useState(false);
  const [addDate, setAddDate] = useState<Date>(() => new Date());
  const [detail, setDetail] = useState<WatchEntry | null>(null);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, WatchEntry[]>();
    for (const e of entries) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      list.sort((a, b) => a.time.localeCompare(b.time));
      map.set(e.date, list);
    }
    return map;
  }, [entries]);

  const step = (dir: number) => {
    setCursor((prev) => {
      if (granularity === "day") return addDays(prev, dir);
      if (granularity === "week") return addDays(prev, dir * 7);
      if (granularity === "month") return new Date(prev.getFullYear(), prev.getMonth() + dir, 1);
      return new Date(prev.getFullYear() + dir, prev.getMonth(), 1);
    });
  };

  const heading = useMemo(() => {
    if (granularity === "day") return formatDayHeading(cursor);
    if (granularity === "week") return formatWeekRange(cursor);
    if (granularity === "month") return formatMonthYear(cursor);
    return String(cursor.getFullYear());
  }, [granularity, cursor]);

  const openAddFor = (d: Date) => {
    setAddDate(d);
    setAddOpen(true);
  };

  const handleSave = (data: { titleId: string; date: string; time: string; status: WatchEntry["status"] }) => {
    setEntries((prev) => [...prev, { id: genId(), ...data }]);
    setAddOpen(false);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDetail(null);
  };

  const toggleStatus = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: e.status === "watched" ? "planned" : "watched" } : e))
    );
    setDetail((d) => (d && d.id === id ? { ...d, status: d.status === "watched" ? "planned" : "watched" } : d));
  };

  const detailTitle = detail ? titles.find((t) => t.id === detail.titleId) : undefined;

  return (
    <main className="cal-page">
      <div className="cal-page__header">
        <div className="cal-page__header-left">
          <button className="cal-page__today" onClick={() => setCursor(new Date())}>
            Today
          </button>
          <div className="cal-page__nav">
            <button className="cal-page__nav-btn" onClick={() => step(-1)} aria-label="Previous">
              <ChevronLeft size={18} />
            </button>
            <button className="cal-page__nav-btn" onClick={() => step(1)} aria-label="Next">
              <ChevronRight size={18} />
            </button>
          </div>
          <h1 className="cal-page__heading">{heading}</h1>
        </div>
        <div className="cal-page__header-right">
          <div className="cal-page__granularity">
            {GRANULARITIES.map((g) => (
              <button
                key={g.id}
                className={`cal-page__gran-btn ${granularity === g.id ? "cal-page__gran-btn--active" : ""}`}
                onClick={() => setGranularity(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>
          <button className="btn btn--primary cal-page__add" onClick={() => openAddFor(cursor)}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="cal-page__body">
        {granularity === "month" && (
          <MonthView
            cursor={cursor}
            today={today}
            entriesByDate={entriesByDate}
            titles={titles}
            onDayClick={openAddFor}
            onEventClick={setDetail}
          />
        )}
        {granularity === "week" && (
          <WeekView
            cursor={cursor}
            today={today}
            entriesByDate={entriesByDate}
            titles={titles}
            onSlotClick={openAddFor}
            onEventClick={setDetail}
          />
        )}
        {granularity === "day" && (
          <DayView
            cursor={cursor}
            entriesByDate={entriesByDate}
            titles={titles}
            onSlotClick={openAddFor}
            onEventClick={setDetail}
          />
        )}
        {granularity === "year" && (
          <YearView
            cursor={cursor}
            today={today}
            entriesByDate={entriesByDate}
            onMonthClick={(mi) => {
              setCursor(new Date(cursor.getFullYear(), mi, 1));
              setGranularity("month");
            }}
            onDayClick={(d) => {
              setCursor(d);
              setGranularity("day");
            }}
          />
        )}
      </div>

      {addOpen && (
        <AddEntryModal
          titles={titles}
          initialDate={addDate}
          onClose={() => setAddOpen(false)}
          onSave={handleSave}
        />
      )}

      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <div className="cal-detail" onClick={(e) => e.stopPropagation()}>
            <button className="cal-detail__close" onClick={() => setDetail(null)} aria-label="Close">
              <X size={18} />
            </button>
            <span className="cal-detail__date">
              {formatDayHeading(new Date(detail.date + "T00:00:00"))} · {formatTimeLabel(detail.time)}
            </span>
            <h3 className="cal-detail__title">{detailTitle?.name ?? "Untitled"}</h3>
            <div className="cal-detail__actions">
              {detailTitle && (
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    onOpenTitle(detailTitle);
                    setDetail(null);
                  }}
                >
                  View details
                </button>
              )}
              <button className="btn btn--ghost" onClick={() => toggleStatus(detail.id)}>
                {detail.status === "watched" ? <Clock size={16} /> : <Check size={16} />}
                {detail.status === "watched" ? "Mark as planned" : "Mark as watched"}
              </button>
              <button className="cal-detail__delete" onClick={() => removeEntry(detail.id)}>
                <Trash2 size={16} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
