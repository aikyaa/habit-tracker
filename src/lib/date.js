// Date helpers, extracted from App.jsx. All work in *local* time so day
// boundaries don't drift by a day the way UTC-based math can.

export function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr() {
  return toDateStr(new Date());
}

export function daysUntil(dueDate) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  return Math.round((due - today) / 86400000);
}

export function urgencyClass(days) {
  if (days === null) return "";
  if (days < 0) return "overdue";
  if (days <= 1) return "urgent";
  if (days <= 3) return "soon";
  return "later";
}

export function daysLabel(days) {
  if (days === null) return "No date";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days}d left`;
}
