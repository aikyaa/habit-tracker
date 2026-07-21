import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { KEYS } from "../lib/storage.js";
import { daysUntil, urgencyClass, daysLabel } from "../lib/date.js";

export default function Deadlines() {
  const [tasks, setTasks] = useLocalStorage(KEYS.tasks, []);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [weekOnly, setWeekOnly] = useState(false);

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

  // "Due this week" = not done, has a date, due within 7 days (overdue included).
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
          className={weekOnly ? "chip" : "chip chip--active"}
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
