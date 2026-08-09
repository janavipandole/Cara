"""GET /api/auth/captcha must be rate-limited (it does expensive PIL work)."""
from fastapi.testclient import TestClient

from app.main import app
from app.database import get_db
from app.limiter import limiter
from tests.conftest import override_get_db

CAPTCHA_LIMIT = 30


def test_captcha_endpoint_is_rate_limited():
    app.dependency_overrides[get_db] = override_get_db
    limiter.enabled = True
    try:
        with TestClient(app) as c:
            statuses = [c.get("/api/auth/captcha").status_code for _ in range(CAPTCHA_LIMIT + 5)]
        assert statuses.count(429) >= 1
        assert statuses[CAPTCHA_LIMIT - 1] == 200
    finally:
        limiter.enabled = False
        app.dependency_overrides.clear()
