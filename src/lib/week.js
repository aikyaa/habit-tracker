import { toDateStr } from "./date.js";

// Monday-based start of the week containing `date`.
export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - day);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// The seven date strings of the week starting at `weekStart`.
export function weekDates(weekStart) {
  return Array.from({ length: 7 }, (_, i) => toDateStr(addDays(weekStart, i)));
}

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
