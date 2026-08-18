"""Security headers must be present on responses and the static host config."""
from pathlib import Path

import pytest

from app.main import app

REPO_ROOT = Path(__file__).resolve().parents[2]

EXPECTED_HEADERS = {
    "Content-Security-Policy",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
    "Cross-Origin-Opener-Policy",
    "Cross-Origin-Embedder-Policy",
}


def test_api_responses_carry_security_headers(client):
    response = client.get("/health")
    assert response.status_code == 200
    for header in EXPECTED_HEADERS:
        assert header in response.headers, f"missing {header}"


def test_api_csp_has_no_unsafe_inline_for_scripts(client):
    response = client.get("/health")
    csp = response.headers["Content-Security-Policy"]
    script_src = next(
        part for part in csp.split(";") if part.strip().startswith("script-src")
    )
    assert "'unsafe-inline'" not in script_src
    assert "'self'" in script_src


def test_cross_origin_isolation_headers(client):
    """COOP and COEP must enforce process isolation to mitigate Spectre."""
    response = client.get("/health")
    assert response.headers["Cross-Origin-Opener-Policy"] == "same-origin"
    assert response.headers["Cross-Origin-Embedder-Policy"] == "require-corp"
    assert response.headers["Cross-Origin-Resource-Policy"] == "cross-origin"


def test_nginx_conf_sets_security_headers_for_static_host():
    nginx_conf = (REPO_ROOT / "nginx.conf").read_text(encoding="utf-8")
    for directive in (
        "add_header Content-Security-Policy",
        "add_header Strict-Transport-Security",
        "add_header X-Content-Type-Options \"nosniff\"",
        "add_header X-Frame-Options \"DENY\"",
        "add_header Referrer-Policy",
        "add_header Permissions-Policy",
        "add_header Cross-Origin-Opener-Policy",
        "add_header Cross-Origin-Embedder-Policy",
    ):
        assert directive in nginx_conf, f"missing nginx directive: {directive}"


def test_nginx_csp_covers_static_host_location():
    nginx_conf = (REPO_ROOT / "nginx.conf").read_text(encoding="utf-8")
    assert "location /" in nginx_conf
    assert "script-src" in nginx_conf
