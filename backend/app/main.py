from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .api import auth
from .limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
# Database schema is now managed externally by Alembic migrations

app = FastAPI(title="Cara AI Outfit Recommendation API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://cara-janavipandoles-projects.vercel.app",],  # update as needed
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)

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

# Include routers here later
from .api import recommendation, products, auth, orders
app.include_router(recommendation.router, prefix="/api/outfit", tags=["outfit"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(auth.router,prefix="/api/auth",tags=["auth"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])