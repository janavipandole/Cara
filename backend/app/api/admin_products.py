from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import SessionLocal, get_db
from .auth import get_current_user
from ..vector_search.faiss_index import rebuild_index

router = APIRouter()


def _rebuild_index_in_background():
    """Run the full-catalog index rebuild on its own DB session.

    The request-scoped session from ``get_db()`` is closed once the request
    finishes, so the background job opens a fresh one instead of reusing it.
    """
    db = SessionLocal()
    try:
        rebuild_index(db)
    finally:
        db.close()


def _enforce_admin(user: models.User = Depends(get_current_user)):
    if user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin privilege required")
    return user


@router.post("/", response_model=schemas.Product, status_code=201)
def create_product(
    payload: schemas.ProductCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(_enforce_admin),
):
    existing = db.query(models.Product).filter(models.Product.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Product with this name already exists")
    product = models.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    background_tasks.add_task(_rebuild_index_in_background)
    return product


@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    payload: schemas.ProductCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(_enforce_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    duplicate = (
        db.query(models.Product)
        .filter(models.Product.name == payload.name, models.Product.id != product_id)
        .first()
    )
    if duplicate:
        raise HTTPException(status_code=409, detail="Product with this name already exists")
    for field, value in payload.model_dump().items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    background_tasks.add_task(_rebuild_index_in_background)
    return product


@router.delete("/{product_id}", status_code=200)
def delete_product(
    product_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(_enforce_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    background_tasks.add_task(_rebuild_index_in_background)
    return {"message": "Product deleted successfully"}


@router.patch("/{product_id}/stock")
def update_stock(
    product_id: int,
    stock: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(_enforce_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative")
    product.stock = stock
    db.commit()
    return {"message": "Stock updated", "stock": product.stock}
