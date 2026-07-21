import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { KEYS } from "../lib/storage.js";
import { todayStr } from "../lib/date.js";
import HabitCard from "./HabitCard.jsx";

export default function Habits() {
  const [habits, setHabits] = useLocalStorage(KEYS.habits, []);
  const [logs, setLogs] = useLocalStorage(KEYS.habitLogs, []);
  const [name, setName] = useState("");

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
  // "Mark today" bumps today's count (intensity). Click again to add more —
  // e.g. read twice today = darker square.
  function markToday(habitId) {
    const date = todayStr();
    const existing = logs.find((l) => l.habitId === habitId && l.date === date);
    if (existing) {
      setLogs(
        logs.map((l) => (l === existing ? { ...l, count: l.count + 1 } : l))
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
