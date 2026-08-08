import ipaddress
import os

from slowapi import Limiter
from slowapi.util import get_remote_address


def _parse_trusted_proxies():
    """Parse the TRUSTED_PROXIES env var into IP/CIDR objects.

    Comma or semicolon separated list of IPs or CIDR blocks, e.g.
    "10.0.0.0/8,127.0.0.1". Unparseable entries are ignored.
    """
    raw = os.environ.get("TRUSTED_PROXIES", "").strip()
    if not raw:
        return []
    trusted = []
    for token in raw.replace(";", ",").split(","):
        token = token.strip()
        if not token:
            continue
        try:
            if "/" in token:
                trusted.append(ipaddress.ip_network(token, strict=False))
            else:
                trusted.append(ipaddress.ip_address(token))
        except ValueError:
            continue
    return trusted


_TRUSTED_NETWORKS = _parse_trusted_proxies()


def _is_trusted(ip_str) -> bool:
    if not ip_str:
        return False
    try:
        ip = ipaddress.ip_address(ip_str.strip())
    except ValueError:
        return False
    for net in _TRUSTED_NETWORKS:
        if isinstance(net, ipaddress._BaseNetwork):
            if ip in net:
                return True
        elif ip == net:
            return True
    return False


def get_client_ip(request) -> str:
    """Effective client IP for rate limiting, honoring trusted proxy headers.

    Only ``X-Forwarded-For`` / ``X-Real-IP`` are consulted when the direct
    socket peer is within the ``TRUSTED_PROXIES`` allow-list. Untrusted clients
    (or clients connecting straight to the app) are keyed on the raw socket
    address, so the header cannot be spoofed to rotate rate-limit buckets.
    Falls back to slowapi's default behavior when no proxy is involved.
    """
    peer = request.client.host if request.client else None
    if not _is_trusted(peer):
        return peer or get_remote_address(request)

    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        # Proxies append their peer to the right; walk inward from the last hop
        # and return the first address that is not one of our trusted proxies.
        hops = [hop.strip() for hop in forwarded_for.split(",") if hop.strip()]
        for hop in reversed(hops):
            if not _is_trusted(hop):
                return hop

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        # Set by the trusted reverse proxy from its own remote_addr.
        return real_ip

    return peer


limiter = Limiter(key_func=get_client_ip)
