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
    resp = client.post(
        "/api/auth/register",
        json={"username": username, "email": email, "password": password},
    )
    assert resp.status_code == 201
    return resp


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
    assert active_refresh_jtis["rotate@example.com"] == {new_jti}

    # Old refresh token must no longer work after rotation.
    client.cookies.set("refresh_token", old_refresh)
    reuse = client.post("/api/auth/refresh")
    assert reuse.status_code == 401


def test_refresh_keeps_other_sessions_valid(client):
    """Refreshing one device must not invalidate another device's session."""
    email = "multi@example.com"
    _register_and_login(client, email=email, username="multiuser")
    session_a = client.cookies.get("refresh_token")
    assert session_a
    jti_a = jwt.decode(session_a, SECRET_KEY, algorithms=[ALGORITHM])["jti"]

    # Second device logs in -> a new session JTI is added to the same account.
    login_b = client.post("/api/auth/login", json={"email": email, "password": "Secure123@"})
    assert login_b.status_code == 200
    session_b = login_b.cookies.get("refresh_token")
    jti_b = jwt.decode(session_b, SECRET_KEY, algorithms=[ALGORITHM])["jti"]
    assert {jti_a, jti_b} == set(active_refresh_jtis[email])

    # Device A refreshes; its own old JTI is rotated away.
    client.cookies.set("refresh_token", session_a)
    refreshed = client.post("/api/auth/refresh")
    assert refreshed.status_code == 200
    assert jti_a not in active_refresh_jtis[email]
    assert jti_b in active_refresh_jtis[email]

    # Device B's session still works.
    client.cookies.set("refresh_token", session_b)
    still_valid = client.post("/api/auth/refresh")
    assert still_valid.status_code == 200


def test_logout_revokes_only_that_session(client):
    """Logging out on one device must not revoke the other device's session."""
    email = "multilogout@example.com"
    _register_and_login(client, email=email, username="multilogoutuser")
    session_a = client.cookies.get("refresh_token")
    jti_a = jwt.decode(session_a, SECRET_KEY, algorithms=[ALGORITHM])["jti"]

    login_b = client.post("/api/auth/login", json={"email": email, "password": "Secure123@"})
    session_b = login_b.cookies.get("refresh_token")
    jti_b = jwt.decode(session_b, SECRET_KEY, algorithms=[ALGORITHM])["jti"]

    # Device A logs out -> only A's JTI is revoked.
    client.cookies.set("refresh_token", session_a)
    logout = client.post("/api/auth/logout")
    assert logout.status_code == 200
    assert jti_a not in active_refresh_jtis[email]
    assert jti_b in active_refresh_jtis[email]

    # Device B's session still works.
    client.cookies.set("refresh_token", session_b)
    still_valid = client.post("/api/auth/refresh")
    assert still_valid.status_code == 200

    # Device B logs out -> account has no active sessions left.
    refreshed_b = still_valid.cookies.get("refresh_token")
    client.cookies.set("refresh_token", refreshed_b)
    client.post("/api/auth/logout")
    assert email not in active_refresh_jtis


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
    assert payload["jti"] in active_refresh_jtis["jti-check@example.com"]
