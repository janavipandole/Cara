"""Refresh token rotation, reuse detection, and logout cookie clearing."""
from jose import jwt

from app import models
from app.api.auth import (
    ALGORITHM,
    SECRET_KEY,
    active_refresh_jtis,
    create_refresh_token,
)


def _register_and_login(client, email="rotate@example.com", username="rotateuser"):
    password = "Secure123@"
    client.post(
        "/api/auth/register",
        json={"username": username, "email": email, "password": password},
    )
    login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    return login


def _refresh_rows(db_session, email):
    return (
        db_session.query(models.RefreshToken)
        .filter(models.RefreshToken.email == email)
        .order_by(models.RefreshToken.id)
        .all()
    )


def test_refresh_rotates_refresh_token(client, db_session):
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
    assert active_refresh_jtis["rotate@example.com"] == new_jti

    # The rotated-away token is recorded as used in the DB.
    rows = _refresh_rows(db_session, "rotate@example.com")
    assert any(r.jti == old_jti and r.used for r in rows)
    assert any(r.jti == new_jti and not r.used for r in rows)

    # Old refresh token must no longer work after rotation.
    client.cookies.set("refresh_token", old_refresh)
    reuse = client.post("/api/auth/refresh")
    assert reuse.status_code == 401


def test_refresh_reuse_revokes_whole_family(client, db_session):
    login = _register_and_login(
        client, email="reuse@example.com", username="reuseuser"
    )
    old_refresh = login.cookies.get("refresh_token")

    refresh = client.post("/api/auth/refresh")
    assert refresh.status_code == 200
    new_refresh = refresh.cookies.get("refresh_token")

    # Replay the already-rotated token -> reuse detection must fire.
    client.cookies.set("refresh_token", old_refresh)
    reuse = client.post("/api/auth/refresh")
    assert reuse.status_code == 401
    assert "reuse" in reuse.json()["detail"].lower()

    # The whole family is revoked: the current token no longer works either,
    # the in-memory slot is cleared, and the cookies were cleared.
    client.cookies.set("refresh_token", new_refresh)
    after = client.post("/api/auth/refresh")
    assert after.status_code == 401
    assert "reuse@example.com" not in active_refresh_jtis
    assert all(r.used for r in _refresh_rows(db_session, "reuse@example.com"))

    set_cookie_headers = reuse.headers.get_list("set-cookie")
    joined = " ".join(set_cookie_headers).lower()
    assert "access_token=" in joined
    assert "refresh_token=" in joined


def test_logout_revokes_refresh_and_clears_cookies(client, db_session):
    login = _register_and_login(
        client, email="logout@example.com", username="logoutuser"
    )
    assert login.cookies.get("refresh_token")
    assert "logout@example.com" in active_refresh_jtis

    logout = client.post("/api/auth/logout")
    assert logout.status_code == 200
    assert "logout@example.com" not in active_refresh_jtis
    assert all(r.used for r in _refresh_rows(db_session, "logout@example.com"))

    # Set-cookie clearing attributes should be present on the response.
    set_cookie_headers = logout.headers.get_list("set-cookie")
    joined = " ".join(set_cookie_headers).lower()
    assert "access_token=" in joined
    assert "refresh_token=" in joined
    assert "samesite=lax" in joined


def test_create_refresh_token_registers_jti(db_session):
    token = create_refresh_token("jti-check@example.com", db_session)
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["jti"] == active_refresh_jtis["jti-check@example.com"]
    assert payload["jti"] in [
        r.jti for r in _refresh_rows(db_session, "jti-check@example.com")
    ]
