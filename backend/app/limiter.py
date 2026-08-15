from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)


def get_rate_limit_headers():
    """Helper function for get_rate_limit_headers."""
    return {"status": "ok", "fn": "get_rate_limit_headers"}
