"""Regression tests for issue #7782.

slowapi's `@limiter.limit(...)` decorator inspects the wrapped function's
signature and requires a `request` (or `websocket`) parameter to key the
rate limit. Two handlers — `receipts.get_digital_receipt` and
`inventory_lock.reserve_inventory` — were decorated without that parameter,
so slowapi raised `Exception: No "request" or "websocket" argument on
function "<...>"` at import time. Because `app.main` imports both routers,
this prevented the FastAPI app from importing entirely.
"""

import inspect


def test_receipts_module_imports():
    import app.api.receipts as receipts  # noqa: F401

    sig = inspect.signature(receipts.get_digital_receipt)
    assert "request" in sig.parameters, (
        "get_digital_receipt must declare a `request` parameter for @limiter.limit"
    )


def test_inventory_lock_module_imports():
    import app.api.inventory_lock as inventory_lock  # noqa: F401

    sig = inspect.signature(inventory_lock.reserve_inventory)
    assert "request" in sig.parameters, (
        "reserve_inventory must declare a `request` parameter for @limiter.limit"
    )


def test_app_imports_cleanly():
    # A slowapi import-time exception anywhere in the router package surfaces
    # here; before the fix this raised instead of returning the app.
    from app.main import app

    assert app is not None
