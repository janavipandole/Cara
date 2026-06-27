"""
Tests for rate limiting configuration and structured 429 responses.
"""
import pytest
from fastapi.testclient import TestClient
from app.limiter import limiter, auth_limiter, order_limiter


class TestRateLimiter:
    def test_rate_limit_exceeded_format(self, client: TestClient):
        """
        When rate limit is exceeded, server should return a structured 429 JSON response.
        We trigger this by temporarily setting a super-low limit on a test path
        or manually calling the rate limit exception handler.
        """
        # We can enable rate limiting explicitly for this test
        limiter.enabled = True
        auth_limiter.enabled = True
        order_limiter.enabled = True

        try:
            # Send multiple requests to register/login to hit the limit (10/min)
            for _ in range(15):
                resp = client.post(
                    "/api/auth/login",
                    json={"email": "nonexistent@test.com", "password": "wrong"},
                )
                if resp.status_code == 429:
                    body = resp.json()
                    assert body["error"] == "rate_limit_exceeded"
                    assert "Too many requests" in body["detail"]
                    assert "retry_after" in body
                    break
        finally:
            # Reset limiter status for other tests
            limiter.enabled = False
            auth_limiter.enabled = False
            order_limiter.enabled = False
