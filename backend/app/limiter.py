"""
limiter.py — Centralised SlowAPI rate-limiter configuration for Cara.

Previous implementation: a single global limiter with no per-route tuning,
no environment-aware toggling, and no 429 response body.

This module:
  - Provides separate limiters for auth, orders, and general endpoints
  - Reads limits from environment variables so they can be tuned in prod/staging
    without touching code
  - Supplies a custom 429 handler that returns structured JSON (not a plain string)
  - Respects X-Forwarded-For headers when running behind a reverse proxy
  - Can be disabled for test environments via RATE_LIMIT_ENABLED=0
"""
import os
import logging

from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)

# ── Environment toggles ────────────────────────────────────────────────────
#   Set RATE_LIMIT_ENABLED=0 in the test environment (or CI) to disable.
_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "1") not in ("0", "false", "False", "no")

# ── Configurable limits (overridable via environment variables) ────────────
#   Format: "count/period"  e.g. "10/minute", "100/hour"
AUTH_LIMIT          = os.getenv("RATE_LIMIT_AUTH",     "10/minute")
ORDER_LIMIT         = os.getenv("RATE_LIMIT_ORDERS",   "20/minute")
PRODUCTS_LIMIT      = os.getenv("RATE_LIMIT_PRODUCTS", "60/minute")
WISHLIST_LIMIT      = os.getenv("RATE_LIMIT_WISHLIST", "30/minute")
GENERAL_LIMIT       = os.getenv("RATE_LIMIT_GENERAL",  "120/minute")


def _get_client_ip(request: Request) -> str:
    """
    Resolve client IP respecting X-Forwarded-For when behind a proxy.
    Falls back to the direct connection remote address.
    """
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take the first IP in the chain (the original client)
        return forwarded_for.split(",")[0].strip()
    return get_remote_address(request)


# ── Primary limiter (used by default and for general endpoints) ────────────
limiter = Limiter(
    key_func=_get_client_ip,
    enabled=_ENABLED,
    default_limits=[GENERAL_LIMIT],
)

# ── Specialised limiters for sensitive / high-traffic routes ──────────────
auth_limiter = Limiter(
    key_func=_get_client_ip,
    enabled=_ENABLED,
    default_limits=[AUTH_LIMIT],
)

order_limiter = Limiter(
    key_func=_get_client_ip,
    enabled=_ENABLED,
    default_limits=[ORDER_LIMIT],
)

wishlist_limiter = Limiter(
    key_func=_get_client_ip,
    enabled=_ENABLED,
    default_limits=[WISHLIST_LIMIT],
)


# ── Custom 429 handler ─────────────────────────────────────────────────────

async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """
    Return a structured JSON error body on 429 instead of SlowAPI's default
    plain-text "Too Many Requests" string.

    This makes it easy for frontend code to detect and display a friendly
    retry message to the user.
    """
    logger.warning(
        "Rate limit exceeded: path=%s method=%s ip=%s limit=%s",
        request.url.path,
        request.method,
        _get_client_ip(request),
        exc.detail,
    )
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "detail": "Too many requests. Please wait a moment before trying again.",
            "retry_after": exc.detail,  # e.g. "10/minute"
        },
        headers={"Retry-After": "60"},
    )
