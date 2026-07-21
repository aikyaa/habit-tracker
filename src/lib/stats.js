import { toDateStr } from "./date.js";

// The trailing 7 calendar dates (today back through 6 days ago), oldest first.
export function last7Dates() {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(toDateStr(d));
  }
  return out;
}

// Roll up this week's numbers for the stats bar: focus minutes, completed
// tasks, and how many distinct habits got at least one log.
export function weeklyStats(sessions, tasks, habitLogs) {
  const week = new Set(last7Dates());

  const focusMinutes = sessions
    .filter((s) => week.has(s.date))
    .reduce((sum, s) => sum + s.minutes, 0);

  const tasksDone = tasks.filter((t) => t.done).length;

  const activeHabits = new Set(
    habitLogs.filter((l) => week.has(l.date) && l.count > 0).map((l) => l.habitId)
  ).size;

  return { focusMinutes, tasksDone, activeHabits };
}
