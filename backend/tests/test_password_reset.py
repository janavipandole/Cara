def test_forgot_password_nonexistent_email(client):
    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "nonexistent@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


def test_forgot_password_dummy_token_without_smtp(client, monkeypatch):
    # With SMTP unset, the endpoint returns a dummy reset token directly so the
    # frontend fallback flow can continue.
    from app.api import auth as auth_api
    monkeypatch.setattr(auth_api, "SMTP_HOST", "")
    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "ghost@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "reset_token" in data
    assert data["reset_token"].startswith("dummy_")


def test_reset_password_accepts_dummy_token(client, monkeypatch):
    from app.api import auth as auth_api
    monkeypatch.setattr(auth_api, "SMTP_HOST", "")
    # Generate a valid dummy token the same way the endpoint does.
    token = auth_api.generate_dummy_token()
    response = client.post(
        "/api/auth/reset-password",
        json={"token": token, "new_password": "NewPass@456"},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Password has been reset successfully"


def test_forgot_password_existing_email(client, db_session):
    from app.models import User
    from passlib.context import CryptContext
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

    user = User(
        username="forgotuser",
        email="test@example.com",
        hashed_password=pwd.hash("Test@1234"),
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "test@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


def test_reset_password_valid_token(client, db_session):
    from app.models import User, PasswordResetToken
    from passlib.context import CryptContext
    from datetime import datetime, timedelta, timezone
    import secrets
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

    user = User(
        username="testuser_reset",
        email="test_reset@example.com",
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
