from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .api import auth
from .limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import os
# Database schema is now managed externally by Alembic migrations

app = FastAPI(title="Cara AI Outfit Recommendation API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_DEFAULT_CORS_ORIGINS = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:8080",
    "http://localhost:8080",
    "https://cara-janavipandoles-projects.vercel.app",
    "https://cara-seven-ashen.vercel.app",
]


def _cors_allow_origins() -> list[str]:
    raw = os.environ.get("CORS_ORIGINS", "").strip()
    if not raw:
        return list(_DEFAULT_CORS_ORIGINS)
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)

    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; "
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com; "
        "font-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; "
        "img-src 'self' data: https:;"
    )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=()"
    )

    # HTTPS only
    response.headers["Strict-Transport-Security"] = (
        "max-age=31536000; includeSubDomains"
    )

    # Modern browser protections
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"

    return response

@app.get("/")
def root():
    return {"message": "Cara AI Outfit Recommendation API is running."}


@app.get("/health")
def health():
    return {"status": "ok"}


# Include routers here later
from .api import recommendation, products, auth, orders, address, newsletter, admin, admin_products, profile, ambassador, pricing
app.include_router(recommendation.router, prefix="/api/outfit", tags=["outfit"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(auth.router,prefix="/api/auth",tags=["auth"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(address.router, prefix="/api/address", tags=["address"])
app.include_router(newsletter.router, prefix="/api/newsletter", tags=["newsletter"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(admin_products.router, prefix="/api/admin/products", tags=["admin-products"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(ambassador.router, prefix="/api/ambassador", tags=["ambassador"])
app.include_router(pricing.router, prefix="/api/pricing", tags=["pricing"])


