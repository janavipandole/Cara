"""Password reset: forgot-password delivers a one-time reset link, reset-password consumes it."""
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext

from app.models import User, PasswordResetToken
from tests.conftest import TestingSessionLocal

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
FORGOT_URL = "/api/auth/forgot-password"
RESET_URL = "/api/auth/reset-password"


def _seed_user(email="resetflow@example.com", username="resetflow", password="OldPass@123"):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            username=username,
            email=email,
            hashed_password=pwd.hash(password),
        )
        db.add(user)
        db.commit()
    db.close()


def _token_from_reset_link(link):
    return link.split("token=", 1)[1]


def _capture_reset_link(client, email, monkeypatch):
    """Requests a reset and returns the token from the (mocked) email link."""
    captured = {}

    def fake_send(to_email, reset_token):
        captured["email"] = to_email
        captured["token"] = reset_token

    from app.api import auth as auth_api

    monkeypatch.setattr(auth_api, "send_password_reset_email", fake_send)

    resp = client.post(FORGOT_URL, json={"email": email})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "message" in data
    # The API deliberately never returns the token itself.
    assert "reset_token" not in data
    return captured


def test_forgot_password_nonexistent_email(client, monkeypatch):
    from app.api import auth as auth_api

    called = []
    monkeypatch.setattr(auth_api, "send_password_reset_email", lambda *a, **k: called.append(a))

    response = client.post(FORGOT_URL, json={"email": "nonexistent@example.com"})
    assert response.status_code == 200
    assert "message" in response.json()
    assert called == []


def test_forgot_password_sends_reset_link(client, monkeypatch):
    _seed_user()
    captured = _capture_reset_link(client, "resetflow@example.com", monkeypatch)
    assert captured["email"] == "resetflow@example.com"
    assert captured["token"]


def test_reset_password_full_flow(client, monkeypatch):
    _seed_user()
    captured = _capture_reset_link(client, "resetflow@example.com", monkeypatch)
    token = captured["token"]

    response = client.post(
        RESET_URL,
        json={"token": token, "new_password": "NewPass@456"},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Password has been reset successfully"

    # Old password no longer works; the new one does.
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "resetflow@example.com").first()
    assert pwd.verify("OldPass@123", user.hashed_password) is False
    assert pwd.verify("NewPass@456", user.hashed_password) is True
    db.close()

    # The token is single-use.
    replay = client.post(
        RESET_URL,
        json={"token": token, "new_password": "Another@789"},
    )
    assert replay.status_code == 400
    assert "Invalid or expired" in replay.json()["detail"]


def test_reset_password_expired_token(client):
    db = TestingSessionLocal()
    user = User(
        username="resettestexp",
        email="resettest-expired@example.com",
        hashed_password=pwd.hash("OldPass@123"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    expired = PasswordResetToken(
        user_id=user.id,
        token="expired-token-abc",
        expires_at=datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(hours=1),
    )
    db.add(expired)
    db.commit()
    db.close()

    response = client.post(
        RESET_URL,
        json={"token": "expired-token-abc", "new_password": "NewPass@456"},
    )
    assert response.status_code == 400
    assert "Invalid or expired" in response.json()["detail"]


def test_reset_password_invalid_token(client):
    response = client.post(
        RESET_URL,
        json={"token": "invalidtoken123", "new_password": "NewPass@456"},
    )
    assert response.status_code == 400
    assert "Invalid or expired" in response.json()["detail"]


def test_reset_password_revokes_refresh_session(client):
    from app.models import User, PasswordResetToken
    from app.api import auth as auth_api
    from passlib.context import CryptContext
    from datetime import datetime, timedelta, timezone
    from tests.conftest import TestingSessionLocal
    import secrets

    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    db = TestingSessionLocal()
    user = User(
        username="resetrevoke",
        email="resetrevoke@example.com",
        hashed_password=pwd.hash("OldPass@123"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    auth_api.active_refresh_jtis[user.email] = "stolen-jti"
    token = secrets.token_urlsafe(32)
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
    )
    db.commit()
    db.close()

    response = client.post(
        "/api/auth/reset-password",
        json={"token": token, "new_password": "NewPass@456"},
    )
    assert response.status_code == 200
    assert "resetrevoke@example.com" not in auth_api.active_refresh_jtis
