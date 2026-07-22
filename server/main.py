"""FastAPI entrypoint. Creates the tables, wires CORS for the Vite dev server,
and mounts a CRUD router for each resource. Interactive API docs live at /docs.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
import schemas
from crud import make_crud_router
from db import Base, engine

# Create tables on startup. (For real migrations you'd reach for Alembic; this
# is fine for a single-file SQLite teaching app.)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Momentum API", version="1.0.0")

# The frontend runs on Vite's dev server; allow it to call us during dev.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(
    make_crud_router(models.Task, schemas.TaskCreate, schemas.TaskRead, "/tasks", "task")
)
app.include_router(
    make_crud_router(
        models.Habit, schemas.HabitCreate, schemas.HabitRead, "/habits", "habit"
    )
)
app.include_router(
    make_crud_router(
        models.HabitLog,
        schemas.HabitLogCreate,
        schemas.HabitLogRead,
        "/habit-logs",
        "habit-log",
    )
)
app.include_router(
    make_crud_router(
        models.Session,
        schemas.SessionCreate,
        schemas.SessionRead,
        "/sessions",
        "session",
    )
)
app.include_router(
    make_crud_router(
        models.Event, schemas.EventCreate, schemas.EventRead, "/events", "event"
    )
)
