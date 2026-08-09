"""Password-reset token rows must be purged so the table does not grow
without bound."""
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext

from app.models import PasswordResetToken, User

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _user(db, username, email):
    user = User(
        username=username,
        email=email,
        hashed_password=pwd.hash("OldPass@123"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _token(db, user, *, expired=False):
    token = PasswordResetToken(
        user_id=user.id,
        token=__import__("secrets").token_urlsafe(32),
        expires_at=datetime.now(timezone.utc)
        + (timedelta(minutes=-30) if expired else timedelta(hours=1)),
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


def test_reset_purges_used_and_outstanding_tokens(client, db_session):
    user = _user(db_session, "purgeuser", "purge@example.com")
    used_token = _token(db_session, user)
    outstanding = _token(db_session, user)

    response = client.post(
        "/api/auth/reset-password",
        json={"token": used_token.token, "new_password": "NewPass@456"},
    )
    assert response.status_code == 200

    db_session.expire_all()
    remaining = (
        db_session.query(PasswordResetToken)
        .filter(PasswordResetToken.user_id == user.id)
        .all()
    )
    assert remaining == []


def test_forgot_password_purges_expired_tokens(client, db_session):
    user = _user(db_session, "expireduser", "expired@example.com")
    expired = _token(db_session, user, expired=True)
    expired_token = expired.token  # snapshot before the row can be purged/reused

    response = client.post(
        "/api/auth/forgot-password",
        json={"email": user.email},
    )
    assert response.status_code == 200

    db_session.expire_all()
    still_there = (
        db_session.query(PasswordResetToken)
        .filter(PasswordResetToken.token == expired_token)
        .first()
    )
    assert still_there is None
