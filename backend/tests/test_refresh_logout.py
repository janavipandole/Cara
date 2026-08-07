"""Refresh token rotation and logout cookie clearing."""
from jose import jwt

from app.api.auth import (
    ALGORITHM,
    SECRET_KEY,
)
from app.models import RefreshSession
from tests.conftest import TestingSessionLocal


def _register_and_login(client, email="rotate@example.com", username="rotateuser"):
    password = "Secure123@"
    client.post(
        "/api/auth/register",
        json={"username": username, "email": email, "password": password},
    )
    login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    return login


def _active_sessions(email):
    db = TestingSessionLocal()
    try:
        return (
            db.query(RefreshSession)
            .join(RefreshSession.user)
            .filter(
                RefreshSession.user.has(email=email),
                RefreshSession.revoked_at.is_(None),
            )
            .all()
        )
    finally:
        db.close()


def _active_jtis(email):
    return {s.refresh_jti for s in _active_sessions(email)}


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
    assert new_jti in _active_jtis("rotate@example.com")
    assert old_jti not in _active_jtis("rotate@example.com")

    # Old refresh token must no longer work after rotation.
    client.cookies.set("refresh_token", old_refresh)
    reuse = client.post("/api/auth/refresh")
    assert reuse.status_code == 401


def test_logout_revokes_refresh_and_clears_cookies(client):
    login = _register_and_login(
        client, email="logout@example.com", username="logoutuser"
    )
    old_jti = jwt.decode(
        login.cookies.get("refresh_token"), SECRET_KEY, algorithms=[ALGORITHM]
    )["jti"]
    assert old_jti in _active_jtis("logout@example.com")

    logout = client.post("/api/auth/logout")
    assert logout.status_code == 200
    assert old_jti not in _active_jtis("logout@example.com")

    # Set-cookie clearing attributes should be present on the response.
    set_cookie_headers = logout.headers.get_list("set-cookie")
    joined = " ".join(set_cookie_headers).lower()
    assert "access_token=" in joined
    assert "refresh_token=" in joined
    assert "samesite=lax" in joined


def test_create_refresh_token_registers_jti(client):
    login = _register_and_login(client, email="jti-check@example.com", username="jti-check-user")
    token = login.cookies.get("refresh_token")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["jti"] in _active_jtis("jti-check@example.com")


def test_second_device_login_does_not_invalidate_first(client):
    """A second login for the same account must keep the first session valid."""
    client.post(
        "/api/auth/register",
        json={"username": "multi1", "email": "multi@example.com", "password": "Secure123@"},
    )
    login1 = client.post(
        "/api/auth/login", json={"email": "multi@example.com", "password": "Secure123@"}
    )
    assert login1.status_code == 200
    token1 = login1.cookies.get("refresh_token")
    jti1 = jwt.decode(token1, SECRET_KEY, algorithms=[ALGORITHM])["jti"]

    login2 = client.post(
        "/api/auth/login", json={"email": "multi@example.com", "password": "Secure123@"}
    )
    assert login2.status_code == 200
    token2 = login2.cookies.get("refresh_token")
    jti2 = jwt.decode(token2, SECRET_KEY, algorithms=[ALGORITHM])["jti"]
    assert jti1 != jti2

    active = _active_jtis("multi@example.com")
    assert jti1 in active
    assert jti2 in active

    # Device 1's refresh token must still work after the second login.
    client.cookies.set("refresh_token", token1)
    refresh = client.post("/api/auth/refresh")
    assert refresh.status_code == 200


def test_logout_revokes_only_current_session(client):
    """Logging out on one device must not revoke the other device's session."""
    first = client.post(
        "/api/auth/login", json={"email": "multi@example.com", "password": "Secure123@"}
    )
    assert first.status_code == 200
    first_jti = jwt.decode(
        first.cookies.get("refresh_token"), SECRET_KEY, algorithms=[ALGORITHM]
    )["jti"]

    second = client.post(
        "/api/auth/login", json={"email": "multi@example.com", "password": "Secure123@"}
    )
    assert second.status_code == 200
    second_jti = jwt.decode(
        second.cookies.get("refresh_token"), SECRET_KEY, algorithms=[ALGORITHM]
    )["jti"]
    assert first_jti != second_jti

    # Present the second device's refresh token to logout.
    client.cookies.set("refresh_token", second.cookies.get("refresh_token"))
    logout = client.post("/api/auth/logout")
    assert logout.status_code == 200

    active = _active_jtis("multi@example.com")
    assert first_jti in active
    assert second_jti not in active
