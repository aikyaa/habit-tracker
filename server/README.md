# Momentum API (FastAPI backend — Phase 2)

Turns the frontend's localStorage CRUD into a real REST API backed by a
relational database. Auto-generated interactive docs at **`/docs`**.

## Stack
- **FastAPI** — routing, validation, OpenAPI/Swagger docs for free.
- **SQLAlchemy** — ORM / relational schema (`models.py`).
- **Pydantic** — request/response validation (`schemas.py`).
- **SQLite** by default; set `DATABASE_URL` to a Postgres URL for deployment.

## Run it

```bash
cd server
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload        # http://localhost:8000  (docs at /docs)
```

## Test it

```bash
pytest                            # from the server/ folder
```

Tests run against an in-memory SQLite DB (the real `app.db` is never touched).

## Endpoints

Every resource has the same shape:

| Method | Path            | Purpose        |
|--------|-----------------|----------------|
| GET    | `/tasks`        | list           |
| POST   | `/tasks`        | create         |
| PUT    | `/tasks/{id}`   | update         |
| DELETE | `/tasks/{id}`   | delete         |

Resources: `/tasks`, `/habits`, `/habit-logs`, `/sessions`, `/events`, plus
`/health`. All generated from one factory in `crud.py`.

## Connecting the frontend

The React app ships on localStorage so it runs with no backend. To move a
feature onto the API:

1. Start this server (`uvicorn main:app --reload`).
2. In the frontend, set `VITE_API_URL=http://localhost:8000` (e.g. in `.env`).
3. Swap a feature's `useLocalStorage(...)` for calls to `src/api/client.js`,
   e.g. `api.tasks.list()` / `api.tasks.create(data)`. Because the CRUD verbs
   match, the component's logic barely changes — that's the payoff of having
   hidden storage behind a boundary from day one.
