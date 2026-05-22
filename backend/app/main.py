from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cara AI Outfit Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's a static file, origin might be null or file://
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Cara AI Outfit Recommendation API is running."}

# Include routers here later
from .api import recommendation, products, auth
app.include_router(recommendation.router, prefix="/api/outfit", tags=["outfit"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
