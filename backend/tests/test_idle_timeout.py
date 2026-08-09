"""Server-side idle timeout must reject access and refresh after inactivity,
independent of the client-side session lock script."""
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext


def _login(client, email, password):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def test_idle_timeout_rejects_stale_session(client, db_session):
    from backend.app.models import User

    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    email = "idle@example.com"
    db_session.add(
        User(
            username="idleuser",
            email=email,
            hashed_password=pwd.hash("Idle@1234"),
        )
    )
    db_session.commit()

    login = _login(client, email, "Idle@1234")
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    assert client.get("/api/auth/me", headers=headers).status_code == 200

    # Simulate 16 minutes of inactivity (timeout is 15).
    user = db_session.query(User).filter(User.email == email).first()
    db_session.refresh(user)
    user.last_active_at = datetime.now(timezone.utc) - timedelta(minutes=16)
    db_session.commit()

    # Both access and refresh must now be rejected by the server.
    assert client.get("/api/auth/me", headers=headers).status_code == 401
    assert client.post("/api/auth/refresh").status_code == 401


def test_fresh_login_resets_last_active(client, db_session):
    from backend.app.models import User

    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    email = "idle-fresh@example.com"
    db_session.add(
        User(
            username="idlefresh",
            email=email,
            hashed_password=pwd.hash("Idle@1234"),
        )
    )
    db_session.commit()

    login = _login(client, email, "Idle@1234")
    assert login.status_code == 200

    user = db_session.query(User).filter(User.email == email).first()
    db_session.refresh(user)
    assert user.last_active_at is not None
