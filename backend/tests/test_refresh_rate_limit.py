"""Rate limiting on POST /api/auth/refresh."""
from app.limiter import limiter


def test_refresh_endpoint_is_rate_limited(client):
    email = "ratelimit@example.com"
    client.post(
        "/api/auth/register",
        json={"username": "ratelimituser", "email": email, "password": "Secure123@"},
    )
    refresh_token = client.cookies.get("refresh_token")
    assert refresh_token

    limiter.enabled = True
    try:
        for _ in range(10):
            client.cookies.set("refresh_token", refresh_token)
            resp = client.post("/api/auth/refresh")
            assert resp.status_code == 200, resp.text
            refresh_token = resp.cookies.get("refresh_token")

        client.cookies.set("refresh_token", refresh_token)
        blocked = client.post("/api/auth/refresh")
        assert blocked.status_code == 429
    finally:
        limiter.enabled = False
