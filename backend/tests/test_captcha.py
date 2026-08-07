"""CAPTCHA answers are not embedded in the JWT and challenges are single-use."""
import base64
import json

from passlib.context import CryptContext

from app.models import User
from tests.conftest import TestingSessionLocal

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
LOGIN_URL = "/api/auth/login"
CAPTCHA_URL = "/api/auth/captcha"

FAKE_CAPTCHA_CODE = ["A", "B", "3", "K", "F"]


def _decode_jwt_payload(token):
    _, payload, _ = token.split(".")
    payload += "=" * (-len(payload) % 4)
    return json.loads(base64.urlsafe_b64decode(payload).decode("utf-8"))


def _seed_user(email, password="Test@1234"):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            username=email.split("@")[0] + "user",
            email=email,
            hashed_password=pwd.hash(password),
        )
        db.add(user)
        db.commit()
    db.close()


def _fail_login(client, email):
    resp = client.post(
        LOGIN_URL,
        json={"email": email, "password": "WrongPass1@"},
    )
    assert resp.status_code == 401, resp.text
    return resp


def _get_captcha(client, monkeypatch):
    monkeypatch.setattr("random.choices", lambda population, k: FAKE_CAPTCHA_CODE)
    resp = client.get(CAPTCHA_URL)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["captcha_image"].startswith("data:image/png;base64,")
    assert data["captcha_token"]
    return data["captcha_token"]


def test_captcha_token_does_not_contain_answer(client, monkeypatch):
    token = _get_captcha(client, monkeypatch)
    payload = _decode_jwt_payload(token)
    assert "captcha_answer" not in payload
    assert payload.get("captcha_hash")
    assert payload.get("captcha_challenge")
    assert "AB3KF" not in payload.values()


def test_login_requires_captcha_after_failed_attempt(client):
    email = "captcha-required@example.com"
    _seed_user(email)
    _fail_login(client, email)

    resp = client.post(
        LOGIN_URL,
        json={"email": email, "password": "Test@1234"},
    )
    assert resp.status_code == 403, resp.text
    assert resp.json()["detail"] == "Security captcha required."


def test_valid_captcha_allows_login(client, monkeypatch):
    email = "captcha-valid@example.com"
    _seed_user(email)
    _fail_login(client, email)

    token = _get_captcha(client, monkeypatch)
    resp = client.post(
        LOGIN_URL,
        json={
            "email": email,
            "password": "Test@1234",
            "captcha_token": token,
            "captcha_answer": "AB3KF",
        },
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["access_token"]


def test_wrong_captcha_rejected(client, monkeypatch):
    email = "captcha-wrong@example.com"
    _seed_user(email)
    _fail_login(client, email)

    token = _get_captcha(client, monkeypatch)
    resp = client.post(
        LOGIN_URL,
        json={
            "email": email,
            "password": "Test@1234",
            "captcha_token": token,
            "captcha_answer": "ZZZZZ",
        },
    )
    assert resp.status_code == 403, resp.text
    assert resp.json()["detail"] == "Invalid security code."


def test_captcha_is_single_use(client, monkeypatch):
    email = "captcha-replay@example.com"
    _seed_user(email)
    _fail_login(client, email)

    token = _get_captcha(client, monkeypatch)

    # A verification attempt consumes the challenge even when the password is
    # wrong, so the solved captcha cannot be replayed on the next attempt.
    first = client.post(
        LOGIN_URL,
        json={
            "email": email,
            "password": "WrongPass1@",
            "captcha_token": token,
            "captcha_answer": "AB3KF",
        },
    )
    assert first.status_code == 401, first.text

    replay = client.post(
        LOGIN_URL,
        json={
            "email": email,
            "password": "Test@1234",
            "captcha_token": token,
            "captcha_answer": "AB3KF",
        },
    )
    assert replay.status_code == 403, replay.text
