# Cara Production Deployment Guide

## Prerequisites
- Docker Engine 24+ and Docker Compose v2
- (Optional) Node.js 18+ for local frontend linting outside containers

## Local Containerized Deployment

1. Copy environment defaults:
   ```bash
   cp .env.example .env
   ```
   Set a strong `SECRET_KEY` before any public deployment.

2. Start Postgres, FastAPI, and the static frontend:
   ```bash
   docker compose up --build -d
   ```

3. Check health:
   ```bash
   curl -fsS http://localhost:8000/health
   curl -fsS http://localhost:8080/health
   ```

4. Open the store:
   - Frontend: `http://localhost:8080`
   - API docs: `http://localhost:8000/docs`

Services:
| Service | Image / build | Port |
|---------|---------------|------|
| `db` | `postgres:16-alpine` | `5432` |
| `api` | `backend/Dockerfile` (uvicorn) | `8000` |
| `web` | root `Dockerfile` (nginx) | `8080` |

The API runs Alembic migrations on startup. Nginx proxies `/api/*` and `/health` to the API so the static site can use same-origin requests (`CARA_API_BASE_URL` defaults to empty).

Stop everything:
```bash
docker compose down
```

## Backend-only (no Docker)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

## Production Nginx Configuration
Ensure gzip compression, cache control headers for assets, and TLS 1.3 encryption are enabled in your Nginx reverse proxy configuration. The bundled `nginx.conf` is a local-compose helper, not a hardened production TLS config.

## Rate limiting behind a reverse proxy

The API rate-limits login, registration, orders, recommendations, and feedback. By default slowapi keys each request on the **direct socket address** (`request.client.host`), so once traffic flows through nginx/cloud load balancers every request appears to come from the proxy and the whole site shares a single rate-limit bucket.

To keep limits per-user behind a proxy, configure the `TRUSTED_PROXIES` environment variable with the IPs/CIDRs of the proxies that sit in front of the API (comma or semicolon separated):

```bash
TRUSTED_PROXIES=172.16.0.0/12,10.0.0.0/8
```

The rate limiter only honors `X-Forwarded-For` / `X-Real-IP` when the direct peer is in this allow-list, and otherwise falls back to the socket address — so an untrusted client cannot spoof the header to rotate its own rate-limit bucket.

In the bundled Docker Compose stack the nginx container proxies `/api/*` to the API, so the proxy IP will be inside Docker's default bridge network (`172.16.0.0/12` / `172.17.0.0/16`). Set `TRUSTED_PROXIES` accordingly in `.env`:

```bash
TRUSTED_PROXIES=172.16.0.0/12,172.17.0.0/16
```

For uvicorn-managed deployments the equivalent is `--proxy-headers --forwarded-allow-ips <proxy CIDR>`, which rewrites `request.client.host` to the forwarded client IP before slowapi sees it.
