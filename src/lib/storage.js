// Thin localStorage wrapper. Phase 1: pulled out of App.jsx so every feature
// reads/writes through one place instead of hand-rolling try/catch everywhere.

export const KEYS = {
  tasks: "momentum.tasks.v0",
  sessions: "momentum.sessions.v0",
  habits: "momentum.habits.v0",
  habitLogs: "momentum.habitLogs.v0",
  intention: "momentum.intention.v0", // { date, text } — one line per day
};

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota full / private mode — nothing sensible to do, just don't crash.
  }
}
