import { useState, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// PHASE 0 (still messy, now MUCH bigger). Deadlines + Pomodoro timer + habit
// heatmap all live in this one file. Notice how much is crammed in here now:
// four localStorage keys, three feature UIs, date math, a ticking timer, streak
// logic. This is the pain that motivates Phase 1 — we'll split this into
// components/, hooks/, and a store/ module. For now, it works.
// ---------------------------------------------------------------------------

const KEYS = {
  tasks: "momentum.tasks.v0",
  sessions: "momentum.sessions.v0",
  habits: "momentum.habits.v0",
  habitLogs: "momentum.habitLogs.v0", // array of { habitId, date, count }
};

// Generic load helper — localStorage only stores strings, so parse back.
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ---- date helpers -----------------------------------------------------------
function todayStr() {
  return toDateStr(new Date());
}
function toDateStr(d) {
  // YYYY-MM-DD in local time (not UTC — avoids off-by-one at day boundaries).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function daysUntil(dueDate) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  return Math.round((due - today) / 86400000);
}
function urgencyClass(days) {
  if (days === null) return "";
  if (days < 0) return "overdue";
  if (days <= 1) return "urgent";
  if (days <= 3) return "soon";
  return "later";
}
function daysLabel(days) {
  if (days === null) return "No date";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days}d left`;
}

export default function App() {
  const [view, setView] = useState("deadlines"); // "deadlines" | "habits"

  return (
    <div className="app">
      <header className="app__header">
        <h1>Momentum</h1>
        <nav className="tabs">
          <button
            className={view === "deadlines" ? "tab tab--active" : "tab"}
            onClick={() => setView("deadlines")}
          >
            Deadlines
          </button>
          <button
            className={view === "habits" ? "tab tab--active" : "tab"}
            onClick={() => setView("habits")}
          >
            Habits
          </button>
        </nav>
      </header>

      {/* The timer sits above both views so a focus session keeps running
          even while you switch tabs. */}
      <FocusTimer />

      {view === "deadlines" ? <Deadlines /> : <Habits />}
    </div>
  );
}

// =============================================================================
// DEADLINES
// =============================================================================
function Deadlines() {
  const [tasks, setTasks] = useState(() => load(KEYS.tasks, []));
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [weekOnly, setWeekOnly] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
  }, [tasks]);

  function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setTasks([
      ...tasks,
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        course: course.trim(),
        dueDate,
        done: false,
      },
    ]);
    setTitle("");
    setCourse("");
    setDueDate("");
  }
  const toggleDone = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  let visible = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31");
  });

  // "Due this week" = not done, has a date, and due within the next 7 days
  // (including overdue items, which are the most urgent).
  if (weekOnly) {
    visible = visible.filter((t) => {
      if (t.done || !t.dueDate) return false;
      const d = daysUntil(t.dueDate);
      return d !== null && d <= 7;
    });
  }

  const openCount = tasks.filter((t) => !t.done).length;

  return (
    <>
      <p className="tagline">
        {openCount === 0
          ? "All clear — nice."
          : `${openCount} deadline${openCount === 1 ? "" : "s"} on your plate`}
      </p>

      <form className="card form" onSubmit={addTask}>
        <input
          className="form__title"
          placeholder="What's due? (e.g. DBMS assignment 3)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="form__row">
          <input
            placeholder="Course (optional)"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button type="submit">Add</button>
        </div>
      </form>

      <div className="filterbar">
        <button
          className={weekOnly ? "chip chip--active" : "chip"}
          onClick={() => setWeekOnly(false)}
        >
          All
        </button>
        <button
          className={weekOnly ? "chip chip--active" : "chip"}
          onClick={() => setWeekOnly(true)}
        >
          Due this week
        </button>
      </div>

      <section className="list">
        {visible.length === 0 && (
          <p className="empty">
            {weekOnly ? "Nothing due this week. Breathe." : "No deadlines yet."}
          </p>
        )}
        {visible.map((task) => {
          const days = daysUntil(task.dueDate);
          return (
            <div
              key={task.id}
              className={`card task ${task.done ? "task--done" : ""}`}
            >
              <label className="task__check">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleDone(task.id)}
                />
              </label>
              <div className="task__body">
                <span className="task__title">{task.title}</span>
                {task.course && (
                  <span className="task__course">{task.course}</span>
                )}
              </div>
              {!task.done && (
                <span className={`pill pill--${urgencyClass(days)}`}>
                  {daysLabel(days)}
                </span>
              )}
              <button
                className="task__delete"
                onClick={() => deleteTask(task.id)}
                aria-label="Delete"
              >
                ×
              </button>
            </div>
          );
        })}
      </section>
    </>
  );
}

// =============================================================================
// FOCUS TIMER (Pomodoro)
// =============================================================================
const FOCUS_MIN = 25;
const BREAK_MIN = 5;

function FocusTimer() {
  const [mode, setMode] = useState("focus"); // "focus" | "break"
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MIN * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(() => load(KEYS.sessions, []));
  const intervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
  }, [sessions]);

  // The ticking engine. We store the interval id in a ref so re-renders don't
  // spawn duplicate timers. Cleanup clears it whenever `running` flips.
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // When the clock hits zero: if it was a focus block, log the minutes.
  useEffect(() => {
    if (secondsLeft > 0) return;
    setRunning(false);
    if (mode === "focus") {
      setSessions((prev) => [
        ...prev,
        { id: crypto.randomUUID(), minutes: FOCUS_MIN, date: todayStr() },
      ]);
      setMode("break");
      setSecondsLeft(BREAK_MIN * 60);
    } else {
      setMode("focus");
      setSecondsLeft(FOCUS_MIN * 60);
    }
  }, [secondsLeft, mode]);

  function reset() {
    setRunning(false);
    setMode("focus");
    setSecondsLeft(FOCUS_MIN * 60);
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const todayMinutes = sessions
    .filter((s) => s.date === todayStr())
    .reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div className={`card timer timer--${mode}`}>
      <div className="timer__left">
        <span className="timer__mode">
          {mode === "focus" ? "Focus" : "Break"}
        </span>
        <span className="timer__clock">
          {mm}:{ss}
        </span>
      </div>
      <div className="timer__controls">
        <button onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Start"}
        </button>
        <button className="btn--ghost" onClick={reset}>
          Reset
        </button>
      </div>
      <div className="timer__today">
        <span className="timer__todaynum">{todayMinutes}</span>
        <span className="timer__todaylabel">min focused today</span>
      </div>
    </div>
  );
}

// =============================================================================
// HABITS — heatmap + streaks
// =============================================================================
const HEATMAP_DAYS = 119; // 17 weeks × 7 — fills a clean GitHub-style grid

function Habits() {
  const [habits, setHabits] = useState(() => load(KEYS.habits, []));
  const [logs, setLogs] = useState(() => load(KEYS.habitLogs, []));
  const [name, setName] = useState("");

  useEffect(() => {
    localStorage.setItem(KEYS.habits, JSON.stringify(habits));
  }, [habits]);
  useEffect(() => {
    localStorage.setItem(KEYS.habitLogs, JSON.stringify(logs));
  }, [logs]);

  function addHabit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setHabits([...habits, { id: crypto.randomUUID(), name: name.trim() }]);
    setName("");
  }
  function deleteHabit(id) {
    setHabits(habits.filter((h) => h.id !== id));
    setLogs(logs.filter((l) => l.habitId !== id));
  }
  // Marking "done today" bumps today's count (intensity). Clicking again keeps
  // adding — e.g. read twice today = darker square.
  function markToday(habitId) {
    const date = todayStr();
    const existing = logs.find(
      (l) => l.habitId === habitId && l.date === date
    );
    if (existing) {
      setLogs(
        logs.map((l) =>
          l === existing ? { ...l, count: l.count + 1 } : l
        )
      );
    } else {
      setLogs([...logs, { habitId, date, count: 1 }]);
    }
  }

  return (
    <>
      <form className="card form" onSubmit={addHabit}>
        <div className="form__row">
          <input
            placeholder="New habit (e.g. Read 30 min)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit">Add</button>
        </div>
      </form>

      {habits.length === 0 && (
        <p className="empty">No habits yet. Add one to start a streak.</p>
      )}

      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          logs={logs.filter((l) => l.habitId === habit.id)}
          onMark={() => markToday(habit.id)}
          onDelete={() => deleteHabit(habit.id)}
        />
      ))}
    </>
  );
}

function HabitCard({ habit, logs, onMark, onDelete }) {
  // Build a quick lookup: date -> count.
  const byDate = {};
  logs.forEach((l) => (byDate[l.date] = l.count));

  // Build the last HEATMAP_DAYS days, oldest first.
  const days = [];
  for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = toDateStr(d);
    days.push({ date: ds, count: byDate[ds] || 0 });
  }

  const { current, longest } = computeStreaks(byDate);
  const doneToday = (byDate[todayStr()] || 0) > 0;

  // Chunk into weeks (columns of 7) for the grid.
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
        <button
          className={doneToday ? "btn--done" : ""}
          onClick={onMark}
        >
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

// Map a count to a 0–4 intensity level (GitHub-style buckets).
function level(count) {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

// Current streak = consecutive days with count>0 ending today (or yesterday, so
// the streak isn't "broken" just because you haven't logged yet today).
// Longest = the longest such run anywhere in the history.
function computeStreaks(byDate) {
  let current = 0;
  const cursor = new Date();
  // allow today to be empty without breaking the streak
  if (!(byDate[toDateStr(cursor)] > 0)) cursor.setDate(cursor.getDate() - 1);
  while (byDate[toDateStr(cursor)] > 0) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const dates = Object.keys(byDate)
    .filter((d) => byDate[d] > 0)
    .sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const d of dates) {
    if (prev) {
      const gap = (new Date(d) - new Date(prev)) / 86400000;
      run = gap === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest };
}
