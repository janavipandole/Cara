"""Captcha token must not embed a readable answer."""
import base64
import json

from jose import jwt

from app.api.auth import SECRET_KEY, ALGORITHM, captcha_answer_digest


def _jwt_payload(token: str) -> dict:
    # Decode without verifying so we can inspect claims the same way a client would.
    payload_b64 = token.split(".")[1]
    padding = "=" * (-len(payload_b64) % 4)
    return json.loads(base64.urlsafe_b64decode(payload_b64 + padding))


def test_captcha_token_has_no_plaintext_answer(client):
    response = client.get("/api/auth/captcha")
    assert response.status_code == 200
    body = response.json()
    token = body["captcha_token"]
    claims = _jwt_payload(token)

    assert "captcha_answer" not in claims
    assert "captcha_hash" in claims
    assert len(claims["captcha_hash"]) == 64


def test_login_accepts_valid_captcha_after_failure(client):
    email = "captcha-user@example.com"
    password = "Secure123@"
    client.post(
        "/api/auth/register",
        json={"username": "captchauser", "email": email, "password": password},
    )
    # First failure triggers captcha requirement on the next attempt.
    assert (
        client.post("/api/auth/login", json={"email": email, "password": "WrongPass1"}).status_code
        == 401
    )

    captcha = client.get("/api/auth/captcha").json()
    claims = jwt.decode(captcha["captcha_token"], SECRET_KEY, algorithms=[ALGORITHM])
    # Recover a matching answer by brute-forcing the tiny captcha space is unnecessary —
    # mint a token/hash pair with a known answer for the verify path.
    known = "AB12C"
    forged = jwt.encode(
        {"captcha_hash": captcha_answer_digest(known), "exp": claims["exp"]},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    ok = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
            "captcha_token": forged,
            "captcha_answer": known,
        },
    )
    assert ok.status_code == 200
    assert "access_token" in ok.json()


def test_login_rejects_wrong_captcha_answer(client):
    email = "captcha-bad@example.com"
    password = "Secure123@"
    client.post(
        "/api/auth/register",
        json={"username": "captchabad", "email": email, "password": password},
    )
    client.post("/api/auth/login", json={"email": email, "password": "WrongPass1"})

    captcha = client.get("/api/auth/captcha").json()
    bad = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
            "captcha_token": captcha["captcha_token"],
            "captcha_answer": "ZZZZZ",
        },
    )
    assert bad.status_code == 403


def test_captcha_token_is_single_use(client):
    """A solved captcha token must not enable unlimited password guesses."""
    email = "singleuse@example.com"
    password = "Secure123@"
    client.post(
        "/api/auth/register",
        json={"username": "singleuse", "email": email, "password": password},
    )
    # First failure forces the captcha on the next attempt.
    assert (
        client.post("/api/auth/login", json={"email": email, "password": "WrongPass1"}).status_code
        == 401
    )

    captcha = client.get("/api/auth/captcha").json()
    claims = jwt.decode(captcha["captcha_token"], SECRET_KEY, algorithms=[ALGORITHM])
    known = "AB12C"
    forged = jwt.encode(
        {"captcha_hash": captcha_answer_digest(known), "exp": claims["exp"]},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    # Using the token with a wrong password consumes it even though login fails.
    failed = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "WrongPass2",
            "captcha_token": forged,
            "captcha_answer": known,
        },
    )
    assert failed.status_code == 401

    # Reusing the same solved token is rejected.
    reuse = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
            "captcha_token": forged,
            "captcha_answer": known,
        },
    )
    assert reuse.status_code == 403


def test_login_lockout_after_max_failed_attempts(client):
    """Repeated failures trigger a temporary lockout independent of the captcha."""
    from datetime import datetime, timedelta, timezone

    from app.api.auth import MAX_LOGIN_ATTEMPTS

    email = "lockout@example.com"
    password = "Secure123@"
    client.post(
        "/api/auth/register",
        json={"username": "lockoutuser", "email": email, "password": password},
    )

    # First failure forces the captcha on the next attempt.
    assert (
        client.post("/api/auth/login", json={"email": email, "password": "WrongPass1"}).status_code
        == 401
    )

    # Each subsequent failure needs a fresh single-use captcha; forge one per attempt.
    known = "AB12C"
    exp = datetime.now(timezone.utc) + timedelta(minutes=5)
    for nonce in range(MAX_LOGIN_ATTEMPTS - 1):
        forged = jwt.encode(
            {
                "captcha_hash": captcha_answer_digest(known),
                "exp": exp,
                "nonce": nonce,
            },
            SECRET_KEY,
            algorithm=ALGORITHM,
        )
        assert (
            client.post(
                "/api/auth/login",
                json={
                    "email": email,
                    "password": "WrongPass1",
                    "captcha_token": forged,
                    "captcha_answer": known,
                },
            ).status_code
            == 401
        )

    # The next attempt — even with the correct password — is blocked during the lockout.
    blocked = client.post("/api/auth/login", json={"email": email, "password": password})
    assert blocked.status_code == 429
