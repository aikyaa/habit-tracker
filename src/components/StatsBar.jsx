import { load, KEYS } from "../lib/storage.js";
import { weeklyStats } from "../lib/stats.js";

// Read-only weekly snapshot. Reads straight from storage rather than lifting
// state up — it only needs a glance at the numbers, not to mutate them.
export default function StatsBar() {
  const sessions = load(KEYS.sessions, []);
  const tasks = load(KEYS.tasks, []);
  const habitLogs = load(KEYS.habitLogs, []);
  const { focusMinutes, tasksDone, activeHabits } = weeklyStats(
    sessions,
    tasks,
    habitLogs
  );

  return (
    <div className="statsbar">
      <div className="stat">
        <span className="stat__num">{focusMinutes}</span>
        <span className="stat__label">focus min / wk</span>
      </div>
      <div className="stat">
        <span className="stat__num">{tasksDone}</span>
        <span className="stat__label">tasks done</span>
      </div>
      <div className="stat">
        <span className="stat__num">{activeHabits}</span>
        <span className="stat__label">habits active</span>
      </div>
    </div>
  );
}
