"""API tests. We point the app at a throwaway in-memory SQLite database by
overriding the get_db dependency, so tests never touch the real app.db.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import main
from db import Base, get_db

# A fresh in-memory DB shared across the connection pool for the test session.
engine = create_engine(
    "sqlite:///:memory:", connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


main.app.dependency_overrides[get_db] = override_get_db
client = TestClient(main.app)


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_task_crud_lifecycle():
    # create
    r = client.post("/tasks", json={"title": "DBMS assignment", "course": "CS301"})
    assert r.status_code == 201
    task = r.json()
    assert task["title"] == "DBMS assignment"
    assert task["done"] is False
    tid = task["id"]

    # list
    assert len(client.get("/tasks").json()) == 1

    # update
    r = client.put(f"/tasks/{tid}", json={"title": "DBMS assignment", "done": True})
    assert r.status_code == 200
    assert r.json()["done"] is True

    # delete
    assert client.delete(f"/tasks/{tid}").status_code == 204
    assert client.get("/tasks").json() == []


def test_update_missing_returns_404():
    r = client.put("/tasks/nope", json={"title": "x"})
    assert r.status_code == 404


def test_event_create_and_list():
    client.post(
        "/events",
        json={"title": "Lecture", "date": "2026-07-22", "start": "09:00", "end": "10:00"},
    )
    events = client.get("/events").json()
    assert len(events) == 1
    assert events[0]["start"] == "09:00"
