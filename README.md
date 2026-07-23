# Momentum

A student productivity assistant: deadline manager at its core, plus a focus
timer, habit heatmap, a daily intention, weekly stats, and a collision-aware
weekly calendar. React + Vite frontend, FastAPI + SQLAlchemy backend, shipped
through a GitHub Actions CI/CD pipeline.

## Features
- **Deadlines** — full CRUD with course tags, due dates, urgency colors, and a "due this week" filter.
- **Focus timer** — Pomodoro (25/5) that logs focused minutes.
- **Habits** — GitHub-style heatmap with intensity + current/longest streaks.
- **Daily intention** — one line that matters today; resets each morning.
- **Weekly stats** — focus minutes, tasks done, active habits.
- **Calendar** — weekly view where overlapping events lay out side-by-side via a real collision algorithm.

## Run the frontend

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (date, streaks, stats, collision)
npm run lint       # ESLint
```

## Run the backend (optional — app works on localStorage without it)

```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload    # http://localhost:8000, docs at /docs
pytest
```

See [`server/README.md`](./server/README.md) for how to point the frontend at
the API.

## Project structure
```
src/
  components/   # Deadlines, FocusTimer, Habits, HabitCard, Calendar, DailyIntention, StatsBar
  hooks/        # useLocalStorage, useTimer, useDailyIntention
  lib/          # date, storage, streaks, stats, collision, week  (+ *.test.js)
  api/          # REST client mirroring the backend
server/         # FastAPI + SQLAlchemy + Pydantic (models, schemas, crud, main, tests)
.github/workflows/ci.yml   # lint · test · build · pytest · deploy
```

## Architecture notes
- CRUD lives behind a boundary (`hooks/useLocalStorage` on the frontend,
  `crud.py` factory on the backend), so storage can change without rewriting
  features.
- The calendar collision layout (`lib/collision.js`) is a pure
  interval-partitioning function, unit-tested in isolation.
- CI runs on every push/PR; pair with branch protection on `main`.
