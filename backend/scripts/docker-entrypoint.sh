#!/bin/sh
set -e

echo "Waiting for database..."
python - <<'PY'
import os, time, sys
from urllib.parse import urlparse

url = os.environ.get("DATABASE_URL", "")
if not url or url.startswith("sqlite"):
    sys.exit(0)

parsed = urlparse(url.replace("postgres://", "postgresql://", 1))
host = parsed.hostname or "db"
port = parsed.port or 5432

import socket
deadline = time.time() + 60
while time.time() < deadline:
    try:
        with socket.create_connection((host, port), timeout=2):
            print(f"Database reachable at {host}:{port}")
            sys.exit(0)
    except OSError:
        time.sleep(1)
print("Database not reachable in time", file=sys.stderr)
sys.exit(1)
PY

echo "Running migrations..."
alembic upgrade head

exec "$@"
