"""Tests for the trusted-proxy-aware rate-limit key function."""
import ipaddress

import pytest
from starlette.requests import Request

from app import limiter as limiter_module
from app.limiter import _is_trusted, _parse_trusted_proxies, get_client_ip


def _make_request(client_host, headers=None):
    raw_headers = [
        (k.lower().encode("latin-1"), v.encode("latin-1")) for k, v in (headers or {}).items()
    ]
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/",
        "scheme": "http",
        "client": (client_host, 50000),
        "headers": raw_headers,
    }
    return Request(scope)


def _set_trusted(monkeypatch, networks):
    monkeypatch.setattr(limiter_module, "_TRUSTED_NETWORKS", networks)


@pytest.fixture(autouse=True)
def _no_trusted_by_default(monkeypatch):
    _set_trusted(monkeypatch, [])


def test_trusted_networks_parsing():
    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setenv("TRUSTED_PROXIES", "10.0.0.0/8, 127.0.0.1;192.168.1.1, not-an-ip")
    networks = _parse_trusted_proxies()
    monkeypatch.undo()
    assert len(networks) == 3
    assert ipaddress.ip_network("10.0.0.0/8") in networks
    assert ipaddress.ip_address("127.0.0.1") in networks


def test_untrusted_peer_ignores_spoofed_headers(monkeypatch):
    """A client connecting directly cannot rotate the bucket via X-Forwarded-For."""
    request = _make_request(
        "203.0.113.5",
        headers={"X-Forwarded-For": "1.1.1.1, 2.2.2.2", "X-Real-IP": "3.3.3.3"},
    )
    assert get_client_ip(request) == "203.0.113.5"


def test_trusted_peer_returns_client_from_forwarded_for(monkeypatch):
    _set_trusted(monkeypatch, [ipaddress.ip_network("10.0.0.0/8")])
    request = _make_request(
        "10.0.0.1",
        headers={"X-Forwarded-For": "198.51.100.7, 10.0.0.1"},
    )
    assert get_client_ip(request) == "198.51.100.7"


def test_trusted_peer_skips_inner_trusted_hops(monkeypatch):
    _set_trusted(monkeypatch, [ipaddress.ip_network("10.0.0.0/8")])
    request = _make_request(
        "10.0.0.3",
        headers={"X-Forwarded-For": "198.51.100.7, 10.0.0.2, 10.0.0.3"},
    )
    assert get_client_ip(request) == "198.51.100.7"


def test_trusted_peer_falls_back_to_x_real_ip(monkeypatch):
    _set_trusted(monkeypatch, [ipaddress.ip_network("10.0.0.0/8")])
    request = _make_request("10.0.0.1", headers={"X-Real-IP": "198.51.100.7"})
    assert get_client_ip(request) == "198.51.100.7"


def test_trusted_peer_no_headers_uses_socket(monkeypatch):
    _set_trusted(monkeypatch, [ipaddress.ip_network("10.0.0.0/8")])
    request = _make_request("10.0.0.1")
    assert get_client_ip(request) == "10.0.0.1"


def test_all_forwarded_hops_trusted_uses_socket(monkeypatch):
    _set_trusted(monkeypatch, [ipaddress.ip_network("10.0.0.0/8")])
    request = _make_request(
        "10.0.0.2", headers={"X-Forwarded-For": "10.0.0.1, 10.0.0.2"}
    )
    assert get_client_ip(request) == "10.0.0.2"
