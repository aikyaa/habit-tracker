import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { KEYS } from "../lib/storage.js";
import { todayStr } from "../lib/date.js";
import { layoutDay, toMinutes } from "../lib/collision.js";
import { startOfWeek, addDays, weekDates, WEEKDAY_LABELS } from "../lib/week.js";

// Visible window of the day, in hours. Events outside are clamped in.
const DAY_START = 7; // 07:00
const DAY_END = 22; // 22:00
const HOUR_PX = 44; // vertical scale
const START_MIN = DAY_START * 60;
const TOTAL_MIN = (DAY_END - DAY_START) * 60;
const GRID_PX = (DAY_END - DAY_START) * HOUR_PX;

export default function Calendar() {
  const [events, setEvents] = useLocalStorage(KEYS.events, []);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayStr());
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");

  const dates = weekDates(weekStart);

  function addEvent(e) {
    e.preventDefault();
    if (!title.trim() || toMinutes(end) <= toMinutes(start)) return;
    setEvents([
      ...events,
      { id: crypto.randomUUID(), title: title.trim(), date, start, end },
    ]);
    setTitle("");
  }
  const deleteEvent = (id) => setEvents(events.filter((ev) => ev.id !== id));

  const hours = [];
  for (let h = DAY_START; h < DAY_END; h++) hours.push(h);

  return (
    <>
      <form className="card form" onSubmit={addEvent}>
        <input
          className="form__title"
          placeholder="Event (e.g. DBMS lecture)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="form__row">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          <button type="submit">Add</button>
        </div>
      </form>

      <div className="cal__nav">
        <button className="chip" onClick={() => setWeekStart(addDays(weekStart, -7))}>
          ‹ Prev
        </button>
        <span className="cal__range">
          Week of {weekDates(weekStart)[0]}
        </span>
        <button className="chip" onClick={() => setWeekStart(addDays(weekStart, 7))}>
          Next ›
        </button>
        <button className="chip" onClick={() => setWeekStart(startOfWeek(new Date()))}>
          Today
        </button>
      </div>

      <div className="cal card">
        {/* header row: weekday labels */}
        <div className="cal__gutter cal__corner" />
        <div className="cal__head">
          {dates.map((d, i) => (
            <div
              key={d}
              className={`cal__day-label ${d === todayStr() ? "is-today" : ""}`}
            >
              <span>{WEEKDAY_LABELS[i]}</span>
              <span className="cal__daynum">{d.slice(8)}</span>
            </div>
          ))}
        </div>

        {/* body: hour gutter + 7 day columns */}
        <div className="cal__gutter" style={{ height: GRID_PX }}>
          {hours.map((h) => (
            <div key={h} className="cal__hour" style={{ height: HOUR_PX }}>
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        <div className="cal__grid" style={{ height: GRID_PX }}>
          {dates.map((d) => (
            <DayColumn
              key={d}
              events={events.filter((ev) => ev.date === d)}
              onDelete={deleteEvent}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function DayColumn({ events, onDelete }) {
  // Convert to minute-based intervals, feed the collision layout, then map the
  // fractional left/width it returns onto CSS percentages.
  const intervals = events.map((ev) => ({
    id: ev.id,
    start: toMinutes(ev.start),
    end: toMinutes(ev.end),
  }));
  const layout = layoutDay(intervals);

  return (
    <div className="cal__col">
      {events.map((ev) => {
        const s = toMinutes(ev.start);
        const e = toMinutes(ev.end);
        const top = ((s - START_MIN) / TOTAL_MIN) * GRID_PX;
        const height = ((e - s) / TOTAL_MIN) * GRID_PX;
        const pos = layout[ev.id];
        return (
          <div
            key={ev.id}
            className="cal__event"
            style={{
              top: Math.max(0, top),
              height: Math.max(16, height),
              left: `calc(${pos.left * 100}% + 2px)`,
              width: `calc(${pos.width * 100}% - 4px)`,
            }}
            title={`${ev.title} (${ev.start}–${ev.end})`}
            onClick={() => onDelete(ev.id)}
          >
            <span className="cal__event-title">{ev.title}</span>
            <span className="cal__event-time">
              {ev.start}–{ev.end}
            </span>
          </div>
        );
      })}
    </div>
  );
}
