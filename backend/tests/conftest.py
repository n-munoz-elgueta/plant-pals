import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.seed import seed_species


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with TestingSession() as session:
        seed_species(session)
        yield session


@pytest.fixture()
def client(db_session, tmp_path, monkeypatch):
    from app import config

    media_dir = tmp_path / "media"
    media_dir.mkdir()
    monkeypatch.setattr(config, "MEDIA_DIR", media_dir)

    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def make_user(client):
    """Register a user and return auth headers for them."""

    def _make(email="ash@example.com", name="Ash", password="password123"):
        res = client.post(
            "/auth/register",
            json={"email": email, "password": password, "display_name": name},
        )
        assert res.status_code == 201, res.text
        return {"Authorization": f"Bearer {res.json()['access_token']}"}

    return _make


@pytest.fixture()
def household_user(client, make_user):
    """A registered user who already created a household."""
    headers = make_user()
    res = client.post("/households", json={"name": "Jungle"}, headers=headers)
    assert res.status_code == 201, res.text
    return headers
