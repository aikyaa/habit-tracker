// ---------------------------------------------------------------------------
// REST client for the FastAPI backend (Phase 2).
//
// This is the "swap" the whole project was designed around: the frontend still
// does create/read/update/delete, but now over HTTP instead of localStorage.
// Each resource exposes the same verbs, so a component can move from
// useLocalStorage to this with minimal change (see server/README.md).
//
// NOTE: the app still ships on localStorage by default so it runs with no
// backend. Point VITE_API_URL at a running server and switch a feature over to
// these functions to go full-stack.
// ---------------------------------------------------------------------------

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.status === 204 ? null : res.json();
}

// Build a client for one resource (e.g. resource("/tasks")).
function resource(path) {
  return {
    list: () => request("GET", path),
    create: (data) => request("POST", path, data),
    update: (id, data) => request("PUT", `${path}/${id}`, data),
    remove: (id) => request("DELETE", `${path}/${id}`),
  };
}

export const api = {
  tasks: resource("/tasks"),
  habits: resource("/habits"),
  habitLogs: resource("/habit-logs"),
  sessions: resource("/sessions"),
  events: resource("/events"),
};
