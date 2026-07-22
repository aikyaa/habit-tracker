"""SQLAlchemy tables. These mirror the shapes the frontend already used in
localStorage, so the migration is a swap of *where* data lives, not *what* it
looks like. Dates/times are stored as strings (YYYY-MM-DD, HH:MM) to match the
frontend exactly and keep this teaching project simple.
"""

from sqlalchemy import Boolean, Column, Integer, String

from db import Base


class Task(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    course = Column(String, default="")
    due_date = Column(String, default="")  # "YYYY-MM-DD" or ""
    done = Column(Boolean, default=False)


class Habit(Base):
    __tablename__ = "habits"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    color = Column(String, default="")


class HabitLog(Base):
    __tablename__ = "habit_logs"
    id = Column(String, primary_key=True)
    habit_id = Column(String, index=True, nullable=False)
    date = Column(String, nullable=False)  # "YYYY-MM-DD"
    count = Column(Integer, default=1)


class Session(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True)
    course = Column(String, default="")
    minutes = Column(Integer, nullable=False)
    date = Column(String, nullable=False)


class Event(Base):
    __tablename__ = "events"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    date = Column(String, nullable=False)  # "YYYY-MM-DD"
    start = Column(String, nullable=False)  # "HH:MM"
    end = Column(String, nullable=False)
