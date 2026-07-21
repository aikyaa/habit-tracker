import { toDateStr, todayStr } from "../lib/date.js";
import { level, computeStreaks } from "../lib/streaks.js";

const HEATMAP_DAYS = 119; // 17 weeks × 7 — fills a clean GitHub-style grid

export default function HabitCard({ habit, logs, onMark, onDelete }) {
  // date -> count lookup
  const byDate = {};
  logs.forEach((l) => (byDate[l.date] = l.count));

  // last HEATMAP_DAYS days, oldest first
  const days = [];
  for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = toDateStr(d);
    days.push({ date: ds, count: byDate[ds] || 0 });
  }

  const { current, longest } = computeStreaks(byDate);
  const doneToday = (byDate[todayStr()] || 0) > 0;

  // chunk into weeks (columns of 7) for the grid
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="card habit">
      <div className="habit__head">
        <span className="habit__name">{habit.name}</span>
        <div className="habit__streaks">
          <span title="Current streak">🔥 {current}</span>
          <span className="muted" title="Longest streak">
            best {longest}
          </span>
        </div>
        <button className={doneToday ? "btn--done" : ""} onClick={onMark}>
          {doneToday ? "✓ Today" : "Mark today"}
        </button>
        <button className="task__delete" onClick={onDelete} aria-label="Delete">
          ×
        </button>
      </div>

      <div className="heatmap">
        {weeks.map((week, wi) => (
          <div className="heatmap__col" key={wi}>
            {week.map((day) => (
              <div
                key={day.date}
                className={`cell cell--l${level(day.count)}`}
                title={`${day.date}: ${day.count || "none"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
