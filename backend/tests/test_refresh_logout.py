"""Refresh token rotation and logout cookie clearing (DB-backed sessions)."""
from datetime import datetime, timezone

from jose import jwt

from app.api.auth import ALGORITHM, SECRET_KEY, create_refresh_token
from app.models import RefreshToken, User
from tests.conftest import TestingSessionLocal


def _utcnow_naive():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _register_and_login(client, email="rotate@example.com", username="rotateuser"):
    password = "Secure123@"
    client.post(
        "/api/auth/register",
        json={"username": username, "email": email, "password": password},
    )
    login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    return login


def _active_rows(db, email):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return []
    return (
        db.query(RefreshToken)
        .filter(
            RefreshToken.user_id == user.id,
            RefreshToken.revoked_at.is_(None),
        )
        .all()
    )


def test_refresh_rotates_refresh_token(client):
    login = _register_and_login(client)
    old_refresh = login.cookies.get("refresh_token")
    assert old_refresh
    old_jti = jwt.decode(old_refresh, SECRET_KEY, algorithms=[ALGORITHM])["jti"]

    refresh = client.post("/api/auth/refresh")
    assert refresh.status_code == 200
    new_refresh = refresh.cookies.get("refresh_token")
    assert new_refresh
    assert new_refresh != old_refresh
    new_jti = jwt.decode(new_refresh, SECRET_KEY, algorithms=[ALGORITHM])["jti"]
    assert new_jti != old_jti

    db = TestingSessionLocal()
    try:
        assert [r.jti for r in _active_rows(db, "rotate@example.com")] == [new_jti]
    finally:
        db.close()

    # Old refresh token must no longer work after rotation.
    client.cookies.set("refresh_token", old_refresh)
    reuse = client.post("/api/auth/refresh")
    assert reuse.status_code == 401


def test_logout_revokes_refresh_and_clears_cookies(client):
    login = _register_and_login(
        client, email="logout@example.com", username="logoutuser"
    )
    assert login.cookies.get("refresh_token")

    logout = client.post("/api/auth/logout")
    assert logout.status_code == 200

    db = TestingSessionLocal()
    try:
        assert _active_rows(db, "logout@example.com") == []
    finally:
        db.close()

    # Set-cookie clearing attributes should be present on the response.
    set_cookie_headers = logout.headers.get_list("set-cookie")
    joined = " ".join(set_cookie_headers).lower()
    assert "access_token=" in joined
    assert "refresh_token=" in joined
    assert "samesite=lax" in joined


def test_create_refresh_token_persists_jti():
    db = TestingSessionLocal()
    try:
        user = User(
            username="jtiuser",
            email="jti-check@example.com",
            hashed_password="not-used",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_refresh_token(user.email, user.id, db)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        row = (
            db.query(RefreshToken)
            .filter(
                RefreshToken.user_id == user.id,
                RefreshToken.jti == payload["jti"],
            )
            .first()
        )
        assert row is not None
        assert row.revoked_at is None
        assert row.expires_at > _utcnow_naive()
    finally:
        db.close()
