# Cara Production Deployment Guide

## Prerequisites
- Docker Engine 24+ and Docker Compose v2
- (Optional) Node.js 18+ for local frontend linting outside containers

## Local Containerized Deployment

1. Copy environment defaults:
   ```bash
   cp .env.example .env
   ```
   Set a strong `SECRET_KEY` (≥32 chars, e.g. `python -c "import secrets; print(secrets.token_hex(32))"`) and a strong `POSTGRES_PASSWORD` before any deployment — `docker compose` refuses to start without both, and the API refuses to boot with a placeholder/weak `SECRET_KEY`. The database port is no longer published to the host.

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
| `db` | `postgres:16-alpine` | none published (internal only) |
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
