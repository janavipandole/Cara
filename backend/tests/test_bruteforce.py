"""Login brute-force tracking must be persisted (account + IP keyed) with a
hard lockout and server-side captcha gating."""
from datetime import datetime, timedelta, timezone

from jose import jwt

from app.api.auth import (
    SECRET_KEY,
    ALGORITHM,
    captcha_answer_digest,
    MAX_LOGIN_ATTEMPTS,
)
from app.models import LoginFailure


def _valid_captcha_payload():
    known = "AB12C"
    forged = jwt.encode(
        {"captcha_hash": captcha_answer_digest(known)},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return forged, known


def _login(client, email, password, captcha=False):
    body = {"email": email, "password": password}
    if captcha:
        token, answer = _valid_captcha_payload()
        body["captcha_token"] = token
        body["captcha_answer"] = answer
    return client.post("/api/auth/login", json=body)


def _register(client, username, email, password="Secure123@"):
    response = client.post(
        "/api/auth/register",
        json={"username": username, "email": email, "password": password},
    )
    assert response.status_code == 201


def test_failed_attempts_persisted_to_db(client, db_session):
    email = "persist@example.com"
    _register(client, "persistuser", email)

    _login(client, email, "WrongPass1")
    _login(client, email, "WrongPass2", captcha=True)

    record = (
        db_session.query(LoginFailure)
        .filter(LoginFailure.email == email)
        .first()
    )
    assert record is not None
    assert record.attempts == 2


def test_lockout_after_max_attempts(client):
    email = "lockout@example.com"
    _register(client, "lockoutuser", email)

    # Attempts 1..MAX all yield 401 (attempt 1 needs no captcha; the rest do).
    for i in range(1, MAX_LOGIN_ATTEMPTS + 1):
        response = _login(client, email, "WrongPass1", captcha=(i > 1))
        assert response.status_code == 401

    # The next attempt is hard-rejected while locked out, even with a valid captcha.
    response = _login(client, email, "WrongPass1", captcha=True)
    assert response.status_code == 429


def test_lockout_is_scoped_per_account(client):
    victim = "victim@example.com"
    other = "other@example.com"
    _register(client, "victimuser", victim)
    _register(client, "otheruser", other)

    for i in range(1, MAX_LOGIN_ATTEMPTS + 1):
        assert _login(client, victim, "WrongPass1", captcha=(i > 1)).status_code == 401
    assert _login(client, victim, "WrongPass1", captcha=True).status_code == 429

    # A different account from the same client/IP is not locked out.
    assert _login(client, other, "WrongPass1").status_code == 401


def test_successful_login_clears_failure_record(client, db_session):
    email = "cleared@example.com"
    password = "Secure123@"
    _register(client, "cleareduser", email, password)

    assert _login(client, email, "WrongPass1").status_code == 401
    assert (
        db_session.query(LoginFailure).filter(LoginFailure.email == email).first()
        is not None
    )

    response = _login(client, email, password, captcha=True)
    assert response.status_code == 200

    assert (
        db_session.query(LoginFailure).filter(LoginFailure.email == email).first()
        is None
    )


def test_expired_lockout_allows_retry(client, db_session):
    email = "expiring@example.com"
    _register(client, "expiringuser", email)

    for i in range(1, MAX_LOGIN_ATTEMPTS + 1):
        assert _login(client, email, "WrongPass1", captcha=(i > 1)).status_code == 401
    assert _login(client, email, "WrongPass1", captcha=True).status_code == 429

    # Back-date the lockout so it reads as expired.
    record = db_session.query(LoginFailure).filter(LoginFailure.email == email).first()
    record.locked_until = datetime.now(timezone.utc) - timedelta(minutes=1)
    db_session.commit()

    assert _login(client, email, "WrongPass1", captcha=True).status_code == 401
