"""HTTP 103 Early Hints middleware for the FastAPI backend.

Sends an HTTP 103 "Early Hints" response carrying preload ``Link`` headers for
the critical Largest Contentful Paint (LCP) assets the instant a page
navigation request arrives, before the application does any work (such as
SQLAlchemy queries) to build the final HTML document.

Browsers that support Early Hints use their otherwise idle network threads to
fetch ``/style.css`` and the hero image while the origin is still generating
the document, collapsing the classic
"download HTML -> parse -> discover link tags -> download CSS" waterfall.
Clients without Early Hints support simply ignore the 1xx response, so this is
fully backwards compatible.
"""

from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable
from typing import Any

logger = logging.getLogger(__name__)

# Critical LCP assets preloaded via HTTP 103 Early Hints. These mirror the
# <link rel="stylesheet"> and the hero-slider background referenced by
# index.html, so the browser can start downloading them before the HTML
# document is even received.
EARLY_HINTS_LINKS = [
    "</style.css>; rel=preload; as=style",
    "</images/hero4.png>; rel=preload; as=image",
]

# sec-fetch-mode values that indicate a top-level browser navigation.
_NAVIGATION_MODES = frozenset({"navigate", "same-origin"})


def _is_page_navigation(scope: dict[str, Any]) -> bool:
    """True for browser page navigations that expect an HTML document back."""
    if scope.get("type") != "http":
        return False

    if scope.get("method", "GET").upper() not in ("GET", "HEAD"):
        return False

    headers = {
        key.decode("latin-1").lower(): value.decode("latin-1")
        for key, value in scope.get("headers", [])
    }

    if headers.get("sec-fetch-mode", "").lower() in _NAVIGATION_MODES:
        return True
    return "text/html" in headers.get("accept", "")


class EarlyHintsMiddleware:
    """Pure ASGI middleware that emits ``http.response.early_hints``.

    The hints are fired before the wrapped application runs, so the browser
    starts fetching the critical assets while the server is still computing
    the actual response.
    """

    def __init__(
        self,
        app: Callable[..., Awaitable[None]],
        links: list[str] | None = None,
    ) -> None:
        self.app = app
        self.links = links if links is not None else list(EARLY_HINTS_LINKS)
        self._disabled = False

    async def __call__(self, scope: dict[str, Any], receive: Any, send: Any) -> None:
        if _is_page_navigation(scope):
            await self._send_early_hints(send)
        await self.app(scope, receive, send)

    async def _send_early_hints(self, send: Callable[..., Awaitable[None]]) -> None:
        if self._disabled:
            return
        message = {"type": "http.response.early_hints", "links": self.links}
        try:
            await send(message)
        except Exception:
            # Early Hints is purely a performance optimization. Some ASGI
            # servers (e.g. uvicorn) do not implement the message yet and
            # would otherwise abort the whole request, so degrade gracefully:
            # log once, skip the hints for the rest of the process lifetime,
            # and let the final response proceed normally.
            self._disabled = True
            logger.warning(
                "ASGI server does not support HTTP 103 Early Hints; disabling early hints"
            )
