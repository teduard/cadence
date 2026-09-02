import type { Title, WatchEntry } from "../../types";
import { EventChip } from "./EventChip";
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  monthGridDays,
  weekDays,
  isSameDay,
  toDateKey,
  timeToMinutes,
  formatHourLabel,
} from "../../lib/calendarUtils";

type ByDate = Map<string, WatchEntry[]>;

function titleFor(titles: Title[], id: string) {
  return titles.find((t) => t.id === id);
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 52; // px per hour row

// ---------- Month view ----------

export function MonthView({
  cursor,
  today,
  entriesByDate,
  titles,
  onDayClick,
  onEventClick,
}: {
  cursor: Date;
  today: Date;
  entriesByDate: ByDate;
  titles: Title[];
  onDayClick: (d: Date) => void;
  onEventClick: (e: WatchEntry) => void;
}) {
  const days = monthGridDays(cursor);
  const month = cursor.getMonth();

  return (
    <div className="cal-month">
      <div className="cal-month__weekdays">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="cal-month__grid">
        {days.map((d) => {
          const key = toDateKey(d);
          const entries = entriesByDate.get(key) ?? [];
          const inMonth = d.getMonth() === month;
          const isToday = isSameDay(d, today);
          return (
            <button
              key={key}
              className={`cal-month__cell ${inMonth ? "" : "cal-month__cell--muted"} ${isToday ? "cal-month__cell--today" : ""}`}
              onClick={() => onDayClick(d)}
            >
              <span className={`cal-month__date ${isToday ? "cal-month__date--today" : ""}`}>{d.getDate()}</span>
              <span className="cal-month__events">
                {entries.slice(0, 3).map((e) => (
                  <EventChip
                    key={e.id}
                    entry={e}
                    title={titleFor(titles, e.titleId)}
                    dense
                    onClick={() => onEventClick(e)}
                  />
                ))}
                {entries.length > 3 && <span className="cal-month__more">+{entries.length - 3} more</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Week view ----------

export function WeekView({
  cursor,
  today,
  entriesByDate,
  titles,
  onEventClick,
  onSlotClick,
}: {
  cursor: Date;
  today: Date;
  entriesByDate: ByDate;
  titles: Title[];
  onEventClick: (e: WatchEntry) => void;
  onSlotClick: (d: Date) => void;
}) {
  const days = weekDays(cursor);

  return (
    <div className="cal-timeline">
      <div className="cal-timeline__header">
        <div className="cal-timeline__gutter" />
        {days.map((d) => {
          const isToday = isSameDay(d, today);
          return (
            <div key={toDateKey(d)} className="cal-timeline__day-head">
              <span className="cal-timeline__day-name">{WEEKDAY_LABELS[d.getDay()]}</span>
              <span className={`cal-timeline__day-num ${isToday ? "cal-timeline__day-num--today" : ""}`}>
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="cal-timeline__body">
        <div className="cal-timeline__gutter">
          {HOURS.map((h) => (
            <div key={h} className="cal-timeline__hour-label" style={{ height: HOUR_HEIGHT }}>
              {h > 0 && formatHourLabel(h)}
            </div>
          ))}
        </div>
        {days.map((d) => {
          const key = toDateKey(d);
          const entries = entriesByDate.get(key) ?? [];
          return (
            <div
              key={key}
              className="cal-timeline__col"
              style={{ height: HOUR_HEIGHT * 24 }}
              onClick={() => onSlotClick(d)}
            >
              {HOURS.map((h) => (
                <div key={h} className="cal-timeline__hour-line" style={{ top: h * HOUR_HEIGHT }} />
              ))}
              {entries.map((e) => {
                const top = (timeToMinutes(e.time) / 60) * HOUR_HEIGHT;
                return (
                  <div key={e.id} className="cal-timeline__event" style={{ top, height: HOUR_HEIGHT - 4 }}>
                    <EventChip entry={e} title={titleFor(titles, e.titleId)} onClick={() => onEventClick(e)} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Day view ----------

export function DayView({
  cursor,
  entriesByDate,
  titles,
  onEventClick,
  onSlotClick,
}: {
  cursor: Date;
  entriesByDate: ByDate;
  titles: Title[];
  onEventClick: (e: WatchEntry) => void;
  onSlotClick: (d: Date) => void;
}) {
  const key = toDateKey(cursor);
  const entries = entriesByDate.get(key) ?? [];

  return (
    <div className="cal-timeline cal-timeline--single">
      <div className="cal-timeline__body">
        <div className="cal-timeline__gutter">
          {HOURS.map((h) => (
            <div key={h} className="cal-timeline__hour-label" style={{ height: HOUR_HEIGHT }}>
              {h > 0 && formatHourLabel(h)}
            </div>
          ))}
        </div>
        <div
          className="cal-timeline__col cal-timeline__col--wide"
          style={{ height: HOUR_HEIGHT * 24 }}
          onClick={() => onSlotClick(cursor)}
        >
          {HOURS.map((h) => (
            <div key={h} className="cal-timeline__hour-line" style={{ top: h * HOUR_HEIGHT }} />
          ))}
          {entries.map((e) => {
            const top = (timeToMinutes(e.time) / 60) * HOUR_HEIGHT;
            const title = titleFor(titles, e.titleId);
            return (
              <div key={e.id} className="cal-timeline__event cal-timeline__event--wide" style={{ top, height: HOUR_HEIGHT - 4 }}>
                <button
                  className="cal-timeline__event-full"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onEventClick(e);
                  }}
                >
                  <EventChip entry={e} title={title} onClick={() => onEventClick(e)} />
                  {title && <span className="cal-timeline__event-meta">{title.duration} · {title.kind === "series" ? "Series" : "Movie"}</span>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Year view ----------

export function YearView({
  cursor,
  today,
  entriesByDate,
  onMonthClick,
  onDayClick,
}: {
  cursor: Date;
  today: Date;
  entriesByDate: ByDate;
  onMonthClick: (monthIndex: number) => void;
  onDayClick: (d: Date) => void;
}) {
  const year = cursor.getFullYear();

  return (
    <div className="cal-year">
      {MONTH_LABELS.map((label, mi) => {
        const monthDate = new Date(year, mi, 1);
        const days = monthGridDays(monthDate);
        return (
          <div key={label} className="cal-year__month">
            <button className="cal-year__month-label" onClick={() => onMonthClick(mi)}>
              {label}
            </button>
            <div className="cal-year__weekdays">
              {WEEKDAY_LABELS.map((w) => (
                <span key={w}>{w[0]}</span>
              ))}
            </div>
            <div className="cal-year__grid">
              {days.map((d) => {
                const key = toDateKey(d);
                const hasEntries = entriesByDate.has(key);
                const inMonth = d.getMonth() === mi;
                const isToday = isSameDay(d, today);
                return (
                  <button
                    key={key}
                    className={`cal-year__day ${inMonth ? "" : "cal-year__day--muted"} ${isToday ? "cal-year__day--today" : ""}`}
                    onClick={() => onDayClick(d)}
                  >
                    {d.getDate()}
                    {hasEntries && <span className="cal-year__dot" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
