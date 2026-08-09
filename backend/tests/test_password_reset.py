def test_forgot_password_refuses_without_smtp(client):
    """No SMTP configured -> 503 for every address (no token issued, no enumeration)."""
    for email in ("existing@example.com", "nonexistent@example.com"):
        response = client.post(
            "/api/auth/forgot-password",
            json={"email": email},
        )
        assert response.status_code == 503
        assert "reset_token" not in response.json()


def test_forgot_password_nonexistent_email(client, monkeypatch):
    from app.api import auth as auth_api

    monkeypatch.setattr(auth_api, "SMTP_HOST", "smtp.example.com")
    monkeypatch.setattr(auth_api, "send_password_reset_email", lambda r, t: True)

    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "nonexistent@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "reset_token" not in data


def test_forgot_password_existing_email_does_not_leak_token(client, db_session, monkeypatch):
    from app.models import User, PasswordResetToken
    from app.api import auth as auth_api
    from tests.conftest import TestingSessionLocal
    from passlib.context import CryptContext

    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    user = User(
        username="resetforgotuser",
        email="forgot@example.com",
        hashed_password=pwd.hash("Test@1234"),
    )
    db_session.add(user)
    db_session.commit()

    monkeypatch.setattr(auth_api, "SMTP_HOST", "smtp.example.com")
    monkeypatch.setattr(auth_api, "send_password_reset_email", lambda r, t: True)

    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "forgot@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "reset_token" not in data

    # A one-time token row was still created for the emailed link.
    db = TestingSessionLocal()
    rows = db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.id).all()
    db.close()
    assert len(rows) == 1
    assert rows[0].token


def test_reset_password_valid_token(client, db_session):
    from app.models import User, PasswordResetToken
    from passlib.context import CryptContext
    from datetime import datetime, timedelta, timezone
    import secrets
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

    user = User(
        username="resetvaliduser",
        email="validtoken@example.com",
        hashed_password=pwd.hash("OldPass@123"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = secrets.token_urlsafe(32)
    reset = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db_session.add(reset)
    db_session.commit()

    response = client.post(
        "/api/auth/reset-password",
        json={"token": token, "new_password": "NewPass@456"},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Password has been reset successfully"


def test_reset_password_expired_token(client):
    response = client.post(
        "/api/auth/reset-password",
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
