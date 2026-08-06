"""Refresh token rotation and logout cookie clearing."""
from jose import jwt

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
    assert active_refresh_jtis["rotate@example.com"] == new_jti

    # Old refresh token must no longer work after rotation.
    client.cookies.set("refresh_token", old_refresh)
    reuse = client.post("/api/auth/refresh")
    assert reuse.status_code == 401


def test_logout_revokes_refresh_and_clears_cookies(client):
    login = _register_and_login(
        client, email="logout@example.com", username="logoutuser"
    )
    assert login.cookies.get("refresh_token")
    assert "logout@example.com" in active_refresh_jtis

    logout = client.post("/api/auth/logout")
    assert logout.status_code == 200
    assert "logout@example.com" not in active_refresh_jtis

    # Set-cookie clearing attributes should be present on the response.
    set_cookie_headers = logout.headers.get_list("set-cookie")
    joined = " ".join(set_cookie_headers).lower()
    assert "access_token=" in joined
    assert "refresh_token=" in joined
    assert "samesite=lax" in joined


def test_create_refresh_token_registers_jti():
    token = create_refresh_token("jti-check@example.com")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["jti"] == active_refresh_jtis["jti-check@example.com"]
