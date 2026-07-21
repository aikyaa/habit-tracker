// ---------------------------------------------------------------------------
// Calendar collision layout — the "hard problem" of the project.
//
// Given a day's events (each with numeric start/end in minutes from midnight),
// lay overlapping events out in side-by-side columns like Google Calendar.
//
// Approach (this is the interview whiteboard answer):
//   1. Sort events by start time (ties broken by end time).
//   2. Sweep through, grouping events that overlap — directly or transitively —
//      into a "cluster". A cluster ends the moment an event starts at or after
//      the latest end seen so far (nothing left to overlap).
//   3. Within a cluster, greedily assign each event to the first column whose
//      previous event has already ended (classic interval partitioning /
//      "meeting rooms"). The number of columns used is the cluster's width.
//   4. Each event's horizontal position: left = col / cols, width = 1 / cols.
//
// Complexity: O(n log n) for the sort, O(n · k) for the sweep where k is the
// max concurrent overlap (small in practice). Pure function — no DOM, no React
// — which is exactly why it's easy to unit-test in isolation.
// ---------------------------------------------------------------------------

export function layoutDay(events) {
  const sorted = [...events].sort((a, b) => a.start - b.start || a.end - b.end);

  const result = {}; // id -> { left, width, col, cols }
  let cluster = []; // events in the current overlapping group
  let clusterEnd = -Infinity; // latest end time seen in this cluster

  const flush = () => {
    if (cluster.length === 0) return;
    const columns = []; // each holds the end time of its last-placed event
    cluster.forEach((ev) => {
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        if (columns[c] <= ev.start) {
          columns[c] = ev.end;
          ev._col = c;
          placed = true;
          break;
        }
      }
      if (!placed) {
        ev._col = columns.length;
        columns.push(ev.end);
      }
    });
    const cols = columns.length;
    cluster.forEach((ev) => {
      result[ev.id] = {
        col: ev._col,
        cols,
        left: ev._col / cols,
        width: 1 / cols,
      };
    });
    cluster = [];
  };

  sorted.forEach((ev) => {
    // If this event starts at/after everything so far, the previous cluster is
    // complete — lay it out and start fresh.
    if (ev.start >= clusterEnd && cluster.length > 0) flush();
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, ev.end);
  });
  flush();

  return result;
}

// Convenience: "HH:MM" -> minutes from midnight (and back), used by the UI.
export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function toHHMM(min) {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}
