"""Unique-constraint races in register/subscribe must not leak 500s."""
import sqlalchemy.orm
from sqlalchemy.exc import IntegrityError


def _boom_commit(self):
    raise IntegrityError("INSERT", {}, Exception("unique constraint"))


def test_register_returns_409_on_integrity_error(client, monkeypatch):
    """A concurrent duplicate insert surfaces as 409, not an unhandled 500."""
    monkeypatch.setattr(sqlalchemy.orm.Session, "commit", _boom_commit)

    resp = client.post(
        "/api/auth/register",
        json={
            "username": "raceuser",
            "email": "race@example.com",
            "password": "Secure123@",
        },
    )
    assert resp.status_code == 409
    assert "already" in resp.json()["detail"].lower()


def test_newsletter_subscribe_handles_integrity_error(client, monkeypatch):
    """A concurrent duplicate subscription is treated as processed, not 500."""
    monkeypatch.setattr(sqlalchemy.orm.Session, "commit", _boom_commit)

    resp = client.post("/api/newsletter/subscribe", json={"email": "race@example.com"})
    assert resp.status_code == 201
    assert resp.json()["message"] == "Subscription request processed"
