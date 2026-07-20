# Momentum

A student productivity assistant — deadline manager at its core, with a focus
timer, habit heatmap, and a collision-aware calendar coming in later phases.
See [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for the full roadmap and the reasoning
behind each decision.

## Status: Phase 0 — messy prototype

Right now the whole app is deliberately crammed into `src/App.jsx`: deadlines
CRUD (create, read, update, delete) persisted to the browser's `localStorage`.
It's intentionally unstructured so we can *feel* the mess before refactoring it
into `components/`, `hooks/`, and `store/` in Phase 1.

### What works
- Add a deadline (title, optional course, optional due date)
- See deadlines sorted by urgency; done items sink to the bottom
- Check off / un-check a deadline
- Delete a deadline
- Color-coded "days left" pill (overdue → red, ≤1d → orange, ≤3d → yellow, later → green)
- Everything survives a page refresh (localStorage)

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To make a production build:

```bash
npm run build
npm run preview
```

## Tech
- **React 18 + Vite** — component UI, fast dev server.
- **localStorage** — the Phase 0 "database". Hidden behind a store module in a
  later phase so it can be swapped for a FastAPI + SQL backend without touching
  the UI.

## Next up (Phase 0 → 1)
1. "Due this week" view
2. Pomodoro focus timer
3. Habit heatmap + streaks
4. Refactor `App.jsx` into components/hooks/store + add unit tests
5. CI/CD pipeline + first deploy
