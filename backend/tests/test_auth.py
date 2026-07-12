"""Tests for POST /api/auth/register, POST /api/auth/login, GET /api/auth/me."""
import pytest

REGISTER_URL = "/api/auth/register"
LOGIN_URL = "/api/auth/login"
ME_URL = "/api/auth/me"

VALID_USER = {
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "Secure123@",
}


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

def test_register_success(client):
    r = client.post(REGISTER_URL, json=VALID_USER)
    assert r.status_code == 201
    body = r.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == VALID_USER["email"]


def test_register_duplicate_email(client):
    payload = {**VALID_USER, "username": "otheruser", "email": "dup@example.com"}
    client.post(REGISTER_URL, json=payload)
    # Second registration with same email should fail
    r = client.post(REGISTER_URL, json=payload)
    assert r.status_code == 409


def test_register_duplicate_username(client):
    client.post(REGISTER_URL, json={**VALID_USER, "email": "a@example.com", "username": "dupname"})
    r = client.post(REGISTER_URL, json={**VALID_USER, "email": "b@example.com", "username": "dupname"})
    assert r.status_code == 409


def test_register_invalid_email(client):
    r = client.post(REGISTER_URL, json={**VALID_USER, "email": "not-an-email"})
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

def test_login_success(client):
    client.post(REGISTER_URL, json={**VALID_USER, "username": "loginuser", "email": "login@example.com"})
    r = client.post(LOGIN_URL, json={"email": "login@example.com", "password": "Secure123@"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_password(client):
    client.post(REGISTER_URL, json={**VALID_USER, "username": "wrongpw", "email": "wrongpw@example.com"})
    r = client.post(LOGIN_URL, json={"email": "wrongpw@example.com", "password": "WrongPass1"})
    assert r.status_code == 401


def test_login_nonexistent_user(client):
    r = client.post(LOGIN_URL, json={"email": "ghost@example.com", "password": "Secure123@"})
    assert r.status_code == 401


# ---------------------------------------------------------------------------
# /me
# ---------------------------------------------------------------------------

def test_me_returns_user(client):
    client.post(REGISTER_URL, json={**VALID_USER, "username": "meuser", "email": "me@example.com"})
    login = client.post(LOGIN_URL, json={"email": "me@example.com", "password": "Secure123@"})
    token = login.json()["access_token"]
    r = client.get(ME_URL, cookies={"access_token": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "me@example.com"


def test_me_requires_auth(client):
    r = client.get(ME_URL)
    assert r.status_code == 401


def test_me_rejects_invalid_token(client):
    r = client.get(ME_URL, cookies={"access_token": "Bearer invalid.token.here"})
    assert r.status_code == 401
