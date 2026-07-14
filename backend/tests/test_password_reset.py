def test_forgot_password_nonexistent_email(client):
    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "nonexistent@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


def test_forgot_password_existing_email(client, db_session):
    from backend.app.models import User
    from passlib.context import CryptContext
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

    user = User(
        username="testuser",
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
    assert "message" in data


def test_reset_password_valid_token(client, db_session):
    from backend.app.models import User, PasswordResetToken
    from passlib.context import CryptContext
    from datetime import datetime, timedelta, timezone
    import secrets
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

    user = User(
        username="testuser",
        email="test@example.com",
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
