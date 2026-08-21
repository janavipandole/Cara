"""HTTP 103 Early Hints middleware tests.

The middleware is exercised directly at the ASGI level because Starlette's
TestClient (httpx) does not surface 1xx interim responses such as 103.
"""

import asyncio

from app.early_hints import (
    EARLY_HINTS_LINKS,
    EarlyHintsMiddleware,
    _is_page_navigation,
)


def _make_scope(*, http_type="http", method="GET", path="/", headers=None):
    return {
        "type": http_type,
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": method,
        "scheme": "http",
        "path": path,
        "raw_path": path.encode("ascii"),
        "query_string": b"",
        "headers": headers or [(b"accept", b"text/html")],
        "client": ("testclient", 50000),
        "server": ("testserver", 80),
    }


def _navigation_scope():
    return _make_scope(
        headers=[
            (b"accept", b"text/html,application/xhtml+xml"),
            (b"sec-fetch-mode", b"navigate"),
        ]
    )


async def _html_app(scope, receive, send):
    await send(
        {
            "type": "http.response.start",
            "status": 200,
            "headers": [(b"content-type", b"text/html; charset=utf-8")],
        }
    )
    await send({"type": "http.response.body", "body": b"<html></html>"})


async def _noop_app(scope, receive, send):
    await send({"type": "http.response.start", "status": 200, "headers": []})
    await send({"type": "http.response.body", "body": b""})


def _sent_messages(middleware, scope):
    sent = []

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    async def send(message):
        sent.append(message)

    async def run():
        await middleware(scope, receive, send)

    asyncio.run(run())
    return sent


def test_page_navigation_sends_early_hints_before_response():
    sent = _sent_messages(EarlyHintsMiddleware(_html_app), _navigation_scope())

    assert sent[0]["type"] == "http.response.early_hints"
    assert sent[0]["links"] == EARLY_HINTS_LINKS
    assert sent[1]["type"] == "http.response.start"


def test_early_hints_links_preload_critical_assets():
    assert "</style.css>; rel=preload; as=style" in EARLY_HINTS_LINKS
    assert "</images/hero4.png>; rel=preload; as=image" in EARLY_HINTS_LINKS


def test_html_accept_header_alone_triggers_early_hints():
    scope = _make_scope(headers=[(b"accept", b"text/html")])
    sent = _sent_messages(EarlyHintsMiddleware(_noop_app), scope)
    assert sent[0]["type"] == "http.response.early_hints"


def test_api_request_skips_early_hints():
    scope = _make_scope(
        headers=[(b"accept", b"application/json"), (b"sec-fetch-mode", b"cors")]
    )
    sent = _sent_messages(EarlyHintsMiddleware(_noop_app), scope)
    assert all(message["type"] != "http.response.early_hints" for message in sent)


def test_post_request_skips_early_hints():
    scope = _make_scope(
        method="POST",
        headers=[(b"accept", b"text/html"), (b"sec-fetch-mode", b"navigate")],
    )
    assert not _is_page_navigation(scope)


def test_websocket_scope_skips_early_hints():
    scope = _make_scope(http_type="websocket", headers=[(b"accept", b"text/html")])
    sent = _sent_messages(EarlyHintsMiddleware(_noop_app), scope)
    assert all(message["type"] != "http.response.early_hints" for message in sent)


def test_custom_links_can_be_configured():
    custom = ["</app.css>; rel=preload; as=style"]
    middleware = EarlyHintsMiddleware(_noop_app, links=custom)
    sent = _sent_messages(middleware, _navigation_scope())
    assert sent[0]["links"] == custom


def test_unsupported_server_degrades_gracefully():
    middleware = EarlyHintsMiddleware(_html_app)
    delivered = []

    async def send_unsupported(message):
        if message["type"] == "http.response.early_hints":
            raise RuntimeError("server does not implement early hints")
        delivered.append(message)

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    async def run():
        await middleware(_navigation_scope(), receive, send_unsupported)

    asyncio.run(run())
    assert delivered[0]["type"] == "http.response.start"
    assert delivered[0]["status"] == 200


def test_unsupported_server_disables_further_hints():
    middleware = EarlyHintsMiddleware(_noop_app)
    sent = []

    async def send_unsupported(message):
        if message["type"] == "http.response.early_hints":
            raise RuntimeError("server does not implement early hints")
        sent.append(message)

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    async def run():
        await middleware(_navigation_scope(), receive, send_unsupported)
        await middleware(_navigation_scope(), receive, send_unsupported)

    asyncio.run(run())
    assert all(message["type"] != "http.response.early_hints" for message in sent)


def test_middleware_wired_into_fastapi_app():
    from app.main import app

    sent = _sent_messages(app, _navigation_scope())
    assert sent[0]["type"] == "http.response.early_hints"
    assert sent[0]["links"] == EARLY_HINTS_LINKS
