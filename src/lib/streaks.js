import { toDateStr } from "./date.js";

// Map a habit's daily count to a 0–4 intensity level (GitHub-style buckets).
export function level(count) {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

// current streak = consecutive days with count>0 ending today (or yesterday, so
// the streak isn't "broken" just because you haven't logged yet today).
// longest = the longest such run anywhere in the history.
export function computeStreaks(byDate) {
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
