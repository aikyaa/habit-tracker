"""Database wiring: engine, session factory, and the get_db dependency.

Phase 2 swaps the browser's localStorage for a real relational database. We use
SQLite by default (a single file, zero setup) and read DATABASE_URL from the
environment so the same code points at Postgres in deployment — no code change.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# check_same_thread is a SQLite-only quirk (it's picky about threads); harmless
# to guard so the same line works for Postgres too.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency: hand out a session, always close it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
