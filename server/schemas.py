"""Pydantic schemas — the request/response contract, validated automatically.

For each resource there's a *Create* schema (what the client sends, no id) and a
*Read* schema (what we return, with id). `from_attributes=True` lets FastAPI turn
a SQLAlchemy row straight into JSON. These also power the auto-generated Swagger
docs at /docs.
"""

from pydantic import BaseModel, ConfigDict


class _Read(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---- Task ----
class TaskCreate(BaseModel):
    title: str
    course: str = ""
    due_date: str = ""
    done: bool = False


class TaskRead(_Read, TaskCreate):
    id: str


# ---- Habit ----
class HabitCreate(BaseModel):
    name: str
    color: str = ""


class HabitRead(_Read, HabitCreate):
    id: str


# ---- HabitLog ----
class HabitLogCreate(BaseModel):
    habit_id: str
    date: str
    count: int = 1


class HabitLogRead(_Read, HabitLogCreate):
    id: str


# ---- Session ----
class SessionCreate(BaseModel):
    course: str = ""
    minutes: int
    date: str


class SessionRead(_Read, SessionCreate):
    id: str


# ---- Event ----
class EventCreate(BaseModel):
    title: str
    date: str
    start: str
    end: str


class EventRead(_Read, EventCreate):
    id: str
