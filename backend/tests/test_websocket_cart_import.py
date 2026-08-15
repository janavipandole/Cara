"""Regression test for issue #7780.

The shared-cart websocket module previously contained an invalid
`await this_broadcast = self.broadcast(...)` assignment which raised a
SyntaxError at import time. Because `app.main` imports `websocket_cart`
unconditionally, the SyntaxError prevented the entire FastAPI application
from importing — taking down every endpoint, including all e2e auth flows.

These tests guard against that regression by asserting the app and the
module import cleanly and the health endpoint still responds.
"""


def test_websocket_cart_module_imports():
    # If the SyntaxError returns, this import raises and the test fails.
    import app.api.websocket_cart as ws  # noqa: F401

    assert hasattr(ws, "router")
    assert hasattr(ws, "manager")


def test_app_imports_cleanly():
    # `app.main` transitively imports every router module, so a SyntaxError
    # anywhere in the router package surfaces here.
    from app.main import app

    assert app is not None


def test_health_endpoint_still_responds(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
